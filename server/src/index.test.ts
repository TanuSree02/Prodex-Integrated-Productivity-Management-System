import jwt from "jsonwebtoken";
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
    compare: vi.fn(async () => true),
  },
}));

const {
  healthHandler,
  signupHandler,
  signinHandler,
  meHandler,
  getDataHandler,
  getResourceCategoriesHandler,
  getResourcesByCategoryHandler,
  tasksSyncHandler,
  syncHandler,
} = await import("./index");

const authSecret = "prodex-dev-secret-change-me";
const authUser = {
  id: "u1",
  email: "user@example.com",
  fullName: "User One",
  timezone: "UTC",
  weeklyCapacityHours: 40,
};

function authHeaderFor(userId = authUser.id, email = authUser.email) {
  const token = jwt.sign({ sub: userId, email }, authSecret, { expiresIn: "7d" });
  return `Bearer ${token}`;
}

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

function primeUserDataQueries() {
  prismaMock.user.findUnique.mockResolvedValue(authUser);
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
  prismaMock.user.update.mockResolvedValue(authUser);
  primeUserDataQueries();
});

describe("Backend handlers", () => {
  it("health handler returns service status", async () => {
    const res = createRes();
    await healthHandler({} as never, res as never, vi.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, message: "Prodex backend running" });
  });

  it("signup creates account and returns token", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(authUser);

    const res = createRes();
    await signupHandler(
      {
        body: {
          fullName: "User One",
          email: "user@example.com",
          password: "password123",
          confirmPassword: "password123",
        },
      } as never,
      res as never,
      vi.fn()
    );

    const body = res.body as { token: string; user: { email: string } };
    expect(res.statusCode).toBe(201);
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe("user@example.com");
  });

  it("signin validates credentials and returns token", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ ...authUser, passwordHash: "hashed-password" });

    const res = createRes();
    await signinHandler(
      { body: { email: "user@example.com", password: "password123" } } as never,
      res as never,
      vi.fn()
    );

    const body = res.body as { token: string };
    expect(res.statusCode).toBe(200);
    expect(body.token).toBeTruthy();
  });

  it("me endpoint returns authenticated user", async () => {
    const res = createRes();
    await meHandler(
      { headers: { authorization: authHeaderFor() } } as never,
      res as never,
      vi.fn()
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: { id: authUser.id, fullName: authUser.fullName, email: authUser.email } });
  });

  it("data handler returns 401 without token", async () => {
    const res = createRes();
    await getDataHandler({ headers: {} } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(401);
  });

  it("data handler returns user-scoped payload for authenticated user", async () => {
    const res = createRes();
    await getDataHandler(
      { headers: { authorization: authHeaderFor() } } as never,
      res as never,
      vi.fn()
    );
    const body = res.body as { data: { tasks: { status: string }[] } };
    expect(res.statusCode).toBe(200);
    expect(body.data.tasks[0].status).toBe("in-progress");
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

  it("tasks sync handler validates auth and payload", async () => {
    const res = createRes();
    await tasksSyncHandler({ headers: {}, body: {} } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(400);
  });

  it("tasks sync handler upserts user tasks and returns refreshed tasks", async () => {
    const res = createRes();
    await tasksSyncHandler(
      {
        headers: { authorization: authHeaderFor() },
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

  it("sync handler requires auth", async () => {
    const res = createRes();
    await syncHandler({ headers: {}, body: { settings: {} } } as never, res as never, vi.fn());
    expect(res.statusCode).toBe(401);
  });

  it("sync handler syncs modules for authenticated user", async () => {
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
    };

    const res = createRes();
    await syncHandler(
      { headers: { authorization: authHeaderFor() }, body: payload } as never,
      res as never,
      vi.fn()
    );

    expect(res.statusCode).toBe(200);
    expect(txMock.task.upsert).toHaveBeenCalled();
  });
});
