-- Make Settings global: userId becomes optional and non-unique
DROP INDEX IF EXISTS "Settings_userId_key";

ALTER TABLE "Settings"
ALTER COLUMN "userId" DROP NOT NULL;
