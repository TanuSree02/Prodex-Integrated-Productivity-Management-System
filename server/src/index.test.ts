import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV = "test";

const txMock = {
  task: { upsert: vi.fn() },
  careerGoal: { upsert: vi.fn() },
  careerMilestone: { upsert: vi.fn() },
  jobApplication: { upsert: vi.fn() },
  skill: { upsert: vi.fn() },
  skillAssessment: { upsert: vi.fn() },
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
  },
  careerGoal: {
    findMany: vi.fn(),
  },
  jobApplication: {
    findMany: vi.fn(),
  },
  skill: {
    findMany: vi.fn(),
  },
  resourceCategory: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(async (callback: (tx: typeof txMock) => Promise<void>) => callback(txMock)),
};

vi.mock("@prisma/client", () => {
  class PrismaClient {
    constructor() {
      return prismaMock;
    }
  }
  return { PrismaClient };
});

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hashed-password"),
  },
}));

const {
  healthHandler,
  getDataHandler,
  getResourceCategoriesHandler,
  getResourcesByCategoryHandler,
  tasksSyncHandler,
  syncHandler,
} = await import("./index");

const demoUser = {
  id: "u1",
  email: "demo@prodex.io",
  fullName: "Demo User",
  timezone: "UTC",
  weeklyCapacityHours: 40,
};

function createRes() {
  const res: {
    statusCode: number;
    body: unknown;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  } = {
    statusCode: 200,
    body: undefined,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload: unknown) => {
      res.body = payload;
      return res;
    }),
  };
  return res;
}

function primeDataQueries() {
  prismaMock.user.findUnique.mockResolvedValue(demoUser);
  prismaMock.task.findMany.mockResolvedValue([
    {
      id: "t1",
      title: "Task 1",
      description: "Task desc",
      priority: "high",
      status: "in_progress",
      estimatedHours: 5,
      actualHours: 2,
      deadline: new Date("2026-02-20"),
      weekStart: new Date("2026-02-16"),
      createdAt: new Date("2026-02-15T10:00:00.000Z"),
    },
  ]);
  prismaMock.careerGoal.findMany.mockResolvedValue([
    {
      id: "g1",
      title: "Goal 1",
      category: "technical",
      targetDate: new Date("2026-04-01"),
      description: "Goal desc",
      progressPct: 40,
      createdAt: new Date("2026-02-10T10:00:00.000Z"),
      milestones: [{ id: "m1", title: "Milestone 1", status: "completed" }],
    },
  ]);
  prismaMock.jobApplication.findMany.mockResolvedValue([
    {
      id: "a1",
      companyName: "Acme",
      roleTitle: "Frontend Engineer",
      status: "phone_screen",
      appliedDate: new Date("2026-02-14"),
      jobUrl: "https://acme.example/jobs/1",
      notes: "note",
      createdAt: new Date("2026-02-14T10:00:00.000Z"),
    },
  ]);
  prismaMock.skill.findMany.mockResolvedValue([
    {
      id: "s1",
      name: "React",
      category: "technical",
      assessments: [{ rating: 4, assessedAt: new Date("2026-02-14T12:00:00.000Z") }],
    },
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => Promise<void>) => callback(txMock));
  txMock.task.upsert.mockResolvedValue(undefined);
  txMock.careerGoal.upsert.mockResolvedValue(undefined);
  txMock.careerMilestone.upsert.mockResolvedValue(undefined);
  txMock.jobApplication.upsert.mockResolvedValue(undefined);
  txMock.skill.upsert.mockResolvedValue({ id: "s1" });
  txMock.skillAssessment.upsert.mockResolvedValue(undefined);
  prismaMock.user.update.mockResolvedValue(demoUser);
  primeDataQueries();
});

describe("Backend handlers", () => {
  it("health handler returns service status", async () => {
    const res = createRes();
    await healthHandler({} as never, res as never, vi.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, message: "Prodex backend running" });
  });

  it("data handler returns transformed payload", async () => {
    const res = createRes();
    await getDataHandler({} as never, res as never, vi.fn());
    const body = res.body as { data: { tasks: { status: string }[]; applications: { status: string }[]; settings: { fullName: string; email: string } } };
    expect(res.statusCode).toBe(200);
    expect(body.data.tasks[0].status).toBe("in-progress");
    expect(body.data.applications[0].status).toBe("phone-screen");
    expect(body.data.settings.fullName).toBe("");
    expect(body.data.settings.email).toBe("");
  });

  it("data handler creates demo user when missing", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(demoUser);
    prismaMock.user.create.mockResolvedValue(demoUser);

    const res = createRes();
    await getDataHandler({} as never, res as never, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it("resource categories handler returns dynamic categories with counts", async () => {
    prismaMock.resourceCategory.findMany.mockResolvedValue([
      {
        id: "rc1",
        name: "Frontend",
        slug: "frontend",
        description: "UI resources",
        _count: { resources: 2 },
      },
    ]);

    const res = createRes();
    await getResourceCategoriesHandler({} as never, res as never, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: [
        {
          id: "rc1",
          name: "Frontend",
          slug: "frontend",
          description: "UI resources",
          resourceCount: 2,
        },
      ],
    });
  });

  it("resource by category handler returns category and resources", async () => {
    prismaMock.resourceCategory.findUnique.mockResolvedValue({
      id: "rc1",
      name: "Frontend",
      slug: "frontend",
      description: "UI resources",
      resources: [
        {
          id: "r1",
          title: "React Docs",
          description: "Learn React",
          tags: ["react"],
          url: "https://react.dev/",
        },
      ],
    });

    const res = createRes();
    await getResourcesByCategoryHandler({ params: { slug: "frontend" } } as never, res as never, vi.fn());
    const body = res.body as { data: { category: { slug: string }; resources: { title: string }[] } };
    expect(res.statusCode).toBe(200);
    expect(body.data.category.slug).toBe("frontend");
    expect(body.data.resources[0].title).toBe("React Docs");
  });

  it("resource by category handler returns 404 for unknown category", async () => {
    prismaMock.resourceCategory.findUnique.mockResolvedValue(null);

    const res = createRes();
    await getResourcesByCategoryHandler({ params: { slug: "unknown" } } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Category not found" });
  });

  it("tasks sync handler validates payload", async () => {
    const res = createRes();
    await tasksSyncHandler({ body: {} } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid task payload" });
  });

  it("tasks sync handler upserts tasks and returns refreshed tasks", async () => {
    const res = createRes();
    await tasksSyncHandler(
      {
        body: {
          tasks: [
            {
              id: "t-new",
              title: "New Task",
              description: "desc",
              priority: "medium",
              status: "todo",
              estimatedHours: 3,
              actualHours: 0,
              deadline: "2026-03-01",
              week: "2026-02-23",
              createdAt: "2026-02-26T00:00:00.000Z",
            },
          ],
        },
      } as never,
      res as never,
      vi.fn()
    );

    const body = res.body as { data: { tasks: unknown[] } };
    expect(res.statusCode).toBe(200);
    expect(txMock.task.upsert).toHaveBeenCalledTimes(1);
    expect(body.data.tasks).toHaveLength(1);
  });

  it("sync handler validates payload", async () => {
    const res = createRes();
    await syncHandler({ body: { tasks: [] } } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Invalid payload" });
  });

  it("sync handler syncs all modules and returns warnings list", async () => {
    const payload = {
      tasks: [
        {
          id: "t1",
          title: "Task One",
          description: "desc",
          priority: "high",
          status: "in-progress",
          estimatedHours: 4,
          actualHours: 1,
          deadline: "2026-03-01",
          week: "2026-02-23",
          createdAt: "2026-02-20T12:00:00.000Z",
        },
      ],
      goals: [
        {
          id: "g1",
          title: "Goal",
          category: "technical",
          targetDate: "2026-05-01",
          description: "desc",
          progress: 50,
          milestones: [{ id: "m1", title: "M1", done: false }],
          createdAt: "2026-02-20T12:00:00.000Z",
        },
      ],
      applications: [
        {
          id: "a1",
          company: "Acme",
          role: "Engineer",
          status: "applied",
          dateApplied: "2026-02-20",
          jobUrl: "https://acme.example/jobs",
          notes: "note",
          createdAt: "2026-02-20T12:00:00.000Z",
        },
      ],
      skills: [
        {
          id: "s1",
          name: "React",
          category: "technical",
          rating: 5,
          assessedAt: "2026-02-20T12:00:00.000Z",
        },
      ],
      settings: {
        fullName: "",
        email: "",
        timezone: "UTC",
        weeklyCapacity: 40,
        showOverloadWarnings: true,
        enableDeadlineReminders: true,
      },
    };

    const res = createRes();
    await syncHandler({ body: payload } as never, res as never, vi.fn());
    const body = res.body as { warnings: string[] };

    expect(res.statusCode).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    expect(txMock.task.upsert).toHaveBeenCalled();
    expect(txMock.careerGoal.upsert).toHaveBeenCalled();
    expect(txMock.jobApplication.upsert).toHaveBeenCalled();
    expect(txMock.skill.upsert).toHaveBeenCalled();
    expect(body.warnings).toEqual([]);
  });

  it("sync handler reports warnings for partially failed modules", async () => {
    let call = 0;
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => Promise<void>) => {
      call += 1;
      if (call === 1) {
        throw new Error("Task transaction failed");
      }
      return callback(txMock);
    });

    const res = createRes();
    await syncHandler(
      {
        body: {
          tasks: [
            {
              id: "t1",
              title: "Task",
              description: "",
              priority: "low",
              status: "todo",
              estimatedHours: 1,
              actualHours: 0,
              deadline: "",
              week: "",
              createdAt: "2026-02-20T12:00:00.000Z",
            },
          ],
          goals: [],
          applications: [],
          skills: [],
          settings: {
            fullName: "",
            email: "",
            timezone: "UTC",
            weeklyCapacity: 40,
            showOverloadWarnings: true,
            enableDeadlineReminders: true,
          },
        },
      } as never,
      res as never,
      vi.fn()
    );

    const body = res.body as { warnings: string[] };
    expect(res.statusCode).toBe(200);
    expect(body.warnings).toContain("tasks");
  });
});
