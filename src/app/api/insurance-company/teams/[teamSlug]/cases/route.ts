import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { teamSlug } = await context.params;

    const teamBlocks = await prisma.caseBlock.findMany({
      where: {
        teamKey: teamSlug,
      },
      orderBy: [
        {
          case: {
            createdAt: "desc",
          },
        },
        {
          order: "asc",
        },
      ],
      include: {
        case: {
          select: {
            id: true,
            caseCode: true,
            title: true,
            requestType: true,
            insuranceType: true,
            status: true,
            happyPath: true,

            clientCompanyName: true,
            clientIndustry: true,
            clientType: true,

            brokerName: true,
            brokerPriority: true,

            expectedPremium: true,
            targetPremium: true,
            sumInsured: true,
            quoteDeadline: true,
            monthEndPriority: true,

            currentTeam: true,
            currentBlockName: true,
            currentStatus: true,
            businessImpact: true,
            riskTags: true,
            createdAt: true,
          },
        },
      },
    });

    const caseMap = new Map<string, any>();

    for (const block of teamBlocks) {
      const existing = caseMap.get(block.caseId);

      const blockSummary = {
        id: block.id,
        name: block.name,
        order: block.order,
        status: block.status,
        responsible: block.responsible,
        observers: block.observers,
        slaDays: block.slaDays,
        pendingReason: block.pendingReason,
        routeToNext: block.routeToNext,
        isDisabled: block.isDisabled,
      };

      if (!existing) {
        caseMap.set(block.caseId, {
          ...block.case,
          teamSlug,
          teamBlocks: [blockSummary],
          teamBlockCount: 1,
          blockedCount: block.status === "BLOCKED" ? 1 : 0,
          waitingCount: block.status === "WAITING" ? 1 : 0,
          inProgressCount: block.status === "IN_PROGRESS" ? 1 : 0,
          completedCount: block.status === "COMPLETED" ? 1 : 0,
        });
      } else {
        existing.teamBlocks.push(blockSummary);
        existing.teamBlockCount += 1;

        if (block.status === "BLOCKED") existing.blockedCount += 1;
        if (block.status === "WAITING") existing.waitingCount += 1;
        if (block.status === "IN_PROGRESS") existing.inProgressCount += 1;
        if (block.status === "COMPLETED") existing.completedCount += 1;
      }
    }

    const cases = Array.from(caseMap.values());

    return NextResponse.json({
      success: true,
      teamSlug,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error("Get team cases error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get team cases",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}