-- Allow custom user skills in UserSkill table without touching SkillCatalog
ALTER TABLE "UserSkill"
  ALTER COLUMN "skillId" DROP NOT NULL,
  ADD COLUMN "customSkillName" TEXT;

-- Ensure each row references either a catalog skill OR a custom name, not both
ALTER TABLE "UserSkill"
  ADD CONSTRAINT "UserSkill_skill_or_custom_check"
  CHECK (
    ("skillId" IS NOT NULL AND "customSkillName" IS NULL)
    OR ("skillId" IS NULL AND "customSkillName" IS NOT NULL)
  );

-- Keep catalog skill uniqueness per user
DROP INDEX IF EXISTS "UserSkill_userId_skillId_key";
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key"
  ON "UserSkill"("userId", "skillId")
  WHERE "skillId" IS NOT NULL;

-- Prevent duplicate custom skills per user (case-insensitive)
CREATE UNIQUE INDEX "UserSkill_userId_customSkillName_lower_key"
  ON "UserSkill"("userId", LOWER("customSkillName"))
  WHERE "customSkillName" IS NOT NULL;

CREATE INDEX "UserSkill_customSkillName_idx" ON "UserSkill"("customSkillName");
