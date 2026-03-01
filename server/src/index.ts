import express, { type RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { PrismaClient, type GoalCategory, type ApplicationStatus } from "@prisma/client";

dotenv.config();

export const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const DEMO_EMAIL = "demo@prodex.io";

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

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash("Prodex@123", 12);
  return prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      fullName: "Demo User",
      timezone: "UTC",
      weeklyCapacityHours: 40,
    },
  });
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

export const getDataHandler: RequestHandler = async (_req, res) => {
  try {
    const user = await ensureDemoUser();
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

export const tasksSyncHandler: RequestHandler = async (req, res) => {
  const payload = req.body as { tasks?: TaskPayload[] };
  if (!payload || !Array.isArray(payload.tasks)) {
    return res.status(400).json({ error: "Invalid task payload" });
  }

  try {
    const user = await ensureDemoUser();

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
    const user = await ensureDemoUser();
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
app.get("/api/v1/data", getDataHandler);
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
