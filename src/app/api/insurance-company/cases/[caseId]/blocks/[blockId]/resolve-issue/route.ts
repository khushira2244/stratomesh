import { NextResponse } from "next/server";
import { BlockStatus, CaseStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
    blockId: string;
  }>;
};

type ChecklistCheck =
  | string
  | {
      name: string;
      status?: string;
      reason?: string;
      waivedByTeam?: string;
      questionedByTeam?: string;
      previousTeamDependency?: string;
      canBlockNextTeam?: boolean;
      managerObservationRequired?: boolean;
      managerDecision?: string;
      config?: Record<string, unknown>;
    };

function updateChecklistChecks(
  checks: ChecklistCheck[] | null | undefined,
  checklistItemName: string,
  resolutionNote: string,
  resolvedByTeam: string,
  managerObservationStatus?: string
) {
  const existingChecks = Array.isArray(checks) ? checks : [];

  let matched = false;

  const updatedChecks = existingChecks.map((check) => {
    if (typeof check === "string") {
      if (check.toLowerCase() !== checklistItemName.toLowerCase()) {
        return check;
      }

      matched = true;

      return {
        name: check,
        status: "RECEIVED",
        reason: resolutionNote,
        waivedByTeam: "",
        questionedByTeam: "",
        managerDecision: managerObservationStatus ?? "RESOLVED",
        managerObservationRequired: false,
        canBlockNextTeam: false,
        previousTeamDependency: "",
        config: {
          resolvedByTeam,
          resolvedAt: new Date().toISOString(),
        },
      };
    }

    if (check.name.toLowerCase() !== checklistItemName.toLowerCase()) {
      return check;
    }

    matched = true;

    return {
      ...check,
      status: "RECEIVED",
      reason: resolutionNote,
      waivedByTeam: "",
      questionedByTeam: "",
      managerDecision: managerObservationStatus ?? "RESOLVED",
      managerObservationRequired: false,
      canBlockNextTeam: false,
      config: {
        ...(check.config ?? {}),
        resolvedByTeam,
        resolvedAt: new Date().toISOString(),
      },
    };
  });

  if (!matched) {
    updatedChecks.push({
      name: checklistItemName,
      status: "RECEIVED",
      reason: resolutionNote,
      waivedByTeam: "",
      questionedByTeam: "",
      managerDecision: managerObservationStatus ?? "RESOLVED",
      managerObservationRequired: false,
      canBlockNextTeam: false,
      previousTeamDependency: "",
      config: {
        resolvedByTeam,
        resolvedAt: new Date().toISOString(),
      },
    });
  }

  return updatedChecks;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { caseId, blockId } = await context.params;
    const body = await request.json();

    const resolvedByTeam = body.resolvedByTeam as string | undefined;
    const nextTeam = body.nextTeam as string | undefined;
    const nextBlockId = body.nextBlockId as string | undefined;
    const checklistItemName = body.checklistItemName as string | undefined;
    const resolutionNote = body.resolutionNote as string | undefined;
    const managerObservationStatus =
      (body.managerObservationStatus as string | undefined) ?? "RESOLVED";

    if (!resolvedByTeam || !nextTeam || !nextBlockId || !checklistItemName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "resolvedByTeam, nextTeam, nextBlockId, and checklistItemName are required",
        },
        { status: 400 }
      );
    }

    const previousBlock = await prisma.caseBlock.findFirst({
      where: {
        id: blockId,
        caseId,
      },
    });

    if (!previousBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "Previous/current block not found",
        },
        { status: 404 }
      );
    }

    const nextBlock = await prisma.caseBlock.findFirst({
      where: {
        id: nextBlockId,
        caseId,
        teamKey: nextTeam,
      },
    });

    if (!nextBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "Next team block not found",
        },
        { status: 404 }
      );
    }

    const note =
      resolutionNote ||
      `${checklistItemName} resolved by ${resolvedByTeam} and sent back to ${nextTeam}.`;

    const updatedChecks = updateChecklistChecks(
      previousBlock.checks as ChecklistCheck[],
      checklistItemName,
      note,
      resolvedByTeam,
      managerObservationStatus
    );

    const updatedChecksJson =
      updatedChecks as unknown as Prisma.InputJsonValue;

    const result = await prisma.$transaction(async (tx) => {
      const resolvedPreviousBlock = await tx.caseBlock.update({
        where: {
          id: previousBlock.id,
        },
        data: {
          checks: updatedChecksJson,
          pendingReason: "",
          comments: previousBlock.comments
            ? `${previousBlock.comments}\n\nResolution: ${note}`
            : `Resolution: ${note}`,
        },
      });

      const reactivatedNextBlock = await tx.caseBlock.update({
        where: {
          id: nextBlock.id,
        },
        data: {
          status: BlockStatus.IN_PROGRESS,
          pendingReason: "",
          comments: nextBlock.comments
            ? `${nextBlock.comments}\n\nReactivated after resolution: ${note}`
            : `Reactivated after resolution: ${note}`,
        },
      });

      const updatedCase = await tx.insuranceCase.update({
        where: {
          id: caseId,
        },
        data: {
          status: CaseStatus.IN_WORKFLOW,
          currentTeam: nextBlock.teamKey,
          currentBlockName: nextBlock.name,
          currentStatus: BlockStatus.IN_PROGRESS,
          suggestedNextBlock: nextBlock.routeToNext,
          suggestedRoute: nextBlock.routeToNext,
        },
      });

      return {
        resolvedPreviousBlock,
        reactivatedNextBlock,
        updatedCase,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Issue resolved and next team block reactivated",
      data: {
        caseId,
        checklistItemName,
        resolvedByTeam,
        nextTeam,
        managerObservationStatus,
        previousBlock: result.resolvedPreviousBlock,
        nextBlock: result.reactivatedNextBlock,
        case: result.updatedCase,
      },
    });
  } catch (error) {
    console.error("Resolve issue error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to resolve issue",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}