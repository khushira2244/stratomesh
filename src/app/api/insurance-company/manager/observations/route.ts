import { NextResponse } from "next/server";
import { BlockStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        name: "Guardian General Insurance",
      },
      select: {
        id: true,
        name: true,
        layer: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          message: "Insurance organization not found.",
        },
        { status: 404 }
      );
    }

    const cases = await prisma.insuranceCase.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        documents: true,
        caseBlocks: {
          orderBy: [
            { teamKey: "asc" },
            { order: "asc" },
          ],
        },
      },
    });

    const blockedBlocks = cases.flatMap((insuranceCase) =>
      insuranceCase.caseBlocks
        .filter((block) => block.status === BlockStatus.BLOCKED)
        .map((block) => ({
          caseId: insuranceCase.id,
          caseCode: insuranceCase.caseCode,
          caseTitle: insuranceCase.title,
          clientCompanyName: insuranceCase.clientCompanyName,
          insuranceType: insuranceCase.insuranceType,
          expectedPremium: insuranceCase.expectedPremium,
          targetPremium: insuranceCase.targetPremium,
          sumInsured: insuranceCase.sumInsured,
          teamKey: block.teamKey,
          blockId: block.id,
          blockName: block.name,
          responsible: block.responsible,
          observers: block.observers,
          pendingReason: block.pendingReason,
          slaDays: block.slaDays,
          businessImpact: insuranceCase.businessImpact,
          routeToNext: block.routeToNext,
        }))
    );

    const waitingBlocks = cases.flatMap((insuranceCase) =>
      insuranceCase.caseBlocks
        .filter((block) => block.status === BlockStatus.WAITING)
        .map((block) => ({
          caseId: insuranceCase.id,
          caseCode: insuranceCase.caseCode,
          caseTitle: insuranceCase.title,
          clientCompanyName: insuranceCase.clientCompanyName,
          teamKey: block.teamKey,
          blockId: block.id,
          blockName: block.name,
          responsible: block.responsible,
          observers: block.observers,
          pendingReason: block.pendingReason,
          routeToNext: block.routeToNext,
        }))
    );

    const inProgressBlocks = cases.flatMap((insuranceCase) =>
      insuranceCase.caseBlocks
        .filter((block) => block.status === BlockStatus.IN_PROGRESS)
        .map((block) => ({
          caseId: insuranceCase.id,
          caseCode: insuranceCase.caseCode,
          caseTitle: insuranceCase.title,
          clientCompanyName: insuranceCase.clientCompanyName,
          teamKey: block.teamKey,
          blockId: block.id,
          blockName: block.name,
          responsible: block.responsible,
          observers: block.observers,
          routeToNext: block.routeToNext,
        }))
    );

    const documentProblems = cases.flatMap((insuranceCase) =>
      insuranceCase.documents
        .filter((doc) => doc.status === "MISSING" || doc.status === "PARTIAL")
        .map((doc) => ({
          caseId: insuranceCase.id,
          caseCode: insuranceCase.caseCode,
          caseTitle: insuranceCase.title,
          clientCompanyName: insuranceCase.clientCompanyName,
          documentId: doc.id,
          documentName: doc.name,
          status: doc.status,
          owner: doc.owner,
          notes: doc.notes,
          isRequired: doc.isRequired,
        }))
    );

    const teamSummaryMap = new Map<
      string,
      {
        teamKey: string;
        totalBlocks: number;
        blocked: number;
        waiting: number;
        inProgress: number;
        completed: number;
        notStarted: number;
        notApplicable: number;
      }
    >();

    for (const insuranceCase of cases) {
      for (const block of insuranceCase.caseBlocks) {
        const existing =
          teamSummaryMap.get(block.teamKey) ??
          {
            teamKey: block.teamKey,
            totalBlocks: 0,
            blocked: 0,
            waiting: 0,
            inProgress: 0,
            completed: 0,
            notStarted: 0,
            notApplicable: 0,
          };

        existing.totalBlocks += 1;

        if (block.status === BlockStatus.BLOCKED) existing.blocked += 1;
        if (block.status === BlockStatus.WAITING) existing.waiting += 1;
        if (block.status === BlockStatus.IN_PROGRESS) existing.inProgress += 1;
        if (block.status === BlockStatus.COMPLETED) existing.completed += 1;
        if (block.status === BlockStatus.NOT_STARTED) existing.notStarted += 1;
        if (block.status === BlockStatus.NOT_APPLICABLE) existing.notApplicable += 1;

        teamSummaryMap.set(block.teamKey, existing);
      }
    }

    const monthEndPriorityCases = cases
      .filter((insuranceCase) => insuranceCase.monthEndPriority)
      .map((insuranceCase) => ({
        id: insuranceCase.id,
        caseCode: insuranceCase.caseCode,
        title: insuranceCase.title,
        clientCompanyName: insuranceCase.clientCompanyName,
        insuranceType: insuranceCase.insuranceType,
        currentTeam: insuranceCase.currentTeam,
        currentBlockName: insuranceCase.currentBlockName,
        currentStatus: insuranceCase.currentStatus,
        quoteDeadline: insuranceCase.quoteDeadline,
        targetPremium: insuranceCase.targetPremium,
        sumInsured: insuranceCase.sumInsured,
        businessImpact: insuranceCase.businessImpact,
      }));

    const activeCases = cases.map((insuranceCase) => ({
      id: insuranceCase.id,
      caseCode: insuranceCase.caseCode,
      title: insuranceCase.title,
      clientCompanyName: insuranceCase.clientCompanyName,
      insuranceType: insuranceCase.insuranceType,
      status: insuranceCase.status,
      happyPath: insuranceCase.happyPath,
      currentTeam: insuranceCase.currentTeam,
      currentBlockName: insuranceCase.currentBlockName,
      currentStatus: insuranceCase.currentStatus,
      targetPremium: insuranceCase.targetPremium,
      sumInsured: insuranceCase.sumInsured,
      businessImpact: insuranceCase.businessImpact,
      blockedBlocks: insuranceCase.caseBlocks.filter(
        (block) => block.status === BlockStatus.BLOCKED
      ).length,
      waitingBlocks: insuranceCase.caseBlocks.filter(
        (block) => block.status === BlockStatus.WAITING
      ).length,
      inProgressBlocks: insuranceCase.caseBlocks.filter(
        (block) => block.status === BlockStatus.IN_PROGRESS
      ).length,
      completedBlocks: insuranceCase.caseBlocks.filter(
        (block) => block.status === BlockStatus.COMPLETED
      ).length,
      missingDocuments: insuranceCase.documents.filter(
        (doc) => doc.status === "MISSING"
      ).length,
      partialDocuments: insuranceCase.documents.filter(
        (doc) => doc.status === "PARTIAL"
      ).length,
    }));

    return NextResponse.json({
      success: true,
      organization,
      summary: {
        totalCases: cases.length,
        activeCases: cases.filter((item) => item.status !== "CLOSED").length,
        blockedCases: cases.filter((item) =>
          item.caseBlocks.some((block) => block.status === BlockStatus.BLOCKED)
        ).length,
        monthEndPriorityCases: monthEndPriorityCases.length,
        blockedBlocks: blockedBlocks.length,
        waitingBlocks: waitingBlocks.length,
        inProgressBlocks: inProgressBlocks.length,
        documentProblems: documentProblems.length,
      },
      data: {
        activeCases,
        teamSummary: Array.from(teamSummaryMap.values()),
        blockedBlocks,
        waitingBlocks,
        inProgressBlocks,
        documentProblems,
        monthEndPriorityCases,
      },
    });
  } catch (error) {
    console.error("Get manager observations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get manager observations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}