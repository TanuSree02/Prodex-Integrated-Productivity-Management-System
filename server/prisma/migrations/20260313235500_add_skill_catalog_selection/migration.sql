-- CreateTable
CREATE TABLE "SkillCatalog" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT,
  "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkillCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCatalog_name_key" ON "SkillCatalog"("name");
CREATE INDEX "SkillCatalog_name_idx" ON "SkillCatalog"("name");
CREATE INDEX "SkillCatalog_category_name_idx" ON "SkillCatalog"("category", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- AddForeignKey
ALTER TABLE "UserSkill"
  ADD CONSTRAINT "UserSkill_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSkill"
  ADD CONSTRAINT "UserSkill_skillId_fkey"
  FOREIGN KEY ("skillId") REFERENCES "SkillCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed core skill catalog entries
INSERT INTO "SkillCatalog" ("id", "name", "icon", "category", "createdAt", "updatedAt") VALUES
  ('sc_python', 'Python', 'python', 'language', NOW(), NOW()),
  ('sc_sql', 'SQL', 'sql', 'database', NOW(), NOW()),
  ('sc_react', 'React', 'react', 'frontend', NOW(), NOW()),
  ('sc_nextjs', 'Next.js', 'nextjs', 'frontend', NOW(), NOW()),
  ('sc_nodejs', 'Node.js', 'nodejs', 'backend', NOW(), NOW()),
  ('sc_java', 'Java', 'java', 'language', NOW(), NOW()),
  ('sc_cpp', 'C++', 'cpp', 'language', NOW(), NOW()),
  ('sc_cloud', 'Cloud', 'cloud', 'cloud', NOW(), NOW()),
  ('sc_aws', 'AWS', 'aws', 'cloud', NOW(), NOW()),
  ('sc_docker', 'Docker', 'docker', 'devops', NOW(), NOW()),
  ('sc_git', 'Git', 'git', 'tooling', NOW(), NOW()),
  ('sc_postgresql', 'PostgreSQL', 'postgresql', 'database', NOW(), NOW()),
  ('sc_mongodb', 'MongoDB', 'mongodb', 'database', NOW(), NOW()),
  ('sc_api', 'API', 'api', 'backend', NOW(), NOW()),
  ('sc_ml', 'Machine Learning', 'machine-learning', 'ai', NOW(), NOW()),
  ('sc_data_science', 'Data Science', 'data-science', 'ai', NOW(), NOW()),
  ('sc_pytorch', 'PyTorch', 'pytorch', 'ai', NOW(), NOW()),
  ('sc_pyspark', 'PySpark', 'pyspark', 'data', NOW(), NOW()),
  ('sc_typescript', 'TypeScript', 'typescript', 'language', NOW(), NOW()),
  ('sc_graphql', 'GraphQL', 'graphql', 'backend', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;
