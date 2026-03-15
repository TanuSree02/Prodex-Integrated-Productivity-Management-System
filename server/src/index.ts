import express, { type RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { Prisma, PrismaClient, type GoalCategory, type ApplicationStatus } from "@prisma/client";
import { z } from "zod";

dotenv.config();

export const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "prodex-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

interface TaskPayload {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done" | "archived";
  estimatedHours: number;
  actualHours: number;
  deadline: string;
  week: string;
  createdAt: string;
}

interface GoalPayload {
  id: string;
  title: string;
  category: "technical" | "leadership" | "education" | "network" | "other";
  targetDate: string;
  description: string;
  progress: number;
  milestones: { id: string; title: string; done: boolean }[];
  createdAt: string;
}

interface ApplicationPayload {
  id: string;
  company: string;
  role: string;
  status: "saved" | "applied" | "phone-screen" | "interview" | "offer" | "rejected" | "withdrawn";
  dateApplied: string;
  jobUrl: string;
  notes: string;
  createdAt: string;
}

interface SkillPayload {
  id: string;
  name: string;
  category: "technical" | "leadership" | "education" | "network" | "other";
  rating: number;
  assessedAt: string;
}

interface SettingsPayload {
  fullName: string;
  email: string;
  timezone: string;
  weeklyCapacity: number;
  showOverloadWarnings: boolean;
  enableDeadlineReminders: boolean;
}

interface SyncPayload {
  tasks: TaskPayload[];
  goals: GoalPayload[];
  applications: ApplicationPayload[];
  skills: SkillPayload[];
  settings: SettingsPayload;
}

interface ResourceCategoryCardPayload {
  id: string;
  name: string;
  slug: string;
  description: string;
  resourceCount: number;
}

interface ResourcePayload {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
}

interface SkillCatalogPayload {
  id: string;
  name: string;
  icon: string;
  category: string;
  selected: boolean;
  custom?: boolean;
}

interface AuthPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please provide a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signinSchema = z.object({
  email: z.string().trim().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

const userSkillsSelectionSchema = z.object({
  skillIds: z.array(z.string().trim().min(1)).max(400),
  customSkills: z.array(z.string().trim().min(1)).max(200).optional().default([]),
});

const DEFAULT_SKILL_CATALOG: Array<{ id: string; name: string; icon: string; category: string }> = [
  { id: "sc_python", name: "Python", icon: "python", category: "language" },
  { id: "sc_sql", name: "SQL", icon: "sql", category: "database" },
  { id: "sc_react", name: "React", icon: "react", category: "frontend" },
  { id: "sc_nextjs", name: "Next.js", icon: "nextjs", category: "frontend" },
  { id: "sc_nodejs", name: "Node.js", icon: "nodejs", category: "backend" },
  { id: "sc_java", name: "Java", icon: "java", category: "language" },
  { id: "sc_cpp", name: "C++", icon: "cpp", category: "language" },
  { id: "sc_cloud", name: "Cloud", icon: "cloud", category: "cloud" },
  { id: "sc_aws", name: "AWS", icon: "aws", category: "cloud" },
  { id: "sc_docker", name: "Docker", icon: "docker", category: "devops" },
  { id: "sc_git", name: "Git", icon: "git", category: "tooling" },
  { id: "sc_postgresql", name: "PostgreSQL", icon: "postgresql", category: "database" },
  { id: "sc_mongodb", name: "MongoDB", icon: "mongodb", category: "database" },
  { id: "sc_api", name: "API", icon: "api", category: "backend" },
  { id: "sc_ml", name: "Machine Learning", icon: "machine-learning", category: "ai" },
  { id: "sc_data_science", name: "Data Science", icon: "data-science", category: "ai" },
  { id: "sc_pytorch", name: "PyTorch", icon: "pytorch", category: "ai" },
  { id: "sc_pyspark", name: "PySpark", icon: "pyspark", category: "data" },
  { id: "sc_typescript", name: "TypeScript", icon: "typescript", category: "language" },
  { id: "sc_graphql", name: "GraphQL", icon: "graphql", category: "backend" },
];

function isMissingSkillCatalogTablesError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("skillcatalog")
    || msg.includes("userskill")
    || msg.includes("relation")
    || msg.includes("does not exist");
}

function slugToId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCatalogCategoryToGoalCategory(category: string): GoalCategory {
  const c = category.toLowerCase();
  if (c === "education") return "education";
  if (c === "leadership") return "leadership";
  if (c === "network") return "network";
  return "technical";
}

function dayString(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function taskStatusToFrontend(status: string): TaskPayload["status"] {
  return status === "in_progress" ? "in-progress" : (status as TaskPayload["status"]);
}

function taskStatusToDb(status: TaskPayload["status"]) {
  return status === "in-progress" ? "in_progress" : status;
}

function appStatusToFrontend(status: string): ApplicationPayload["status"] {
  return status === "phone_screen" ? "phone-screen" : (status as ApplicationPayload["status"]);
}

function appStatusToDb(status: ApplicationPayload["status"]): ApplicationStatus {
  return (status === "phone-screen" ? "phone_screen" : status) as ApplicationStatus;
}

function parseDateMaybe(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function createAuthToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function getUserIdFromAuthHeader(authorizationHeader: unknown): string | null {
  if (typeof authorizationHeader !== "string" || !authorizationHeader.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice(7).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req: express.Request, res: express.Response) {
  const userId = getUserIdFromAuthHeader(req.headers.authorization);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return user;
}

async function getData(userId: string) {
  const [user, tasks, goals, applications, skills] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.careerGoal.findMany({
      where: { userId },
      include: { milestones: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.jobApplication.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.skill.findMany({
      where: { userId },
      include: { assessments: { orderBy: { assessedAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      priority: t.priority,
      status: taskStatusToFrontend(t.status),
      estimatedHours: Number(t.estimatedHours),
      actualHours: Number(t.actualHours),
      deadline: dayString(t.deadline),
      week: dayString(t.weekStart),
      createdAt: t.createdAt.toISOString(),
    })),
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      targetDate: dayString(g.targetDate),
      description: g.description ?? "",
      progress: g.progressPct,
      milestones: g.milestones.map((m) => ({ id: m.id, title: m.title, done: m.status === "completed" })),
      createdAt: g.createdAt.toISOString(),
    })),
    applications: applications.map((a) => ({
      id: a.id,
      company: a.companyName,
      role: a.roleTitle,
      status: appStatusToFrontend(a.status),
      dateApplied: dayString(a.appliedDate),
      jobUrl: a.jobUrl ?? "",
      notes: a.notes ?? "",
      createdAt: a.createdAt.toISOString(),
    })),
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      rating: s.assessments[0]?.rating ?? 3,
      assessedAt: s.assessments[0]?.assessedAt.toISOString() ?? new Date().toISOString(),
    })),
    settings: {
      fullName: "",
      email: "",
      timezone: user?.timezone ?? "UTC",
      weeklyCapacity: Number(user?.weeklyCapacityHours ?? 40),
      showOverloadWarnings: true,
      enableDeadlineReminders: true,
    },
  };
}

export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true, message: "Prodex backend running" });
};

export const signupHandler: RequestHandler = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid signup payload" });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        email,
        passwordHash,
        timezone: "UTC",
        weeklyCapacityHours: 40,
      },
    });

    const token = createAuthToken({ id: user.id, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Signup failed:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
};

export const signinHandler: RequestHandler = async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid signin payload" });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createAuthToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Signin failed:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
};

export const meHandler: RequestHandler = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    console.error("Fetch current user failed:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getDataHandler: RequestHandler = async (_req, res) => {
  try {
    const user = await getAuthenticatedUser(_req, res);
    if (!user) return;

    const data = await getData(user.id);
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const getResourceCategoriesHandler: RequestHandler = async (_req, res) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { resources: true },
        },
      },
    });

    const data: ResourceCategoryCardPayload[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      resourceCount: category._count.resources,
    }));

    res.json({ data });
  } catch (error) {
    console.error("Failed to fetch resource categories:", error);
    res.status(500).json({ error: "Failed to fetch resource categories" });
  }
};

export const getResourcesByCategoryHandler: RequestHandler = async (req, res) => {
  const slugParam = req.params.slug;
  const slug = typeof slugParam === "string" ? slugParam.trim().toLowerCase() : "";
  if (!slug) {
    return res.status(400).json({ error: "Category slug is required" });
  }

  try {
    const category = await prisma.resourceCategory.findUnique({
      where: { slug },
      include: {
        resources: {
          orderBy: [{ createdAt: "desc" }, { title: "asc" }],
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const resources: ResourcePayload[] = category.resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description ?? "",
      tags: resource.tags ?? [],
      url: resource.url,
    }));

    res.json({
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
        },
        resources,
      },
    });
  } catch (error) {
    console.error("Failed to fetch resources by category:", error);
    res.status(500).json({ error: "Failed to fetch resources for category" });
  }
};

async function listSkillCatalogForUser(userId: string, searchQuery = ""): Promise<SkillCatalogPayload[]> {
  const trimmed = searchQuery.trim();
  const where = trimmed
    ? Prisma.sql`WHERE s."name" ILIKE ${`%${trimmed}%`}`
    : Prisma.empty;

  try {
    const rows = await prisma.$queryRaw<
      Array<{ id: string; name: string; icon: string | null; category: string | null; selected: boolean }>
    >(Prisma.sql`
      SELECT
        s."id",
        s."name",
        s."icon",
        s."category",
        CASE WHEN us."id" IS NULL THEN false ELSE true END AS "selected"
      FROM "SkillCatalog" s
      LEFT JOIN "UserSkill" us
        ON us."skillId" = s."id"
        AND us."userId" = ${userId}
      ${where}
      ORDER BY s."name" ASC
    `);

    const customWhere = trimmed
      ? Prisma.sql`AND us."customSkillName" ILIKE ${`%${trimmed}%`}`
      : Prisma.empty;
    const customRows = await prisma.$queryRaw<
      Array<{ id: string; customSkillName: string }>
    >(Prisma.sql`
      SELECT us."id", us."customSkillName"
      FROM "UserSkill" us
      WHERE us."userId" = ${userId}
        AND us."customSkillName" IS NOT NULL
        ${customWhere}
      ORDER BY us."customSkillName" ASC
    `);

    const base = rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? "",
      category: row.category ?? "",
      selected: !!row.selected,
    }));

    const custom = customRows.map((row) => ({
      id: `custom:${row.id}`,
      name: row.customSkillName,
      icon: "other",
      category: "custom",
      selected: true,
      custom: true,
    }));

    const legacySkills = await prisma.skill.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const existingNames = new Set(
      [...base, ...custom].map((item) => item.name.toLowerCase())
    );
    const legacyCustom = legacySkills
      .filter((row) => !existingNames.has(row.name.toLowerCase()))
      .filter((row) => !trimmed || row.name.toLowerCase().includes(trimmed.toLowerCase()))
      .map((row) => ({
        id: `custom:legacy-${row.id}`,
        name: row.name,
        icon: "other",
        category: "custom",
        selected: true,
        custom: true,
      }));

    return [...base, ...custom, ...legacyCustom];
  } catch (error) {
    if (!isMissingSkillCatalogTablesError(error)) throw error;

    const fallbackUserSkills = await prisma.skill.findMany({
      where: { userId },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const selectedNameSet = new Set(fallbackUserSkills.map((s) => s.name.toLowerCase()));
    const mergedCatalog = [...DEFAULT_SKILL_CATALOG];
    for (const row of fallbackUserSkills) {
      const exists = mergedCatalog.some((item) => item.name.toLowerCase() === row.name.toLowerCase());
      if (!exists) {
        mergedCatalog.push({
          id: `legacy_${slugToId(row.name)}`,
          name: row.name,
          icon: "",
          category: "other",
        });
      }
    }

    const filtered = trimmed
      ? mergedCatalog.filter((item) => item.name.toLowerCase().includes(trimmed.toLowerCase()))
      : mergedCatalog;

    return filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        ...item,
        selected: selectedNameSet.has(item.name.toLowerCase()),
      }));
  }
}

export const getSkillsCatalogHandler: RequestHandler = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const q = typeof req.query.q === "string" ? req.query.q : "";
    const data = await listSkillCatalogForUser(user.id, q);
    res.json({ data });
  } catch (error) {
    console.error("Failed to fetch skills catalog:", error);
    res.status(500).json({ error: "Failed to fetch skills catalog" });
  }
};

export const saveUserSkillsHandler: RequestHandler = async (req, res) => {
  const parsed = userSkillsSelectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid skills payload" });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const uniqueSkillIds = Array.from(
      new Set(parsed.data.skillIds.map((id) => id.trim()).filter(Boolean))
    );
    const customSkillsByLower = new Map<string, string>();
    for (const rawName of parsed.data.customSkills) {
      const trimmedName = rawName.trim();
      if (!trimmedName) continue;
      const lower = trimmedName.toLowerCase();
      if (!customSkillsByLower.has(lower)) {
        customSkillsByLower.set(lower, trimmedName);
      }
    }
    const catalogById = new Map(DEFAULT_SKILL_CATALOG.map((item) => [item.id, item]));
    const selectedCatalogNamesLower = new Set(
      uniqueSkillIds
        .map((skillId) => catalogById.get(skillId)?.name.toLowerCase())
        .filter((name): name is string => !!name)
    );
    const normalizedCustomSkills = Array.from(customSkillsByLower.entries())
      .filter(([lower]) => !selectedCatalogNamesLower.has(lower))
      .map(([, original]) => original);

    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`DELETE FROM "UserSkill" WHERE "userId" = ${user.id}`;

        for (const skillId of uniqueSkillIds) {
          await tx.$executeRaw`
            INSERT INTO "UserSkill" ("id", "userId", "skillId", "createdAt")
            SELECT ${randomUUID()}, ${user.id}, s."id", NOW()
            FROM "SkillCatalog" s
            WHERE s."id" = ${skillId}
            ON CONFLICT ("userId", "skillId") DO NOTHING
          `;
        }

        for (const customSkillName of normalizedCustomSkills) {
          await tx.$executeRaw`
            INSERT INTO "UserSkill" ("id", "userId", "skillId", "customSkillName", "createdAt")
            VALUES (${randomUUID()}, ${user.id}, NULL, ${customSkillName}, NOW())
            ON CONFLICT DO NOTHING
          `;
        }
      });
    } catch (error) {
      if (!isMissingSkillCatalogTablesError(error)) throw error;

      const selectedCatalogEntries = uniqueSkillIds
        .map((skillId) => catalogById.get(skillId))
        .filter((item): item is NonNullable<typeof item> => !!item);
      const customSkillEntries = normalizedCustomSkills.filter((name) => !!name);

      await prisma.$transaction(async (tx) => {
        await tx.skillAssessment.deleteMany({ where: { skill: { userId: user.id } } });
        await tx.skill.deleteMany({ where: { userId: user.id } });

        for (const item of [...selectedCatalogEntries, ...customSkillEntries.map((name) => ({
          id: `legacy_custom_${slugToId(name)}`,
          name,
          icon: "",
          category: "other",
        }))]) {
          const created = await tx.skill.create({
            data: {
              userId: user.id,
              name: item.name,
              category: mapCatalogCategoryToGoalCategory(item.category),
            },
          });
          await tx.skillAssessment.create({
            data: {
              skillId: created.id,
              rating: 3,
            },
          });
        }
      });
    }

    const data = await listSkillCatalogForUser(user.id);
    res.json({ data });
  } catch (error) {
    console.error("Failed to save user skills:", error);
    res.status(500).json({ error: "Failed to save selected skills" });
  }
};

export const tasksSyncHandler: RequestHandler = async (req, res) => {
  const payload = req.body as { tasks?: TaskPayload[] };
  if (!payload || !Array.isArray(payload.tasks)) {
    return res.status(400).json({ error: "Invalid task payload" });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    await prisma.$transaction(async (tx) => {
      for (const task of payload.tasks!) {
        await tx.task.upsert({
          where: { id: task.id },
          update: {
            title: task.title,
            description: task.description || null,
            status: taskStatusToDb(task.status),
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            actualHours: task.actualHours,
            deadline: parseDateMaybe(task.deadline),
            weekStart: parseDateMaybe(task.week),
          },
          create: {
            id: task.id,
            userId: user.id,
            title: task.title,
            description: task.description || null,
            status: taskStatusToDb(task.status),
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            actualHours: task.actualHours,
            deadline: parseDateMaybe(task.deadline),
            weekStart: parseDateMaybe(task.week),
            createdAt: parseDateMaybe(task.createdAt) ?? new Date(),
          },
        });
      }
    });

    const data = await getData(user.id);
    res.json({ data: { tasks: data.tasks } });
  } catch (error) {
    console.error("Task sync failed:", error);
    res.status(500).json({
      error: "Failed to sync tasks",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const syncHandler: RequestHandler = async (req, res) => {
  const payload = req.body as SyncPayload;

  if (!payload || !payload.settings) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const syncWarnings: string[] = [];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: payload.settings.fullName || user.fullName,
        timezone: payload.settings.timezone || user.timezone,
        weeklyCapacityHours: payload.settings.weeklyCapacity || 40,
      },
    });

    if (Array.isArray(payload.tasks)) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const task of payload.tasks) {
            await tx.task.upsert({
              where: { id: task.id },
              update: {
                title: task.title,
                description: task.description || null,
                status: taskStatusToDb(task.status),
                priority: task.priority,
                estimatedHours: task.estimatedHours,
                actualHours: task.actualHours,
                deadline: parseDateMaybe(task.deadline),
                weekStart: parseDateMaybe(task.week),
              },
              create: {
                id: task.id,
                userId: user.id,
                title: task.title,
                description: task.description || null,
                status: taskStatusToDb(task.status),
                priority: task.priority,
                estimatedHours: task.estimatedHours,
                actualHours: task.actualHours,
                deadline: parseDateMaybe(task.deadline),
                weekStart: parseDateMaybe(task.week),
                createdAt: parseDateMaybe(task.createdAt) ?? new Date(),
              },
            });
          }
        });
      } catch (error) {
        console.error("Task sync failed:", error);
        syncWarnings.push("tasks");
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const goal of payload.goals) {
          await tx.careerGoal.upsert({
            where: { id: goal.id },
            update: {
              title: goal.title,
              description: goal.description || null,
              category: goal.category as GoalCategory,
              targetDate: parseDateMaybe(goal.targetDate),
              progressPct: goal.progress,
            },
            create: {
              id: goal.id,
              userId: user.id,
              title: goal.title,
              description: goal.description || null,
              category: goal.category as GoalCategory,
              targetDate: parseDateMaybe(goal.targetDate),
              progressPct: goal.progress,
              createdAt: parseDateMaybe(goal.createdAt) ?? new Date(),
            },
          });

          for (const milestone of goal.milestones) {
            await tx.careerMilestone.upsert({
              where: { id: milestone.id },
              update: {
                title: milestone.title,
                status: milestone.done ? "completed" : "pending",
                completedDate: milestone.done ? new Date() : null,
              },
              create: {
                id: milestone.id,
                goalId: goal.id,
                title: milestone.title,
                status: milestone.done ? "completed" : "pending",
                completedDate: milestone.done ? new Date() : null,
              },
            });
          }
        }
      });
    } catch (error) {
      console.error("Goal sync failed:", error);
      syncWarnings.push("goals");
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const appItem of payload.applications) {
          await tx.jobApplication.upsert({
            where: { id: appItem.id },
            update: {
              companyName: appItem.company,
              roleTitle: appItem.role,
              status: appStatusToDb(appItem.status),
              appliedDate: parseDateMaybe(appItem.dateApplied),
              jobUrl: appItem.jobUrl || null,
              notes: appItem.notes || null,
            },
            create: {
              id: appItem.id,
              userId: user.id,
              companyName: appItem.company,
              roleTitle: appItem.role,
              status: appStatusToDb(appItem.status),
              appliedDate: parseDateMaybe(appItem.dateApplied),
              jobUrl: appItem.jobUrl || null,
              notes: appItem.notes || null,
              createdAt: parseDateMaybe(appItem.createdAt) ?? new Date(),
            },
          });
        }
      });
    } catch (error) {
      console.error("Application sync failed:", error);
      syncWarnings.push("applications");
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const skill of payload.skills) {
          const skillName = skill.name.trim();
          if (!skillName) continue;

          const dbSkill = await tx.skill.upsert({
            where: { userId_name: { userId: user.id, name: skillName } },
            update: {
              name: skillName,
              category: skill.category as GoalCategory,
            },
            create: {
              id: skill.id,
              userId: user.id,
              name: skillName,
              category: skill.category as GoalCategory,
              createdAt: parseDateMaybe(skill.assessedAt) ?? new Date(),
            },
          });

          await tx.skillAssessment.upsert({
            where: { id: `${dbSkill.id}-latest` },
            update: {
              rating: skill.rating,
              assessedAt: parseDateMaybe(skill.assessedAt) ?? new Date(),
            },
            create: {
              id: `${dbSkill.id}-latest`,
              skillId: dbSkill.id,
              rating: skill.rating,
              assessedAt: parseDateMaybe(skill.assessedAt) ?? new Date(),
            },
          });
        }
      });
    } catch (error) {
      console.error("Skill sync failed:", error);
      syncWarnings.push("skills");
    }

    const data = await getData(user.id);
    res.json({ data, warnings: syncWarnings });
  } catch (error) {
    console.error("Sync failed:", error);
    res.status(500).json({
      error: "Failed to sync data",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

app.get("/api/health", healthHandler);
app.post("/api/v1/auth/signup", signupHandler);
app.post("/api/v1/auth/signin", signinHandler);
app.get("/api/v1/auth/me", meHandler);
app.get("/api/v1/data", getDataHandler);
app.get("/api/v1/skills/catalog", getSkillsCatalogHandler);
app.post("/api/v1/skills/selection", saveUserSkillsHandler);
app.get("/api/v1/resources/categories", getResourceCategoriesHandler);
app.get("/api/v1/resources/categories/:slug", getResourcesByCategoryHandler);
app.post("/api/v1/tasks/sync", tasksSyncHandler);
app.post("/api/v1/sync", syncHandler);

export function startServer() {
  const port = Number(process.env.PORT || 4000);
  return app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
