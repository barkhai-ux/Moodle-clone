-- Add password column with a default value first
ALTER TABLE "public"."users" ADD COLUMN "password" TEXT DEFAULT 'temp_password_123';

-- Update existing users with a hashed password (this will be replaced by the seed script)
UPDATE "public"."users" SET "password" = '$2a$10$temp.hash.for.existing.users' WHERE "password" = 'temp_password_123';

-- Make password column NOT NULL
ALTER TABLE "public"."users" ALTER COLUMN "password" SET NOT NULL;
ALTER TABLE "public"."users" ALTER COLUMN "password" DROP DEFAULT;
