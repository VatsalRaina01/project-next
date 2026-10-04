-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdByFeideLoginOnProjectNext" BOOLEAN NOT NULL DEFAULT false;

-- Backfill users created on a Feide login. The Feide account's issuedAt is the id token's iat from
-- the login that linked it and is never updated, so a user created by that login has a createdAt
-- right after it. A migrated user that was linked by email keeps its createdAt from OmegaWeb Basic,
-- which lies long before.
UPDATE "User"
SET "createdByFeideLoginOnProjectNext" = true
FROM "FeideAccount"
WHERE "FeideAccount"."userId" = "User"."id"
  AND "User"."createdAt" >= "FeideAccount"."issuedAt" - INTERVAL '10 minutes';
