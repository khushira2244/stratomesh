import { NextResponse } from "next/server";
import { BlockStatus, CaseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

function caseStatusFromBlockStatus(status: BlockStatus): CaseStatus {
  if (status === BlockStatus.BLOCKED) return CaseStatus.BLOCKED;
  if (status === BlockStatus.COMPLETED) return CaseStatus.COMPLETED;
  return CaseStatus.IN_WORKFLOW;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const blockId = body.blockId as string | undefined;

    const insuranceCase = await prisma.insuranceCase.findUnique({
      where: { id: caseId },
      include: {
        caseBlocks: {
          orderBy: [{ teamKey: "asc" }, { order: "asc" }],
        },
      },
    });

    if (!insuranceCase) {
      return NextResponse.json(
        {
          success: false,
          message: "Insurance case not found",
        },
        { status: 404 }
      );
    }

    const activeBlock =
      insuranceCase.caseBlocks.find((block) => block.id === blockId) ??
      insuranceCase.caseBlocks.find(
        (block) => block.status === BlockStatus.IN_PROGRESS
      );

    if (!activeBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "No active block found. Send blockId or set one block to IN_PROGRESS.",
        },
        { status: 400 }
      );
    }

    if (
      activeBlock.status === BlockStatus.BLOCKED ||
      activeBlock.status === BlockStatus.NOT_APPLICABLE ||
      activeBlock.isDisabled
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This block cannot be progressed.",
          data: {
            blockId: activeBlock.id,
            blockName: activeBlock.name,
            status: activeBlock.status,
            pendingReason: activeBlock.pendingReason,
          },
        },
        { status: 400 }
      );
    }

    const allExecutableBlocks = insuranceCase.caseBlocks
      .filter(
        (block) =>
          !block.isDisabled && block.status !== BlockStatus.NOT_APPLICABLE
      )
      .sort((a, b) => {
        const teamCompare = a.teamKey.localeCompare(b.teamKey);
        if (teamCompare !== 0) return teamCompare;
        return a.order - b.order;
      });

    const currentIndex = allExecutableBlocks.findIndex(
      (block) => block.id === activeBlock.id
    );

    const nextBlock =
      currentIndex >= 0 ? allExecutableBlocks[currentIndex + 1] : null;

    const result = await prisma.$transaction(async (tx) => {
      const completedBlock = await tx.caseBlock.update({
        where: { id: activeBlock.id },
        data: {
          status: BlockStatus.COMPLETED,
          pendingReason: "",
        },
      });

      let startedNextBlock = null;

      if (nextBlock) {
        startedNextBlock = await tx.caseBlock.update({
          where: { id: nextBlock.id },
          data: {
            status: BlockStatus.IN_PROGRESS,
          },
        });

        await tx.insuranceCase.update({
          where: { id: caseId },
          data: {
            status: CaseStatus.IN_WORKFLOW,
            currentTeam: nextBlock.teamKey,
            currentBlockName: nextBlock.name,
            currentStatus: BlockStatus.IN_PROGRESS,
            suggestedNextBlock: nextBlock.routeToNext,
            suggestedRoute: nextBlock.routeToNext,
          },
        });
      } else {
        await tx.insuranceCase.update({
          where: { id: caseId },
          data: {
            status: CaseStatus.COMPLETED,
            currentTeam: activeBlock.teamKey,
            currentBlockName: activeBlock.name,
            currentStatus: BlockStatus.COMPLETED,
            suggestedNextBlock: null,
            suggestedRoute: "Case completed",
          },
        });
      }

      const updatedCase = await tx.insuranceCase.findUnique({
        where: { id: caseId },
        include: {
          documents: true,
          caseBlocks: {
            orderBy: [{ teamKey: "asc" }, { order: "asc" }],
          },
        },
      });

      return {
        completedBlock,
        startedNextBlock,
        updatedCase,
      };
    });

    return NextResponse.json({
      success: true,
      message: result.startedNextBlock
        ? "Case progressed to next block"
        : "Case completed",
      data: result,
    });
  } catch (error) {
    console.error("Progress case error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to progress case",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}