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
138. Confirmed git commit and push to GitHub main branch succeeded (`f938d6f`) for deployment-ready code.
139. Provided beginner-friendly, fully free deployment guide (Neon + Render + Vercel) with click-by-click steps and explanations.
140. Guided user at Render 'New Web Service' step to connect GitHub provider and proceed with repo selection for free backend deployment.
141. Diagnosed Render backend deploy failure (`Cannot find module .../server/dist/index`) and provided exact root/build/start configuration fix steps.
142. Verified Render build/start commands are correctly set under server root and provided final steps to complete backend deployment.
143. Confirmed Render environment variable `DATABASE_URL` is set and guided user to save, redeploy, and run Prisma production setup commands.
144. Pointed user to Render Shell location in sidebar (Manage -> Shell) and clarified to open it after deployment turns live.
145. Guided user to diagnose failed Render deployment first via build/runtime logs before shell access, since shell is unavailable on failed revisions.
146. Confirmed Render free plan shell/SSH limitation from user screenshot and switched guidance to no-shell deployment path using pre-deploy commands and local fallback.
147. Provided alternatives to Render free deployment and clarified Vercel free suitability for current split frontend+Express backend architecture.
148. Continued Render-first deployment guidance using free-plan flow (no shell) with pre-deploy migration/seed and manual redeploy steps.
149. Identified locked Pre-Deploy command in Render settings and switched to local migration/seed fallback against Neon before redeploy.
150. Diagnosed Render runtime failure caused by backend start script path mismatch (`dist/index.js` vs built `dist/src/index.js`).
151. Updated backend start script in `server/package.json` to `node dist/src/index.js` for Render runtime compatibility.
152. Re-ran backend build and backend tests after start-script fix; build passed and backend tests passed (11/11).
153. Diagnosed repeated Render failure as deployment of older commit (`f938d6f`) still using outdated start script (`node dist/index.js`) instead of latest fix.
154. Confirmed from Render logs that runtime is still executing `node dist/index.js`; instructed direct Render start-command override to `node dist/src/index.js` and redeploy.
155. Verified Render settings now point Start Command to `node dist/src/index.js` and instructed user to save changes and redeploy latest commit.
156. Confirmed Render backend deployment is live (green deploy status for commit 7a10822) and proceeded to frontend deployment guidance.
157. Diagnosed Vercel deployment failure as pnpm frozen-lockfile mismatch due outdated `pnpm-lock.yaml` vs current `package.json`; provided npm-based deployment fix.
158. Clarified Vercel navigation issue: user was in Team settings; provided correct Project-level path for Build & Development install command.
159. Confirmed Vercel project deployment is Ready on commit 5e35c99; pnpm lockfile issue resolved.
160. Mapped current Vercel UI path to access project env settings from deployment card (`Deployment Settings`) when top-right menu lacks Settings entry.
161. Guided user from Vercel deployment details panel to project environment variables page using in-app Find/search fallback path.
162. Confirmed Vercel environment variable is correctly configured and provided exact redeploy steps to apply env changes.
163. Guided user to open Vercel deployment history from Overview and use per-deployment menu to redeploy after environment variable updates.
164. Confirmed Vercel has a fresh Ready/Current production deployment after env var setup and moved to final live-app verification steps.
165. Provided exact Vercel redeploy steps from Deployments list view, including row menu path and alternative git-push trigger.
166. Confirmed user reached Vercel deployment details page and provided direct redeploy path from the top-right actions.
167. User confirmed Vercel redeploy was triggered; proceeding with final end-to-end production verification steps.
168. Started UI polish pass to improve user-friendliness and visual appeal while preserving existing functionality.
169. Enhanced global design tokens and base styles in `app/globals.css` with subtle gradient background, improved text rendering, reusable surface/input utility classes, and selection styling.
170. Refined app shell in `components/prodex/page-shell.tsx` with upgraded sidebar branding/footer, improved active nav treatment, sticky translucent header, and better content spacing.
171. Updated `app/(app)/dashboard/page.tsx` with a clearer hero summary section and standardized surface styling for analytics/feed cards.
172. Improved `app/(app)/tasks/page.tsx` UX with a task-board intro section, elevated filter bar container, and consistent form input styling.
173. Improved `app/(app)/applications/page.tsx` with a tracker intro section, more consistent form input styles, and hover-elevated application rows.
174. Improved `app/(app)/resources/page.tsx` with an intro section, consistent search input styling, and elevated resource category cards.
175. Improved `app/(app)/resources/[categorySlug]/page.tsx` for style consistency (hero section, unified search input, elevated resource cards).
176. Ran full frontend+backend Vitest suite after UI changes; all tests passed (19/19).
177. Provided final optional production monitoring/log-alert setup steps for Render backend, Vercel frontend, and Neon database.
178. Explained why friend signup details are not visible: current app flow is demo/single-user oriented and lacks multi-user admin listing endpoint/UI.
179. Audited existing auth/data architecture and confirmed frontend auth was local-only while backend used demo-user data flow.
180. Added backend JWT authentication foundation in `server/src/index.ts` (token helpers, auth payload types, signup/signin validation schemas).
181. Implemented backend auth endpoints in `server/src/index.ts`: `POST /api/v1/auth/signup`, `POST /api/v1/auth/signin`, `GET /api/v1/auth/me`.
182. Replaced demo-user data access with authenticated-user enforcement in backend handlers for `/api/v1/data`, `/api/v1/tasks/sync`, and `/api/v1/sync`.
183. Ensured user-based task isolation by binding all task reads/writes to authenticated `userId` from JWT.
184. Updated frontend auth provider in `components/prodex/auth-provider.tsx` to use real backend auth APIs, persist JWT, validate session via `/api/v1/auth/me`, and support async login/signup/logout.
185. Updated login form in `app/login/page.tsx` to call real signin API through auth provider with loading/error UX.
186. Updated signup form in `app/signup/page.tsx` to call real signup API through auth provider with password-match validation and loading/error UX.
187. Updated frontend data layer in `components/prodex/data-provider.tsx` to include Bearer token on all data/sync API requests and skip sync/fetch when unauthenticated.
188. Reworked auth provider tests in `components/prodex/auth-provider.test.tsx` to reflect backend-driven signin/session behavior.
189. Updated data provider tests in `components/prodex/data-provider.test.tsx` to initialize auth token before data fetching.
190. Rewrote backend handler test suite in `server/src/index.test.ts` for authenticated architecture and new auth endpoints.
191. Ran full test suite (`npm test` at repo root); all tests passed (20/20).
192. Ran backend TypeScript build (`npm run build` in `server`) after auth changes; build passed.
193. Implemented 3-dot action menus for Application cards in `app/(app)/applications/page.tsx` with `Edit` and `Delete` options.
194. Added full edit flow for Applications (prefilled edit modal + save updates) and wired delete behavior.
195. Implemented 3-dot action menus for Career Goal cards in `app/(app)/career/page.tsx` with `Edit` and `Delete` options.
196. Added full edit flow for Career Goals (prefilled edit modal + save updates) and wired delete behavior.
197. Implemented 3-dot action menus for Skill cards in `app/(app)/career/page.tsx` with `Edit` and `Delete` options.
198. Added full edit flow for Skills (prefilled edit modal + save updates) and wired delete behavior.
199. Ran project test suite (`npm test`); all tests passed (20/20).
200. Started full redesign of Skills section to a database-driven selectable-card experience with search, user-specific persistence, and save flow.
201. Added new Prisma models in `server/prisma/schema.prisma`: `SkillCatalog` and `UserSkill` for global skills + per-user selection mapping.
202. Added migration `server/prisma/migrations/20260313235500_add_skill_catalog_selection/migration.sql` to create `SkillCatalog`/`UserSkill` tables, indexes, relations, and initial catalog seed rows.
203. Implemented backend API in `server/src/index.ts`: `GET /api/v1/skills/catalog` (supports search and selected-state) and `POST /api/v1/skills/selection` (save user-selected skills).
204. Updated backend routes registration to expose the new skills catalog and user selection endpoints.
205. Updated seed script `server/prisma/seed.ts` to populate skills catalog entries and demo user selected skills using SQL statements.
206. Rebuilt `app/(app)/career/page.tsx` Skills tab into modern selectable cards/icons with grey/unselected and colored/selected states, smooth hover, responsive grid, and live search filtering.
207. Added Skills tab actions in `app/(app)/career/page.tsx`: `Back` button and `Continue / Save` button that persists selections and then navigates forward.
208. Preserved Goals functionality in `app/(app)/career/page.tsx`, including existing edit/delete menu and goal progress behaviors.
209. Ran full project test suite (`npm test`); all tests passed (20/20).
210. Ran backend TypeScript build (`npm run build` in `server`); build passed.
211. Diagnosed Skills-page runtime error as non-200 response from `/api/v1/skills/catalog`, which triggered a thrown error in frontend and surfaced as a Next.js console issue overlay.
212. Added frontend resilience in `app/(app)/career/page.tsx`: removed hard throws on skills fetch/save failures and replaced with graceful UI error handling.
213. Added backend fallback logic in `server/src/index.ts` for missing `SkillCatalog`/`UserSkill` tables, so skills can still load from existing user `Skill` data.
214. Added backend fallback save path in `server/src/index.ts` to persist selected skills into legacy `Skill`/`SkillAssessment` tables when new mapping tables are unavailable.
215. Added shared default skills catalog and category mapping helpers in `server/src/index.ts` to support fallback mode without crashing.
216. Re-ran full test suite (`npm test`); all tests passed (20/20).
217. Re-ran backend TypeScript build (`npm run build` in `server`); build passed.
218. Added support for custom user skills by updating `UserSkill` model in `server/prisma/schema.prisma` to allow either `skillId` or `customSkillName`.
219. Added migration `server/prisma/migrations/20260314002000_add_custom_user_skills/migration.sql` to support custom user skills with integrity checks and duplicate-prevention indexes.
220. Updated `GET /api/v1/skills/catalog` in `server/src/index.ts` to return user custom skills along with master catalog skills.
221. Updated `POST /api/v1/skills/selection` in `server/src/index.ts` to accept `customSkills` and persist custom entries only in `UserSkill` (not `SkillCatalog`).
222. Added backend dedupe logic for custom skills (case-insensitive) and avoided duplicate custom-vs-master selections.
223. Updated Skills UI in `app/(app)/career/page.tsx` to include an `Other` card that opens a modal input for custom skill entry.
224. Implemented custom-skill add flow in `app/(app)/career/page.tsx`: save from modal, auto-select, prevent duplicates, and include in save payload.
225. Updated Skills save payload in `app/(app)/career/page.tsx` to send `skillIds` for master skills and `customSkills` for user-only custom values.
226. Kept selected/unselected icon color behavior in Skills cards: selected uses colored icon/text states, unselected remains muted.
227. Removed unnecessary per-keystroke backend fetch for skill search in `app/(app)/career/page.tsx`; filtering now happens in UI over loaded DB skills.
228. Ran full test suite (`npm test`); all tests passed (20/20).
229. Ran backend TypeScript build (`npm run build` in `server`); build passed.
230. Diagnosed custom-skill persistence gap as load path only returning catalog+UserSkill custom rows, missing compatibility read from legacy user `Skill` entries in mixed-schema states.
231. Updated `listSkillCatalogForUser` in `server/src/index.ts` to append legacy user skill names as custom-selected rows when not already present in catalog/custom mappings.
232. Preserved dedupe across catalog, UserSkill custom rows, and legacy skill rows using case-insensitive name matching.
233. Verified custom row hydration now returns both predefined and custom selections after save/reopen cycles, including compatibility with partially migrated environments.
234. Re-ran full test suite (`npm test`); all tests passed (20/20).
235. Re-ran backend TypeScript build (`npm run build` in `server`); build passed.
236. Added top-right `Sign Out` action in app header by updating `components/prodex/page-shell.tsx`.
237. Wired header Sign Out button to auth context `logout()` from `components/prodex/auth-provider.tsx` so users can sign out directly from dashboard/app pages.
238. Ran full test suite (`npm test`) after header logout addition; all tests passed (20/20).
239. Updated top-right Sign Out button color in `components/prodex/page-shell.tsx` to dark blue (`#1F3E69`) with matching border and darker hover state.
240. Diagnosed empty Skills UI in production as empty `SkillCatalog` master table in Neon; provided direct SQL backfill so skills load immediately without redeploy.
241. Fixed likely Skills save 500 by updating `server/src/index.ts` to avoid partial-index conflict target in catalog-skill insert (`ON CONFLICT DO NOTHING` instead of explicit columns).
242. Added backend password-change API in `server/src/index.ts`: `POST /api/v1/auth/change-password` with validation, current-password check, and hash update.
243. Wired Settings password section in `app/(app)/settings/page.tsx` to real backend password-change API with proper loading/error/success handling.
244. Added dark mode infrastructure by wrapping providers with theme support in `components/prodex/providers.tsx` and hydration-safe root html in `app/layout.tsx`.
245. Added dark color tokens/background treatment in `app/globals.css` and theme toggle button in `components/prodex/page-shell.tsx`.
246. Added search field/filtering in Applications page (`app/(app)/applications/page.tsx`) to search by company, role, status, and notes.
247. Improved workload behavior by making new tasks default to current week in `app/(app)/tasks/page.tsx`, so workload updates when adding tasks.
248. Improved workload clarity in `app/(app)/workload/page.tsx` with explicit explanation and week fallback to task creation date when week is missing.
249. Hardened skills save fallback detection in `server/src/index.ts` to handle schema drift cases involving `customSkillName` and old `skillId` NOT NULL constraints.
250. Ran full test suite (`npm test`); all tests passed (20/20).
251. Ran backend TypeScript build (`npm run build` in `server`); build passed.
252. Fixed profile/settings payload returned by backend `getData` in `server/src/index.ts` to include real `fullName` and `email` instead of blank values.
253. Updated settings sync in `server/src/index.ts` to persist `fullName`, `email`, `timezone`, and `weeklyCapacityHours` together with normalization.
254. Added email update conflict handling in `server/src/index.ts` during sync (`P2002` -> `409 Email already in use`).
255. Ensured timezone persistence logic uses selected value directly, preventing IST from being reset to UTC by default fallback behavior.
256. Ran full test suite (`npm test`); all tests passed (20/20).
257. Ran backend TypeScript build (`npm run build` in `server`); build passed.
258. Fixed Profile form reset bug in `app/(app)/settings/page.tsx` by adding dirty-state guards (`profileDirty`, `preferencesDirty`) to prevent in-progress input from being overwritten by background settings sync updates.
259. Updated Profile/Preferences field handlers in `app/(app)/settings/page.tsx` to mark sections dirty on user edits so each input keeps its own typed value.
260. Updated Save logic in `app/(app)/settings/page.tsx` to clear dirty flags after successful profile/preferences save, preserving expected re-hydration behavior.
261. Ran full test suite (`npm test`) after Settings form-state fix; all tests passed (20/20).
262. Updated settings form hydration in `app/(app)/settings/page.tsx` to wait until data loading completes before populating profile fields from backend state.
263. Disabled browser autofill for Profile Full Name and Email inputs in `app/(app)/settings/page.tsx` to prevent automatic non-DB prefilled values.
264. Preserved server-driven profile loading behavior so fields only show values returned from logged-in user's backend settings payload.
265. Ran full test suite (`npm test`) after profile autofill/hydration fix; all tests passed (20/20).
266. Updated dark-mode color tokens in `app/globals.css` to requested palette: sidebar `#0F172A`, main background `#020617`, card background `#1E293B`, and light text.
267. Updated dark-mode sidebar hover/active accent in `app/globals.css` to slightly lighter tone (`#1E293B`) as requested.
268. Refactored sidebar styling in `components/prodex/page-shell.tsx` to use sidebar theme tokens instead of primary color, applying the new dark sidebar across Dashboard/Tasks/Applications/Career/Resources/Settings.
269. Verified no layout changes were introduced; updates were color-token and class-only.
270. Ran full test suite (`npm test`) after dark sidebar color update; all tests passed (20/20).
271. Updated Skills icon rendering in `app/(app)/career/page.tsx` to use skill-specific, logo-like icons per skill key (Python, React, AWS, Docker, Git, MongoDB, PostgreSQL, Node.js, Next.js, C++, SQL, API, etc.) while keeping existing card/grid layout unchanged.
272. Added icon normalization logic in `app/(app)/career/page.tsx` so skills map to correct icon even when based on skill name fallback.
273. Added explicit generic fallback icon strategy in `app/(app)/career/page.tsx` (database/code/cpu variants) so no skill card renders without an icon.
274. Kept custom skills (`Other`) on generic icon path in `app/(app)/career/page.tsx` per requirement.
275. Preserved selected/unselected icon visibility with colored active state and muted inactive state for dark-mode readability.
276. Ran full test suite (`npm test`) after skills icon update; all tests passed (20/20).
277. Re-validated Skills icon UI update on request: confirmed `app/(app)/career/page.tsx` keeps existing card/grid layout and test suite remains passing (20/20).
278. Added smooth hover scale animation to sidebar navigation items in `/components/prodex/page-shell.tsx` so Dashboard/Tasks/Workload/Applications/Career/Resources/Support/Settings slightly grow on mouse-over and return on mouse-out.
279. Added global button press animation in `/app/globals.css` using active-state scale down (`scale(0.97)`) with smooth transitions to create tactile click feedback.
280. Ran full test suite (`npm test`); all tests passed (20/20) after sidebar/button animation updates.
281. Re-ran full test suite (`npm test -- --run`) on latest code; all test files passed (4/4) and all tests passed (20/20).
