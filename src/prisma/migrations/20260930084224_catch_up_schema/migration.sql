-- CreateEnum
CREATE TYPE "ClassLevel" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'GRADUATED');

-- CreateEnum
CREATE TYPE "LegacyTransactionSource" AS ENUM ('MONEY_PAYMENT', 'MONEY_MANUAL_DEPOSIT', 'MONEY_STRIPE_DEPOSIT', 'MONEY_TRANSFER');

-- AlterEnum
ALTER TYPE "LedgerTransactionPurpose" ADD VALUE 'CABIN_BOOKING';

-- AlterEnum
BEGIN;
CREATE TYPE "OmegaMembershipLevel_new" AS ENUM ('SOELLE', 'SYSKEN', 'DEN_GEMENE_HOB');
ALTER TABLE "OmegaMembershipGroup" ALTER COLUMN "omegaMembershipLevel" TYPE "OmegaMembershipLevel_new" USING ("omegaMembershipLevel"::text::"OmegaMembershipLevel_new");
ALTER TYPE "OmegaMembershipLevel" RENAME TO "OmegaMembershipLevel_old";
ALTER TYPE "OmegaMembershipLevel_new" RENAME TO "OmegaMembershipLevel";
DROP TYPE "public"."OmegaMembershipLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('JOBAD_CREATE', 'JOBAD_READ', 'JOBAD_UPDATE', 'JOBAD_DESTROY', 'OMEGAQUOTES_WRITE', 'OMEGAQUOTES_READ', 'OMBUL_CREATE', 'OMBUL_READ', 'OMBUL_UPDATE', 'OMBUL_DESTROY', 'OMEGA_ORDER_READ', 'OMEGA_ORDER_CREATE', 'CLASS_READ', 'CLASS_ADMIN', 'COMMITTEE_READ', 'COMMITTEE_ADMIN', 'INTEREST_GROUP_ADMIN', 'INTEREST_GROUP_READ', 'MANUAL_GROUP_ADMIN', 'MANUAL_GROUP_READ', 'OMEGA_MEMBERSHIP_GROUP_READ', 'OMEGA_MEMBERSHIP_GROUP_ADMIN', 'STUDY_PROGRAMME_READ', 'STUDY_PROGRAMME_ADMIN', 'LOCKER_ADMIN', 'LOCKER_USE', 'FRONTPAGE_ADMIN', 'USERS_READ', 'USERS_UPDATE', 'USERS_DESTROY', 'USERS_CREATE', 'IMAGE_COLLECTION_CREATE', 'IMAGE_ADMIN', 'EVENT_CREATE', 'EVENT_ADMIN', 'NOTIFICATION_CHANNEL_CREATE', 'NOTIFICATION_CHANNEL_UPDATE', 'NOTIFICATION_SUBSCRIPTION_READ', 'NOTIFICATION_SUBSCRIPTION_READ_OTHER', 'NOTIFICATION_SUBSCRIPTION_UPDATE', 'NOTIFICATION_SUBSCRIPTION_UPDATE_OTHER', 'NOTIFICATION_CREATE', 'MAIL_SEND', 'MAILALIAS_READ', 'MAILALIAS_ADMIN', 'MAILINGLIST_READ', 'MAILINGLIST_ADMIN', 'MAILADDRESS_EXTERNAL_CREATE', 'MAILADDRESS_EXTERNAL_READ', 'MAILADDRESS_EXTERNAL_UPDATE', 'MAILADDRESS_EXTERNAL_DESTROY', 'ADMISSION_TRIAL_ADMIN', 'APIKEY_ADMIN', 'SCREEN_READ', 'SCREEN_ADMIN', 'SCHOOLS_READ', 'SCHOOLS_ADMIN', 'COURSES_READ', 'COURSES_ADMIN', 'COMPANY_READ', 'COMPANY_ADMIN', 'DOTS_ADMIN', 'CABIN_CALENDAR_READ', 'CABIN_BOOKING_CABIN_CREATE', 'CABIN_BOOKING_BED_CREATE', 'CABIN_BOOKING_ADMIN', 'CABIN_ADMIN', 'CABIN_PRODUCTS_ADMIN', 'SHOP_READ', 'SHOP_ADMIN', 'PRODUCT_READ', 'PRODUCT_ADMIN', 'PURCHASE_CREATE', 'PURCHASE_CREATE_ONBEHALF', 'LICENSE_ADMIN', 'PERMISSION_GROUP_READ', 'PERMISSION_GROUP_ADMIN', 'PERMISSION_DEFAULT_ADMIN', 'APPLICATION_ADMIN', 'APPLICATION_WRITE', 'NEW_STUDENT_ADMIN', 'REPORT_ADMIN', 'LEDGER_ADMIN', 'LEDGER_USE', 'FLAIR_ADMIN', 'NEWS_CREATE', 'NEWS_ADMIN');
ALTER TABLE "ApiKey" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TABLE "GroupPermission" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TABLE "DefaultPermission" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- AlterEnum
ALTER TYPE "SpecialCmsArticle" ADD VALUE 'CABIN_PAGE';

-- DropIndex
DROP INDEX "Class_year_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "secret" TEXT NOT NULL,
ADD COLUMN     "totalPrice" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "year",
ADD COLUMN     "level" "ClassLevel" NOT NULL;

-- AlterTable
ALTER TABLE "Committee" ADD COLUMN     "pensioned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "paymentEnd" TIMESTAMP(3),
ADD COLUMN     "paymentStart" TIMESTAMP(3),
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibilityAdminId" INTEGER NOT NULL,
ADD COLUMN     "visibilityRegularId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InterestGroup" ADD COLUMN     "pensioned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LedgerTransaction" ADD COLUMN     "bookingId" INTEGER,
ADD COLUMN     "eventRegistrationId" INTEGER,
ADD COLUMN     "purchaseId" INTEGER;

-- AlterTable
ALTER TABLE "ManualGroup" ADD COLUMN     "pensioned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "ledgerAccountId" INTEGER;

-- AlterTable
ALTER TABLE "StudyProgramme" DROP COLUMN "startYear",
ADD COLUMN     "classLevel" "ClassLevel";

-- CreateTable
CREATE TABLE "CabinSettings" (
    "id" SERIAL NOT NULL,
    "ledgerAccountId" INTEGER,

    CONSTRAINT "CabinSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegacyLedgerTransaction" (
    "ledgerTransactionId" INTEGER NOT NULL,
    "source" "LegacyTransactionSource" NOT NULL,
    "originalId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyLedgerTransaction_pkey" PRIMARY KEY ("ledgerTransactionId")
);

-- CreateTable
CREATE TABLE "_StudyProgrammesFeideHasAlreadyReturned" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudyProgrammesFeideHasAlreadyReturned_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CabinSettings_ledgerAccountId_key" ON "CabinSettings"("ledgerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyLedgerTransaction_source_originalId_key" ON "LegacyLedgerTransaction"("source", "originalId");

-- CreateIndex
CREATE INDEX "_StudyProgrammesFeideHasAlreadyReturned_B_index" ON "_StudyProgrammesFeideHasAlreadyReturned"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_secret_key" ON "Booking"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "Class_level_key" ON "Class"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Event_visibilityAdminId_key" ON "Event"("visibilityAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_visibilityRegularId_key" ON "Event"("visibilityRegularId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_ledgerAccountId_key" ON "Shop"("ledgerAccountId");

-- AddForeignKey
ALTER TABLE "CabinSettings" ADD CONSTRAINT "CabinSettings_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visibilityAdminId_fkey" FOREIGN KEY ("visibilityAdminId") REFERENCES "Visibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_visibilityRegularId_fkey" FOREIGN KEY ("visibilityRegularId") REFERENCES "Visibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_eventRegistrationId_fkey" FOREIGN KEY ("eventRegistrationId") REFERENCES "EventRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyLedgerTransaction" ADD CONSTRAINT "LegacyLedgerTransaction_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyProgrammesFeideHasAlreadyReturned" ADD CONSTRAINT "_StudyProgrammesFeideHasAlreadyReturned_A_fkey" FOREIGN KEY ("A") REFERENCES "StudyProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyProgrammesFeideHasAlreadyReturned" ADD CONSTRAINT "_StudyProgrammesFeideHasAlreadyReturned_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

