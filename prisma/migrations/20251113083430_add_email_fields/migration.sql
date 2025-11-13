-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "email_verified" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
