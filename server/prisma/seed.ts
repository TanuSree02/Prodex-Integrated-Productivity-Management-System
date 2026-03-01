import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

function dayOffset(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash("Prodex@123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@prodex.io" },
    update: {
      fullName: "Demo User",
      timezone: "EST",
      weeklyCapacityHours: 40,
    },
    create: {
      email: "demo@prodex.io",
      passwordHash,
      fullName: "Demo User",
      weeklyCapacityHours: 40,
      timezone: "EST",
    },
  });

  await prisma.timeLog.deleteMany({ where: { userId: user.id } });
  await prisma.taskTag.deleteMany({ where: { task: { userId: user.id } } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });

  await prisma.careerMilestone.deleteMany({ where: { goal: { userId: user.id } } });
  await prisma.careerGoal.deleteMany({ where: { userId: user.id } });

  await prisma.applicationEvent.deleteMany({ where: { application: { userId: user.id } } });
  await prisma.jobApplication.deleteMany({ where: { userId: user.id } });

  await prisma.skillAssessment.deleteMany({ where: { skill: { userId: user.id } } });
  await prisma.skill.deleteMany({ where: { userId: user.id } });

  await prisma.task.createMany({
    data: [
      {
        id: "t1",
        userId: user.id,
        title: "Redesign onboarding flow",
        description: "Improve first-time user experience",
        status: "in_progress",
        priority: "critical",
        estimatedHours: 12,
        actualHours: 6,
        deadline: dayOffset(3),
        weekStart: dayOffset(0),
      },
      {
        id: "t2",
        userId: user.id,
        title: "Set up CI/CD pipeline",
        description: "Automate test and deploy workflow",
        status: "todo",
        priority: "high",
        estimatedHours: 8,
        actualHours: 0,
        deadline: dayOffset(5),
        weekStart: dayOffset(0),
      },
      {
        id: "t3",
        userId: user.id,
        title: "Performance audit report",
        description: "Collect Lighthouse and core web vitals",
        status: "done",
        priority: "medium",
        estimatedHours: 4,
        actualHours: 3,
        deadline: dayOffset(-2),
        weekStart: dayOffset(-7),
      },
    ],
  });

  await prisma.careerGoal.create({
    data: {
      id: "g1",
      userId: user.id,
      title: "Master System Design",
      description: "Prepare for senior engineering interviews",
      category: "technical",
      status: "active",
      targetDate: dayOffset(90),
      progressPct: 45,
      milestones: {
        create: [
          { id: "m1", title: "Complete core modules", status: "completed", completedDate: dayOffset(-3) },
          { id: "m2", title: "Practice 10 design prompts", status: "pending" },
        ],
      },
    },
  });

  await prisma.jobApplication.createMany({
    data: [
      {
        id: "a1",
        userId: user.id,
        companyName: "Vercel",
        roleTitle: "Frontend Engineer",
        status: "interview",
        appliedDate: dayOffset(-10),
        jobUrl: "https://vercel.com/careers",
        notes: "Technical round next week",
      },
      {
        id: "a2",
        userId: user.id,
        companyName: "Stripe",
        roleTitle: "Full Stack Engineer",
        status: "applied",
        appliedDate: dayOffset(-4),
        jobUrl: "https://stripe.com/jobs",
        notes: "Applied via referral",
      },
    ],
  });

  await prisma.skill.create({
    data: {
      id: "s1",
      userId: user.id,
      name: "React",
      category: "technical",
      assessments: {
        create: {
          id: "s1-latest",
          rating: 5,
          assessedAt: dayOffset(-2),
        },
      },
    },
  });

  await prisma.resource.deleteMany();
  await prisma.resourceCategory.deleteMany();

  const categories = await Promise.all([
    prisma.resourceCategory.create({
      data: {
        name: "Frontend",
        slug: "frontend",
        description: "UI engineering guides, frameworks, and component best practices.",
        displayOrder: 1,
      },
    }),
    prisma.resourceCategory.create({
      data: {
        name: "Backend",
        slug: "backend",
        description: "APIs, server architecture, and application logic resources.",
        displayOrder: 2,
      },
    }),
    prisma.resourceCategory.create({
      data: {
        name: "Database",
        slug: "database",
        description: "PostgreSQL, schema design, and query optimization materials.",
        displayOrder: 3,
      },
    }),
    prisma.resourceCategory.create({
      data: {
        name: "Cloud",
        slug: "cloud",
        description: "Deployment, hosting, and cloud platform learning resources.",
        displayOrder: 4,
      },
    }),
  ]);

  const [frontend, backend, database, cloud] = categories;

  await prisma.resource.createMany({
    data: [
      {
        categoryId: frontend.id,
        title: "React Official Docs",
        description: "Modern React patterns and APIs from the core team.",
        url: "https://react.dev/",
        tags: ["react", "ui", "components"],
      },
      {
        categoryId: frontend.id,
        title: "Next.js Learn",
        description: "Hands-on Next.js learning modules for App Router.",
        url: "https://nextjs.org/learn",
        tags: ["nextjs", "app-router"],
      },
      {
        categoryId: backend.id,
        title: "Node.js Documentation",
        description: "Core runtime docs and APIs for backend development.",
        url: "https://nodejs.org/en/docs",
        tags: ["node", "javascript"],
      },
      {
        categoryId: backend.id,
        title: "Express.js Guide",
        description: "Routing and middleware patterns for REST APIs.",
        url: "https://expressjs.com/",
        tags: ["express", "rest-api"],
      },
      {
        categoryId: database.id,
        title: "Prisma Documentation",
        description: "Prisma schema, migrations, and querying references.",
        url: "https://www.prisma.io/docs",
        tags: ["prisma", "orm", "postgresql"],
      },
      {
        categoryId: database.id,
        title: "PostgreSQL Tutorial",
        description: "SQL and Postgres fundamentals from beginner to advanced.",
        url: "https://www.postgresqltutorial.com/",
        tags: ["postgresql", "sql"],
      },
      {
        categoryId: cloud.id,
        title: "Neon Documentation",
        description: "Serverless Postgres setup, branching, and scaling guides.",
        url: "https://neon.tech/docs",
        tags: ["neon", "postgresql", "cloud"],
      },
    ],
  });

  console.log("Seed complete. Demo user: demo@prodex.io / Prodex@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
