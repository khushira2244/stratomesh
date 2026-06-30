import { NextResponse } from "next/server";
import {
  BlockStatus,
  CaseStatus,
  DocumentStatus,
  OrganizationLayer,
  RiskLevel,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ExtractedBlock = {
  name: string;
  status: string;
  inputs?: string[];
  requiredDocs?: string[];
  checks?: Array<
    | string
    | {
      name: string;
      status?: string;
      reason?: string;
      waivedByTeam?: string;
      managerObservationRequired?: boolean;
      canBlockNextTeam?: boolean;
      previousTeamDependency?: string;
      questionedByTeam?: string;
      managerDecision?: string;
      config?: Record<string, unknown>;
    }
  >;
  outputs?: string[];
  responsibleRole?: string;
  observers?: string[];
  slaDays?: number;
  pendingReason?: string;
  routeToNext?: string;
};

type ExtractedData = {
  caseSummary: {
    caseTitle: string;
    caseType: string;
    insuranceType: string;
    happyPath: boolean;
    currentTeam: string;
    currentBlock: string;
    currentStatus: string;
    businessImpact?: string;
  };
  broker: {
    name?: string;
    contactPerson?: string;
    email?: string;
    priority?: string;
  };
  client: {
    companyName: string;
    industry?: string;
    clientType?: string;
    location?: string;
    businessSize?: string;
  };
  policyRequirement: {
    policyType?: string;
    policyStartDate?: string;
    policyEndDate?: string;
    quoteRequiredBy?: string;
    expectedPremiumRange?: string;
    targetPremium?: string;
    totalSumInsured?: string;
    monthEndPriority?: boolean;
  };
  assetSchedule?: unknown[];
  coverageRequired?: string[];
  documents?: {
    received?: string[];
    missing?: string[];
    partial?: string[];
    notApplicable?: string[];
  };
  riskTags?: string[];
  problems?: unknown[];
  teamFlows: Record<string, ExtractedBlock[]>;
};

function safeDate(value?: string): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  // Handles strings like "01 July 2026"
  const fallback = Date.parse(value);
  if (!Number.isNaN(fallback)) return new Date(fallback);

  return null;
}

function toBlockStatus(status?: string): BlockStatus {
  const normalized = status?.toUpperCase();

  if (normalized === "IN_PROGRESS") return BlockStatus.IN_PROGRESS;
  if (normalized === "BLOCKED") return BlockStatus.BLOCKED;
  if (normalized === "COMPLETED") return BlockStatus.COMPLETED;
  if (normalized === "SKIPPED") return BlockStatus.SKIPPED;
  if (normalized === "WAITING") return BlockStatus.WAITING;
  if (normalized === "NOT_APPLICABLE") return BlockStatus.NOT_APPLICABLE;

  return BlockStatus.NOT_STARTED;
}

function toDocumentStatus(status: "received" | "missing" | "partial" | "notApplicable") {
  if (status === "received") return DocumentStatus.RECEIVED;
  if (status === "missing") return DocumentStatus.MISSING;
  if (status === "partial") return DocumentStatus.PARTIAL;
  return DocumentStatus.NOT_REQUIRED;
}

function toCaseStatus(status?: string): CaseStatus {
  const normalized = status?.toUpperCase();

  if (normalized === "BLOCKED") return CaseStatus.BLOCKED;
  if (normalized === "COMPLETED") return CaseStatus.COMPLETED;
  if (normalized === "CLOSED") return CaseStatus.CLOSED;
  if (normalized === "NEEDS_REVIEW") return CaseStatus.NEEDS_REVIEW;

  return CaseStatus.IN_WORKFLOW;
}

function makeCaseCode(companyName: string) {
  const compact = companyName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `INS-${compact}-${Date.now()}`;
}

function blockTypeFromName(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("document") || lower.includes("verification")) return "DOCUMENT_CHECK";
  if (lower.includes("risk") || lower.includes("underwriting")) return "RISK_CHECK";
  if (lower.includes("handoff")) return "HANDOFF";
  if (lower.includes("approval")) return "APPROVAL_GATE";
  if (lower.includes("pricing") || lower.includes("premium")) return "PRICING_CHECK";
  if (lower.includes("finance") || lower.includes("payment") || lower.includes("utr")) return "FINANCE_CHECK";
  if (lower.includes("claims")) return "CLAIMS_CHECK";
  if (lower.includes("observation") || lower.includes("management")) return "OBSERVATION";

  return "WORKFLOW_BLOCK";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Accept both:
    // 1. { data: extractedJson, rawDocumentText, fileName }
    // 2. direct extractedJson object
    const extractedData: ExtractedData = body.data ?? body;

    if (!extractedData?.caseSummary || !extractedData?.teamFlows) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid extracted insurance JSON is required.",
        },
        { status: 400 }
      );
    }

    const rawDocumentText =
      body.rawDocumentText ??
      body.rawText ??
      "Raw broker document text was not provided in this save request.";

    const fileName =
      body.fileName ??
      `${extractedData.client.companyName.replace(/\s+/g, "_")}_extracted_request.md`;

    const result = await prisma.$transaction(
      async (tx) => {
        const organization = await tx.organization.upsert({
          where: {
            id: "guardian-general-insurance",
          },
          update: {},
          create: {
            id: "guardian-general-insurance",
            name: "Guardian General Insurance",
            layer: OrganizationLayer.INSURANCE_COMPANY,
          },
        });

        const teamSeed = [
          { name: "Sales / Relationship", slug: "sales" },
          { name: "Underwriting", slug: "underwriting" },
          { name: "Pricing / Actuarial", slug: "pricing" },
          { name: "Policy Issuance", slug: "policyIssuance" },
          { name: "Finance / Premium Reconciliation", slug: "finance" },
          { name: "Claims", slug: "claims" },
          { name: "Management / Compliance", slug: "management" },
        ];

        for (const team of teamSeed) {
          await tx.team.upsert({
            where: {
              organizationId_slug: {
                organizationId: organization.id,
                slug: team.slug,
              },
            },
            update: {
              name: team.name,
            },
            create: {
              organizationId: organization.id,
              name: team.name,
              slug: team.slug,
            },
          });
        }

        const brokerDoc = await tx.brokerRequestDocument.create({
          data: {
            fileName,
            documentType: "BROKER_REQUEST_EXTRACTED",
            rawText: rawDocumentText,
            extractedJson: extractedData as unknown as Prisma.InputJsonValue,
          },
        });

        const insuranceCase = await tx.insuranceCase.create({
          data: {
            organizationId: organization.id,
            brokerRequestDocumentId: brokerDoc.id,

            caseCode: body.caseCode ?? makeCaseCode(extractedData.client.companyName),
            title: extractedData.caseSummary.caseTitle,
            requestType: extractedData.caseSummary.caseType,
            insuranceType: extractedData.caseSummary.insuranceType,
            status: toCaseStatus(extractedData.caseSummary.currentStatus),

            brokerName: extractedData.broker.name,
            brokerContactPerson: extractedData.broker.contactPerson,
            brokerEmail: extractedData.broker.email,
            brokerPriority: extractedData.broker.priority,

            clientCompanyName: extractedData.client.companyName,
            clientIndustry: extractedData.client.industry,
            clientType: extractedData.client.clientType,
            clientLocation: extractedData.client.location,
            clientBusinessSize: extractedData.client.businessSize,

            expectedPremium: extractedData.policyRequirement.expectedPremiumRange,
            targetPremium: extractedData.policyRequirement.targetPremium,
            sumInsured: extractedData.policyRequirement.totalSumInsured,
            quoteDeadline: safeDate(extractedData.policyRequirement.quoteRequiredBy),
            policyStartDate: safeDate(extractedData.policyRequirement.policyStartDate),
            policyEndDate: safeDate(extractedData.policyRequirement.policyEndDate),
            monthEndPriority: Boolean(extractedData.policyRequirement.monthEndPriority),

            riskLevel: RiskLevel.MEDIUM,
            riskTags: extractedData.riskTags ?? [],

            happyPath: Boolean(extractedData.caseSummary.happyPath),
            businessImpact: extractedData.caseSummary.businessImpact,

            currentTeam: extractedData.caseSummary.currentTeam,
            currentBlockName: extractedData.caseSummary.currentBlock,
            currentStatus: toBlockStatus(extractedData.caseSummary.currentStatus),

            extractedData: extractedData as unknown as Prisma.InputJsonValue,
            assetSchedule: (extractedData.assetSchedule ?? []) as unknown as Prisma.InputJsonValue,
            coverageRequired: Array.isArray(extractedData.coverageRequired)
              ? extractedData.coverageRequired.map(String)
              : [],
            problems: (extractedData.problems ?? []) as unknown as Prisma.InputJsonValue,
          },
        });
        const documentRows = [
          ...(extractedData.documents?.received ?? []).map((name) => ({
            name,
            status: toDocumentStatus("received"),
            isRequired: true,
          })),
          ...(extractedData.documents?.missing ?? []).map((name) => ({
            name,
            status: toDocumentStatus("missing"),
            isRequired: true,
          })),
          ...(extractedData.documents?.partial ?? []).map((name) => ({
            name,
            status: toDocumentStatus("partial"),
            isRequired: true,
          })),
          ...(extractedData.documents?.notApplicable ?? []).map((name) => ({
            name,
            status: toDocumentStatus("notApplicable"),
            isRequired: false,
          })),
        ];

        if (documentRows.length > 0) {
          await tx.caseDocument.createMany({
            data: documentRows.map((doc) => ({
              caseId: insuranceCase.id,
              name: doc.name,
              status: doc.status,
              isRequired: doc.isRequired,
            })),
          });
        }

        for (const [teamKey, blocks] of Object.entries(extractedData.teamFlows)) {
          for (let index = 0; index < blocks.length; index++) {
            const block = blocks[index];

            await tx.caseBlock.create({
              data: {
                caseId: insuranceCase.id,
                teamKey,
                teamName: teamKey,
                name: block.name,
                blockType: blockTypeFromName(block.name),
                order: index + 1,
                status: toBlockStatus(block.status),

                inputs: block.inputs ?? [],
                requiredDocs: block.requiredDocs ?? [],
                checks: (block.checks ?? []) as unknown as Prisma.InputJsonValue,
                output: (block.outputs ?? []) as unknown as Prisma.InputJsonValue,
                responsible: block.responsibleRole,
                observers: block.observers ?? [],
                slaDays: block.slaDays ?? null,
                pendingReason: block.pendingReason ?? "",
                routeToNext: block.routeToNext ?? "",

                config: block as unknown as Prisma.InputJsonValue,
              },
            });
          }
        }

        return tx.insuranceCase.findUnique({
          where: {
            id: insuranceCase.id,
          },
          include: {
            documents: true,
            caseBlocks: {
              orderBy: [
                { teamKey: "asc" },
                { order: "asc" },
              ],
            },
            brokerRequestDocument: true,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Insurance case created from extracted data",
      data: result,
    });
  } catch (error) {
    console.error("Create case from extraction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create insurance case from extraction",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}