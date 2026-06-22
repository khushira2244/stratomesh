import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CaseStatus,
  DocumentStatus,
  OrganizationLayer,
  RiskLevel,
  BlockStatus,
} from "@prisma/client";

export async function POST() {
  try {
    // Clean old seed data in correct order
    await prisma.aiSuggestion.deleteMany();
    await prisma.caseBlock.deleteMany();
    await prisma.caseDocument.deleteMany();
    await prisma.insuranceCase.deleteMany();
    await prisma.brokerRequestDocument.deleteMany();
    await prisma.team.deleteMany();
    await prisma.organization.deleteMany();

    const organization = await prisma.organization.create({
      data: {
        name: "Guardian General Insurance",
        layer: OrganizationLayer.INSURANCE_COMPANY,
      },
    });

    await prisma.team.createMany({
      data: [
        {
          organizationId: organization.id,
          name: "Sales / Relationship",
          slug: "sales",
          description:
            "Receives broker requests, checks opportunity quality, validates documents, and coordinates handoff to underwriting.",
        },
        {
          organizationId: organization.id,
          name: "Underwriting",
          slug: "underwriting",
          description:
            "Reviews risk, claim history, coverage requirement, and releases underwriting terms.",
        },
        {
          organizationId: organization.id,
          name: "Pricing / Actuarial",
          slug: "pricing",
          description:
            "Calculates premium, discount/loading, margin, and quote approval.",
        },
        {
          organizationId: organization.id,
          name: "Operations / Policy Issuance",
          slug: "policy-issuance",
          description:
            "Handles binding confirmation, policy drafting, QA, corrections, and issuance.",
        },
        {
          organizationId: organization.id,
          name: "Finance / Premium Reconciliation",
          slug: "finance",
          description:
            "Handles debit note, payment proof, UTR matching, premium allocation, and confirmation.",
        },
        {
          organizationId: organization.id,
          name: "Claims / Surveyor Coordination",
          slug: "claims",
          description:
            "Handles claim intake, documents, surveyor follow-up, review, approval, and settlement.",
        },
        {
          organizationId: organization.id,
          name: "Management / Compliance / Audit",
          slug: "management",
          description:
            "Observes SLA breaches, approvals, audit logs, workflow changes, and business risk.",
        },
      ],
    });

    const fireDoc = await prisma.brokerRequestDocument.create({
      data: {
        fileName: "Fire_Property_New_Policy_Request_ABC_Manufacturing.docx",
        documentType: "BROKER_WORD_REQUEST",
        rawText: `
Broker New Policy Quotation Request

Broker Name: SecureRisk Brokers Pvt Ltd
Contact Person: Rahul Mehta
Email: rahul.mehta@securerisk.example

Client Company: ABC Manufacturing Pvt Ltd
Industry: Manufacturing
Client Type: New Client
Location: Pune, Maharashtra

Request Type: New Policy Quotation
Insurance Type: Fire & Property Insurance
Policy Start Date: 01 July 2026
Quote Required By: 25 June 2026
Expected Premium: ₹42L
Total Sum Insured: ₹12 Cr

Documents Shared:
Proposal Form, Previous Policy Copy, Company Registration / GST, Sum Insured Breakup

Missing Documents:
Claim History, Fire Safety Certificate, Detailed Risk Inspection Report

Broker Remarks:
Please provide quotation urgently as client wants coverage from 01 July 2026.
        `,
        extractedJson: {
          broker: {
            name: "SecureRisk Brokers Pvt Ltd",
            contactPerson: "Rahul Mehta",
            email: "rahul.mehta@securerisk.example",
          },
          client: {
            companyName: "ABC Manufacturing Pvt Ltd",
            industry: "Manufacturing",
            clientType: "New Client",
            location: "Pune, Maharashtra",
          },
          policyRequest: {
            requestType: "New Policy Quotation",
            insuranceType: "Fire & Property Insurance",
            expectedPremium: "₹42L",
            sumInsured: "₹12 Cr",
            policyStartDate: "2026-07-01",
            quoteDeadline: "2026-06-25",
          },
          missingDocuments: [
            "Claim History",
            "Fire Safety Certificate",
            "Detailed Risk Inspection Report",
          ],
        },
      },
    });

    const fireCase = await prisma.insuranceCase.create({
      data: {
        organizationId: organization.id,
        brokerRequestDocumentId: fireDoc.id,
        caseCode: "REQ-INS-001",
        title: "ABC Manufacturing — Fire & Property New Policy",
        requestType: "New Policy Quotation",
        insuranceType: "Fire & Property Insurance",
        status: CaseStatus.NEEDS_REVIEW,

        brokerName: "SecureRisk Brokers Pvt Ltd",
        brokerContactPerson: "Rahul Mehta",
        brokerEmail: "rahul.mehta@securerisk.example",

        clientCompanyName: "ABC Manufacturing Pvt Ltd",
        clientIndustry: "Manufacturing",
        clientType: "New Client",
        clientLocation: "Pune, Maharashtra",

        expectedPremium: "₹42L",
        sumInsured: "₹12 Cr",
        quoteDeadline: new Date("2026-06-25"),
        policyStartDate: new Date("2026-07-01"),
        monthEndPriority: true,

        riskLevel: RiskLevel.HIGH,
        riskTags: [
          "New Client",
          "High Sum Insured",
          "Claim History Missing",
          "Fire Safety Certificate Missing",
          "Month-End Priority",
        ],

        currentBlockName: "Request Received",
        suggestedNextBlock: "Document Completeness Check",
        suggestedRoute: "Query Broker before Underwriting Handoff",

        documents: {
          create: [
            {
              name: "Proposal Form",
              status: DocumentStatus.RECEIVED,
              isRequired: true,
            },
            {
              name: "Previous Policy Copy",
              status: DocumentStatus.RECEIVED,
              isRequired: true,
            },
            {
              name: "Company Registration / GST",
              status: DocumentStatus.RECEIVED,
              isRequired: true,
            },
            {
              name: "Sum Insured Breakup",
              status: DocumentStatus.RECEIVED,
              isRequired: true,
            },
            {
              name: "Claim History",
              status: DocumentStatus.MISSING,
              isRequired: true,
              notes: "Broker said this will be shared later.",
            },
            {
              name: "Fire Safety Certificate",
              status: DocumentStatus.MISSING,
              isRequired: true,
            },
            {
              name: "Detailed Risk Inspection Report",
              status: DocumentStatus.MISSING,
              isRequired: false,
            },
          ],
        },

        caseBlocks: {
          create: [
            {
              name: "Request Received",
              blockType: "REQUEST_INTAKE",
              order: 1,
              status: BlockStatus.COMPLETED,
              responsible: "Priya Sharma",
              observers: ["Sales Manager"],
              slaDays: 1,
              output: {
                result: "Sales case created",
                priority: "High",
              },
            },
            {
              name: "Opportunity Qualification",
              blockType: "REVIEW",
              order: 2,
              status: BlockStatus.IN_PROGRESS,
              responsible: "Priya Sharma",
              observers: ["Sales Manager"],
              slaDays: 1,
              checks: {
                premiumPotential: "High",
                brokerRelationship: "Strategic Broker",
                deadlineFeasibility: "Tight",
              },
              routeRules: {
                qualified: "New / Existing Client Check",
                notQualified: "Closure",
                highValue: "Manager Observation",
              },
            },
            {
              name: "New / Existing Client Check",
              blockType: "DATA_CHECK",
              order: 3,
              status: BlockStatus.NOT_STARTED,
              responsible: "Sales Team Lead",
              observers: ["Sales Manager", "Underwriting Lead"],
              slaDays: 1,
              checks: {
                clientType: "New Client",
                industry: "Manufacturing",
              },
            },
            {
              name: "Document Completeness Check",
              blockType: "DOCUMENT_CHECK",
              order: 4,
              status: BlockStatus.BLOCKED,
              responsible: "Priya Sharma",
              observers: ["Sales Manager", "Underwriting Lead"],
              slaDays: 2,
              requiredDocs: {
                received: [
                  "Proposal Form",
                  "Previous Policy Copy",
                  "Company Registration / GST",
                  "Sum Insured Breakup",
                ],
                missing: ["Claim History", "Fire Safety Certificate"],
              },
              output: {
                result: "Missing Documents",
              },
              routeRules: {
                complete: "Risk Tagging",
                missing: "Query Broker",
                risky: "Manager Observation",
              },
            },
            {
              name: "Query Broker",
              blockType: "EXTERNAL_HANDOFF",
              order: 5,
              status: BlockStatus.NOT_STARTED,
              responsible: "Priya Sharma",
              observers: ["Sales Manager"],
              slaDays: 1,
              outputVisibility: "Broker visible",
              routeRules: {
                responseReceived: "Risk Tagging",
                responseDelayed: "Escalation",
              },
            },
            {
              name: "Risk Tagging",
              blockType: "RISK_CHECK",
              order: 6,
              status: BlockStatus.NOT_STARTED,
              responsible: "Sales Team Lead",
              observers: ["Underwriting Lead", "Sales Manager"],
              slaDays: 1,
              checks: {
                tags: [
                  "New Client",
                  "High Sum Insured",
                  "Claim History Missing",
                  "Fire Safety Certificate Missing",
                  "Month-End Priority",
                ],
              },
            },
            {
              name: "Manager Observation",
              blockType: "OBSERVATION_POINT",
              order: 7,
              status: BlockStatus.NOT_STARTED,
              responsible: "Sales Manager",
              observers: ["Regional Head"],
              slaDays: 1,
              comments:
                "High-value new client with missing critical documents before month-end.",
            },
            {
              name: "Underwriting Handoff",
              blockType: "INTERNAL_HANDOFF",
              order: 8,
              status: BlockStatus.NOT_STARTED,
              responsible: "Priya Sharma",
              observers: ["Sales Manager", "Underwriting Lead"],
              slaDays: 1,
              routeRules: {
                accepted: "Underwriting Review",
                rejected: "Return to Document Completeness Check",
              },
            },
          ],
        },

        aiSuggestions: {
          create: [
            {
              type: "SALES_WORKFLOW",
              title: "Add missing document gate before underwriting",
              suggestion:
                "Claim History and Fire Safety Certificate are missing. Keep Document Completeness Check and Query Broker before Underwriting Handoff.",
              payload: {
                suggestedBlocks: [
                  "Document Completeness Check",
                  "Query Broker",
                  "Manager Observation",
                ],
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Insurance seed data created",
      data: {
        organization,
        createdCase: {
          id: fireCase.id,
          caseCode: fireCase.caseCode,
          title: fireCase.title,
        },
      },
    });
  } catch (error) {
    console.error("Seed insurance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed insurance data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}