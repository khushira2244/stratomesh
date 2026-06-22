import { NextResponse } from "next/server";
import { BlockStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
    blockId: string;
  }>;
};

function toBlockStatus(status?: string): BlockStatus | undefined {
  if (!status) return undefined;

  const normalized = status.toUpperCase();

  if (normalized === "NOT_STARTED") return BlockStatus.NOT_STARTED;
  if (normalized === "IN_PROGRESS") return BlockStatus.IN_PROGRESS;
  if (normalized === "BLOCKED") return BlockStatus.BLOCKED;
  if (normalized === "WAITING") return BlockStatus.WAITING;
  if (normalized === "COMPLETED") return BlockStatus.COMPLETED;
  if (normalized === "SKIPPED") return BlockStatus.SKIPPED;
  if (normalized === "NOT_APPLICABLE") return BlockStatus.NOT_APPLICABLE;

  return undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { caseId, blockId } = await context.params;
    const body = await request.json();

    const existingBlock = await prisma.caseBlock.findFirst({
      where: {
        id: blockId,
        caseId,
      },
    });

    if (!existingBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "Case block not found",
        },
        { status: 404 }
      );
    }

    const status = toBlockStatus(body.status);

    const updatedBlock = await prisma.caseBlock.update({
      where: {
        id: blockId,
      },
      data: {
        ...(status && { status }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.inputs !== undefined && { inputs: body.inputs }),
        ...(body.requiredDocs !== undefined && { requiredDocs: body.requiredDocs }),
        ...(body.checks !== undefined && { checks: body.checks }),
        ...(body.responsible !== undefined && { responsible: body.responsible }),
        ...(body.observers !== undefined && { observers: body.observers }),
        ...(body.slaDays !== undefined && { slaDays: body.slaDays }),
        ...(body.output !== undefined && { output: body.output }),
        ...(body.outputVisibility !== undefined && {
          outputVisibility: body.outputVisibility,
        }),
        ...(body.routeRules !== undefined && { routeRules: body.routeRules }),
        ...(body.routeToNext !== undefined && { routeToNext: body.routeToNext }),
        ...(body.pendingReason !== undefined && {
          pendingReason: body.pendingReason,
        }),
        ...(body.comments !== undefined && { comments: body.comments }),
        ...(body.learningNotes !== undefined && {
          learningNotes: body.learningNotes,
        }),
        ...(body.isDraggable !== undefined && {
          isDraggable: body.isDraggable,
        }),
        ...(body.isDisabled !== undefined && {
          isDisabled: body.isDisabled,
        }),
        ...(body.config !== undefined && { config: body.config }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case block updated",
      data: updatedBlock,
    });
  } catch (error) {
    console.error("Update case block error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update case block",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}