/*
  Warnings:

  - A unique constraint covering the columns `[caseId,teamKey,order]` on the table `CaseBlock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,slug]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamKey` to the `CaseBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlockStatus" ADD VALUE 'WAITING';
ALTER TYPE "BlockStatus" ADD VALUE 'NOT_APPLICABLE';

-- DropForeignKey
ALTER TABLE "AiSuggestion" DROP CONSTRAINT "AiSuggestion_caseId_fkey";

-- DropForeignKey
ALTER TABLE "CaseBlock" DROP CONSTRAINT "CaseBlock_caseId_fkey";

-- DropForeignKey
ALTER TABLE "CaseDocument" DROP CONSTRAINT "CaseDocument_caseId_fkey";

-- AlterTable
ALTER TABLE "CaseBlock" ADD COLUMN     "config" JSONB,
ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDraggable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pendingReason" TEXT,
ADD COLUMN     "routeToNext" TEXT,
ADD COLUMN     "teamKey" TEXT NOT NULL,
ADD COLUMN     "teamName" TEXT;

-- AlterTable
ALTER TABLE "InsuranceCase" ADD COLUMN     "assetSchedule" JSONB,
ADD COLUMN     "brokerPriority" TEXT,
ADD COLUMN     "businessImpact" TEXT,
ADD COLUMN     "clientBusinessSize" TEXT,
ADD COLUMN     "coverageRequired" TEXT[],
ADD COLUMN     "currentStatus" "BlockStatus",
ADD COLUMN     "currentTeam" TEXT,
ADD COLUMN     "extractedData" JSONB,
ADD COLUMN     "happyPath" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "policyEndDate" TIMESTAMP(3),
ADD COLUMN     "problems" JSONB,
ADD COLUMN     "targetPremium" TEXT;

-- CreateIndex
CREATE INDEX "AiSuggestion_caseId_idx" ON "AiSuggestion"("caseId");

-- CreateIndex
CREATE INDEX "CaseBlock_caseId_idx" ON "CaseBlock"("caseId");

-- CreateIndex
CREATE INDEX "CaseBlock_caseId_teamKey_idx" ON "CaseBlock"("caseId", "teamKey");

-- CreateIndex
CREATE INDEX "CaseBlock_status_idx" ON "CaseBlock"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CaseBlock_caseId_teamKey_order_key" ON "CaseBlock"("caseId", "teamKey", "order");

-- CreateIndex
CREATE INDEX "CaseDocument_caseId_idx" ON "CaseDocument"("caseId");

-- CreateIndex
CREATE INDEX "CaseDocument_status_idx" ON "CaseDocument"("status");

-- CreateIndex
CREATE INDEX "InsuranceCase_organizationId_idx" ON "InsuranceCase"("organizationId");

-- CreateIndex
CREATE INDEX "InsuranceCase_brokerRequestDocumentId_idx" ON "InsuranceCase"("brokerRequestDocumentId");

-- CreateIndex
CREATE INDEX "InsuranceCase_status_idx" ON "InsuranceCase"("status");

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "Team"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_slug_key" ON "Team"("organizationId", "slug");

-- AddForeignKey
ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseBlock" ADD CONSTRAINT "CaseBlock_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
