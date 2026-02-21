import type { Task, Goal, Application, Skill, UserSettings } from "./store"

// Helper to get current week's Monday
function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const now = new Date()
const thisMonday = getMonday(now)

function weekOffset(weeks: number): string {
  const d = new Date(thisMonday)
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().split("T")[0]
}

function dayOffset(days: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export const sampleTasks: Task[] = [
  {
    id: "t1",
    title: "Redesign onboarding flow",
    description: "Create a smoother onboarding experience for new users with progressive disclosure.",
    priority: "critical",
    status: "in-progress",
    estimatedHours: 12,
    actualHours: 6,
    deadline: dayOffset(3),
    week: weekOffset(0),
    createdAt: dayOffset(-5),
  },
  {
    id: "t2",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions with automated tests, linting, and deployment to staging.",
    priority: "high",
    status: "todo",
    estimatedHours: 8,
    actualHours: 0,
    deadline: dayOffset(5),
    week: weekOffset(0),
    createdAt: dayOffset(-3),
  },
  {
    id: "t3",
    title: "Write API documentation",
    description: "Document all REST endpoints with request/response examples using OpenAPI spec.",
    priority: "medium",
    status: "todo",
    estimatedHours: 6,
    actualHours: 0,
    deadline: dayOffset(7),
    week: weekOffset(0),
    createdAt: dayOffset(-2),
  },
  {
    id: "t4",
    title: "Fix authentication bug",
    description: "Token refresh failing silently on mobile browsers, causing forced logouts.",
    priority: "critical",
    status: "in-progress",
    estimatedHours: 4,
    actualHours: 2,
    deadline: dayOffset(1),
    week: weekOffset(0),
    createdAt: dayOffset(-1),
  },
  {
    id: "t5",
    title: "Database query optimization",
    description: "Optimize slow queries on the dashboard analytics page, add proper indexing.",
    priority: "high",
    status: "done",
    estimatedHours: 5,
    actualHours: 4,
    deadline: dayOffset(-1),
    week: weekOffset(0),
    createdAt: dayOffset(-7),
  },
  {
    id: "t6",
    title: "User feedback survey",
    description: "Create and distribute a user satisfaction survey for Q1 review.",
    priority: "low",
    status: "todo",
    estimatedHours: 3,
    actualHours: 0,
    deadline: dayOffset(10),
    week: weekOffset(1),
    createdAt: dayOffset(-4),
  },
  {
    id: "t7",
    title: "Implement dark mode",
    description: "Add theme toggle with system preference detection and persistent user choice.",
    priority: "medium",
    status: "in-progress",
    estimatedHours: 8,
    actualHours: 3,
    deadline: dayOffset(8),
    week: weekOffset(1),
    createdAt: dayOffset(-6),
  },
  {
    id: "t8",
    title: "Migrate to TypeScript",
    description: "Convert remaining JavaScript files in the utils and hooks directories.",
    priority: "high",
    status: "done",
    estimatedHours: 10,
    actualHours: 12,
    deadline: dayOffset(-3),
    week: weekOffset(-1),
    createdAt: dayOffset(-14),
  },
  {
    id: "t9",
    title: "Performance audit report",
    description: "Run Lighthouse audits and compile improvement recommendations.",
    priority: "medium",
    status: "done",
    estimatedHours: 4,
    actualHours: 3,
    deadline: dayOffset(-5),
    week: weekOffset(-1),
    createdAt: dayOffset(-10),
  },
  {
    id: "t10",
    title: "Refactor notification service",
    description: "Decouple email and push notification logic into separate services.",
    priority: "low",
    status: "archived",
    estimatedHours: 6,
    actualHours: 7,
    deadline: dayOffset(-10),
    week: weekOffset(-2),
    createdAt: dayOffset(-20),
  },
  {
    id: "t11",
    title: "Design system tokens update",
    description: "Align color tokens with new brand guidelines across all components.",
    priority: "medium",
    status: "todo",
    estimatedHours: 5,
    actualHours: 0,
    deadline: dayOffset(6),
    week: weekOffset(0),
    createdAt: dayOffset(-2),
  },
  {
    id: "t12",
    title: "Integration tests for checkout",
    description: "Write E2E tests covering the full checkout flow with Stripe test mode.",
    priority: "high",
    status: "in-progress",
    estimatedHours: 7,
    actualHours: 2,
    deadline: dayOffset(4),
    week: weekOffset(0),
    createdAt: dayOffset(-3),
  },
]

export const sampleGoals: Goal[] = [
  {
    id: "g1",
    title: "Master System Design",
    category: "technical",
    targetDate: dayOffset(90),
    description: "Complete system design coursework and practice with mock interviews.",
    progress: 45,
    milestones: [
      { id: "m1", title: "Complete Grokking System Design", done: true },
      { id: "m2", title: "Design 10 systems end-to-end", done: false },
      { id: "m3", title: "Mock interview with senior engineer", done: false },
    ],
    createdAt: dayOffset(-30),
  },
  {
    id: "g2",
    title: "AWS Solutions Architect Certification",
    category: "education",
    targetDate: dayOffset(60),
    description: "Prepare for and pass the AWS Solutions Architect Associate exam.",
    progress: 70,
    milestones: [
      { id: "m4", title: "Complete Udemy course", done: true },
      { id: "m5", title: "Pass 3 practice exams with 80%+", done: true },
      { id: "m6", title: "Schedule and pass the exam", done: false },
    ],
    createdAt: dayOffset(-45),
  },
  {
    id: "g3",
    title: "Build Leadership Skills",
    category: "leadership",
    targetDate: dayOffset(120),
    description: "Develop leadership competencies through mentoring and public speaking.",
    progress: 25,
    milestones: [
      { id: "m7", title: "Mentor 2 junior developers", done: true },
      { id: "m8", title: "Lead a sprint planning session", done: false },
      { id: "m9", title: "Give a tech talk at meetup", done: false },
    ],
    createdAt: dayOffset(-20),
  },
  {
    id: "g4",
    title: "Expand Professional Network",
    category: "network",
    targetDate: dayOffset(150),
    description: "Attend conferences and connect with 50 new professionals in the industry.",
    progress: 15,
    milestones: [
      { id: "m10", title: "Attend 3 tech conferences", done: false },
      { id: "m11", title: "Connect with 50 new professionals", done: false },
    ],
    createdAt: dayOffset(-10),
  },
]

export const sampleApplications: Application[] = [
  {
    id: "a1",
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "interview",
    dateApplied: dayOffset(-14),
    jobUrl: "https://vercel.com/careers",
    notes: "Great culture fit. Had initial phone screen, technical round scheduled for next week.",
    createdAt: dayOffset(-14),
  },
  {
    id: "a2",
    company: "Stripe",
    role: "Full Stack Engineer",
    status: "applied",
    dateApplied: dayOffset(-7),
    jobUrl: "https://stripe.com/jobs",
    notes: "Applied through referral from a former colleague.",
    createdAt: dayOffset(-7),
  },
  {
    id: "a3",
    company: "Linear",
    role: "Product Engineer",
    status: "phone-screen",
    dateApplied: dayOffset(-10),
    jobUrl: "https://linear.app/careers",
    notes: "Phone screen completed. Waiting for next steps.",
    createdAt: dayOffset(-10),
  },
  {
    id: "a4",
    company: "Notion",
    role: "Frontend Engineer",
    status: "saved",
    dateApplied: "",
    jobUrl: "https://notion.so/careers",
    notes: "Interesting role. Need to tailor resume before applying.",
    createdAt: dayOffset(-3),
  },
  {
    id: "a5",
    company: "Figma",
    role: "Design Engineer",
    status: "offer",
    dateApplied: dayOffset(-30),
    jobUrl: "https://figma.com/careers",
    notes: "Offer received! Negotiating compensation package.",
    createdAt: dayOffset(-30),
  },
  {
    id: "a6",
    company: "Airbnb",
    role: "Senior Software Engineer",
    status: "rejected",
    dateApplied: dayOffset(-21),
    jobUrl: "https://airbnb.com/careers",
    notes: "Rejected after onsite. Feedback: need more distributed systems experience.",
    createdAt: dayOffset(-21),
  },
]

export const sampleSkills: Skill[] = [
  { id: "s1", name: "React", category: "technical", rating: 5, assessedAt: dayOffset(-5) },
  { id: "s2", name: "TypeScript", category: "technical", rating: 4, assessedAt: dayOffset(-5) },
  { id: "s3", name: "Next.js", category: "technical", rating: 4, assessedAt: dayOffset(-5) },
  { id: "s4", name: "Node.js", category: "technical", rating: 4, assessedAt: dayOffset(-10) },
  { id: "s5", name: "PostgreSQL", category: "technical", rating: 3, assessedAt: dayOffset(-10) },
  { id: "s6", name: "System Design", category: "education", rating: 3, assessedAt: dayOffset(-15) },
  { id: "s7", name: "AWS", category: "education", rating: 3, assessedAt: dayOffset(-15) },
  { id: "s8", name: "Team Leadership", category: "leadership", rating: 2, assessedAt: dayOffset(-20) },
  { id: "s9", name: "Public Speaking", category: "leadership", rating: 2, assessedAt: dayOffset(-20) },
  { id: "s10", name: "GraphQL", category: "technical", rating: 3, assessedAt: dayOffset(-8) },
  { id: "s11", name: "Docker", category: "technical", rating: 3, assessedAt: dayOffset(-12) },
  { id: "s12", name: "Tailwind CSS", category: "technical", rating: 5, assessedAt: dayOffset(-5) },
]

export const sampleSettings: UserSettings = {
  fullName: "Alex Morgan",
  email: "alex.morgan@prodex.io",
  timezone: "EST",
  weeklyCapacity: 40,
  showOverloadWarnings: true,
  enableDeadlineReminders: true,
}
