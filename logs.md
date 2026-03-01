1. Added frontend test setup (Vitest + Testing Library).
2. Added test config and setup files.
3. Added tests for auth provider, data provider, and utils.
4. Ran tests and fixed JSX/runtime test issues.
5. Re-ran test suite and confirmed all tests passed.
6. Added `README.md`.
7. Added `.gitignore`.
8. Initialized concise numbered `logs.md` tracking.
9. Updated log format per user request (short numbered entries).
10. Reviewed `Prodex_Architecture_Guide.docx` to align database recommendation with architecture.
11. Verified current Neon/Supabase plan details from official docs for free-tier recommendation.
12. Prepared beginner step-by-step setup plan for Neon PostgreSQL, Prisma, and initial Prodex tables.
13. Checked workspace state and confirmed backend `server/` folder is not created yet.
14. Created backend folder `server/` and initialized npm project.
15. Installed backend runtime dependencies (Express, CORS, dotenv, bcrypt, JWT, Zod, Prisma client).
16. Installed backend dev dependencies (Prisma CLI, TypeScript, tsx, type packages).
17. Initialized Prisma structure in backend and created base `prisma/` files.
18. Added backend env files (`.env`, `.env.example`) with Neon/Postgres placeholders.
19. Added backend TypeScript config (`server/tsconfig.json`).
20. Implemented full Prisma schema for Prodex modules and relationships.
21. Added backend scripts in `server/package.json` for dev/build/prisma tasks.
22. Added Express starter API (`server/src/index.ts`) with health endpoint.
23. Added Prisma seed script (`server/prisma/seed.ts`) with demo user and task.
24. Switched Prisma version to v6 for simpler beginner workflow with `DATABASE_URL`.
25. Generated Prisma client successfully from schema.
26. Attempted migration; blocked because `DATABASE_URL` is empty.
27. Verified backend TypeScript build passes.
28. Confirmed user-provided Neon PostgreSQL URL format is valid.
29. Updated `server/.env` with provided `DATABASE_URL`.
30. Ran Prisma migration command for initial schema.
31. Retried migration with elevated permissions after sandbox/schema-engine issues.
32. Ran Prisma in debug mode to diagnose migration failure details.
33. Successfully created and applied initial Prisma migration to Neon database.
34. Skipped Step 3 (seed) as explicitly requested by user.
35. Ran Prisma seed successfully and inserted demo data into Neon database.
36. Added backend DB API endpoints (`/api/v1/data`, `/api/v1/sync`) for frontend realtime data flow.
37. Expanded backend seed script with richer sample tasks, goals, applications, and skills.
38. Replaced frontend `DataProvider` hardcoded sample initialization with API-driven load + autosync + polling.
39. Removed hardcoded profile fallback values in settings page and synced local form state from DB-backed context.
40. Updated frontend data-provider tests to mock API load/sync behavior.
41. Ran frontend test suite; all tests passed (8/8).
42. Ran backend TypeScript build; build passed.
43. Reseeded Neon database with updated sample dataset.
44. Clarified how to run frontend and backend together for local development workflow.
45. Added one-command local run setup using `concurrently` in root `package.json`.
46. Installed new root dependency to support single-command startup for frontend + backend.
47. Fixed frontend data sync race in `DataProvider` (prevent poll overwrite during sync, immediate sync, apply server response).
48. Re-ran frontend tests after sync fix; all tests passed.
49. Implemented stronger local-dirty protection in `DataProvider` to prevent server poll from overwriting unsynced task creations.
50. Re-ran frontend tests after stronger sync fix; all tests passed.
51. Queried Neon DB directly via Prisma to verify persisted task rows for demo user.
52. Confirmed saved data exists in Prisma-managed `Task` table (PascalCase table naming).
53. Verified persisted DB counts for demo user across Task/CareerGoal/JobApplication/Skill and related tables.
54. Hardened backend `/api/v1/sync` skill upsert logic to use unique `userId+name` and avoid full-transaction failures on duplicate skill names.
55. Added backend sync error detail response payload for easier debugging.
56. Improved frontend sync error handling to log exact backend error details when sync fails.
57. Re-ran frontend tests and backend build after sync hardening; all checks passed.
58. Adjusted frontend sync error behavior to non-throwing warning to prevent dev overlay interruption while preserving diagnostics.
59. Re-ran frontend tests after sync warning change; all tests passed.
60. Refactored backend sync flow to isolate tasks/goals/applications/skills into separate transactions so one section failure does not rollback all data.
61. Added sync warnings list in backend response for partial-sync diagnostics.
62. Fixed backend compile regressions from refactor and revalidated TypeScript build.
63. Added dedicated task sync endpoint (`POST /api/v1/tasks/sync`) to handle task create/update/delete independently.
64. Removed task persistence from generic `/api/v1/sync` flow so task DB writes cannot be blocked by other modules.
65. Updated frontend `DataProvider` to sync tasks via `/api/v1/tasks/sync` and keep non-task sync separate.
66. Updated data-provider tests to mock task-specific sync endpoint behavior.
67. Re-ran backend build and frontend tests after task-sync refactor; all checks passed.
68. Fixed task-state overwrite race by ensuring non-task sync updates no longer mutate task state in `DataProvider`.
69. Re-ran frontend tests after task overwrite fix; all tests passed.
70. Updated task sync to stop replacing local tasks with server payload (prevents immediate vanish on create/delete).
71. Re-ran frontend tests after local-task-authority sync change; all tests passed.
72. Fixed frontend `Response` body double-read bug by centralizing sync error parsing (`extractErrorDetails`) to read response body only once.
73. Re-ran frontend tests after response parsing fix; all tests passed.
74. Added frontend fallback: if `/api/v1/tasks/sync` fails, retry task persistence through `/api/v1/sync` with full payload.
75. Restored task persistence logic in backend `/api/v1/sync` for compatibility/reliability.
76. Re-ran backend build and frontend tests after fallback + sync compatibility changes; all checks passed.
77. Added 3-dot action menu on task cards with priority quick-set (Critical/High/Medium/Low) and Delete action.
78. Updated app shell navigation: added Applications and Resources routes in sidebar.
79. Added mobile hamburger menu in app header with full navigation links.
80. Created dedicated Applications page route (`/applications`) for job application management UI.
81. Created Resources page route (`/resources`) with searchable useful learning links.
82. Removed Applications tab/modal from Career page to avoid duplicate location and keep Applications in dedicated route.
83. Re-ran frontend tests after UI/navigation changes; all tests passed.
84. Attempted production build; blocked by network-restricted Google Fonts fetch (environment issue, not app logic).
85. Re-ran frontend test suite on latest changes; all tests passed (8/8).
86. Updated backend sync behavior so frontend deletions no longer delete records from DB tables.
87. Added hidden-item tracking in frontend data provider so deleted items stay removed in website view without deleting backend rows.
88. Added Task card Edit flow (modal) and retained 3-dot priority/delete actions.
89. Added Support route/page and integrated Support into sidebar + hamburger menu.
90. Added Help Form section inside Settings page.
91. Updated app shell so hamburger menu is visible in header and navigation includes Applications/Resources/Support.
92. Updated backend data response defaults so Settings profile no longer pre-fills Demo User / demo@prodex.io.
93. Re-ran frontend tests and backend build after these updates; all checks passed.
94. Changed sidebar behavior: hidden by default, toggled via hamburger, and slide-in/out navigation drawer added.
95. Removed Settings Help Form section as requested.
96. Kept Profile Full Name/Email fields present with empty defaults (no Demo User/demo@prodex.io prefill fallback).
97. Re-ran frontend tests after sidebar/settings updates; all tests passed (8/8).
98. Provided caching strategy guidance tailored to current frontend-backend sync architecture.
99. Reviewed existing resources implementation and confirmed category/resource data was hardcoded in `/app/(app)/resources/page.tsx`.
100. Added Prisma models `ResourceCategory` and `Resource` to `server/prisma/schema.prisma` with slug uniqueness, display order, tags, and relation indexes.
101. Extended seed script (`server/prisma/seed.ts`) to create resource categories and sample resources for Frontend, Backend, Database, and Cloud.
102. Added backend API endpoint `GET /api/v1/resources/categories` to return dynamic resource categories with resource counts.
103. Added backend API endpoint `GET /api/v1/resources/categories/:slug` to return category metadata and its resources.
104. Replaced static resources page with dynamic DB-backed category listing page including search + loading + empty + error + retry states.
105. Added dynamic category route page `/app/(app)/resources/[categorySlug]/page.tsx` to render category header and reusable resource cards with tags and external links.
106. Updated page shell title resolution so nested resource routes (`/resources/<slug>`) display title as “Resources”.
107. Attempted Prisma migration; first run failed with `P1001` temporary database reachability error.
108. Added SQL migration file `server/prisma/migrations/20260222205000_add_resources_catalog/migration.sql` for resource tables and indexes.
109. Generated Prisma client after schema changes (`npx prisma generate`).
110. Ran seed once before migration was applied and received expected `P2021` missing table error (`public.Resource`).
111. Re-ran Prisma migration successfully; migration `20260222205000_add_resources_catalog` applied to Neon and Prisma client regenerated.
112. Re-ran seed successfully; sample resources and categories inserted.
113. Ran backend TypeScript build (`npm run build` in `server`); build passed.
114. Ran frontend test suite (`npm test`); all tests passed (8/8).
115. Attempted frontend production build (`npm run build` at project root); blocked by environment network restriction fetching Google Inter font via `next/font`.
116. Fixed Next.js dynamic route params handling on resources subpage by switching to `useParams()` and safe slug extraction.
117. Updated resources category fetch to use `encodeURIComponent(slug)` and guarded empty-slug behavior.
118. Fixed Retry button on resources category page to re-fetch with resolved slug instead of stale params reference.
119. Hardened `DataProvider` initial/polling fetch flow to avoid throwing on non-OK `/api/v1/data` responses; now logs warning and continues gracefully.
120. Re-ran frontend tests after resources + data-provider fixes; all tests passed (8/8).
121. Audited backend folder and confirmed there were no existing backend test files before adding new tests.
122. Added backend testing dependencies in `server` (`vitest`, `supertest`, `@types/supertest`) and added backend test scripts to `server/package.json`.
123. Refactored backend server bootstrap to export `app` and `startServer()` while preventing auto-listen in test mode.
124. Added backend Vitest config at `server/vitest.config.ts`.
125. Created comprehensive backend test suite at `server/src/index.test.ts` covering health, data fetch, resource endpoints, task sync, full sync validation, success paths, and warning paths.
126. Exported backend route handlers (`healthHandler`, `getDataHandler`, `getResourceCategoriesHandler`, `getResourcesByCategoryHandler`, `tasksSyncHandler`, `syncHandler`) and wired Express routes to those handlers.
127. Reworked backend tests to directly test handlers (req/res mocking) instead of socket-based HTTP to avoid sandbox listen restrictions.
128. Fixed strict TypeScript type issue for resource slug parsing (`string | string[]`) in `getResourcesByCategoryHandler`.
129. Updated `server/tsconfig.json` to exclude test files from production TypeScript build.
130. Updated `server/vitest.config.ts` include/exclude patterns so Vitest runs only source tests (`src/**/*.test.ts`) and ignores `dist` output.
131. Ran backend test suite (`npm test` in `server`); all tests passed (11/11).
132. Ran backend build (`npm run build` in `server`) after test-related refactors; build passed.
133. Removed unused backend test dependencies (`supertest`, `@types/supertest`) after shifting to handler-level testing strategy.
134. Re-ran backend tests after dependency cleanup; all backend tests passed (11/11).
135. Re-ran backend TypeScript build after backend test setup finalization; build passed.
136. Provided deployment guide for full-stack setup (frontend + backend + Neon DB) including environment variables and production rollout steps.
137. Verified user is in correct project directory and confirmed pending git changes before deployment push.
