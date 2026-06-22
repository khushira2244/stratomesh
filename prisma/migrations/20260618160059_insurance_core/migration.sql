/*
  Warnings:

  - You are about to drop the `TestConnection` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrganizationLayer" AS ENUM ('CLIENT_COMPANY', 'BROKER', 'INSURANCE_COMPANY');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('INTAKE', 'NEEDS_REVIEW', 'IN_WORKFLOW', 'BLOCKED', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('RECEIVED', 'MISSING', 'PARTIAL', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'SKIPPED');

-- DropTable
DROP TABLE "TestConnection";

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layer" "OrganizationLayer" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerRequestDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "extractedJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerRequestDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brokerRequestDocumentId" TEXT,
    "caseCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "insuranceType" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'INTAKE',
    "brokerName" TEXT,
    "brokerContactPerson" TEXT,
    "brokerEmail" TEXT,
    "clientCompanyName" TEXT NOT NULL,
    "clientIndustry" TEXT,
    "clientType" TEXT,
    "clientLocation" TEXT,
    "expectedPremium" TEXT,
    "sumInsured" TEXT,
    "quoteDeadline" TIMESTAMP(3),
    "policyStartDate" TIMESTAMP(3),
    "monthEndPriority" BOOLEAN NOT NULL DEFAULT false,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "riskTags" TEXT[],
    "currentBlockName" TEXT,
    "suggestedNextBlock" TEXT,
    "suggestedRoute" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "owner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseBlock" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "BlockStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "inputs" JSONB,
    "requiredDocs" JSONB,
    "checks" JSONB,
    "responsible" TEXT,
    "observers" TEXT[],
    "slaDays" INTEGER,
    "output" JSONB,
    "outputVisibility" TEXT,
    "routeRules" JSONB,
    "comments" TEXT,
    "learningNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "payload" JSONB,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCase_caseCode_key" ON "InsuranceCase"("caseCode");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCase" ADD CONSTRAINT "InsuranceCase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCase" ADD CONSTRAINT "InsuranceCase_brokerRequestDocumentId_fkey" FOREIGN KEY ("brokerRequestDocumentId") REFERENCES "BrokerRequestDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseBlock" ADD CONSTRAINT "CaseBlock_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSuggestion" ADD CONSTRAINT "AiSuggestion_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "InsuranceCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
