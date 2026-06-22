import { NextResponse } from "next/server";
import { BlockStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

function toBlockStatus(status?: string): BlockStatus {
  if (!status) return BlockStatus.NOT_STARTED;

  const normalized = status.toUpperCase();

  if (normalized === "NOT_STARTED") return BlockStatus.NOT_STARTED;
  if (normalized === "IN_PROGRESS") return BlockStatus.IN_PROGRESS;
  if (normalized === "BLOCKED") return BlockStatus.BLOCKED;
  if (normalized === "WAITING") return BlockStatus.WAITING;
  if (normalized === "COMPLETED") return BlockStatus.COMPLETED;
  if (normalized === "SKIPPED") return BlockStatus.SKIPPED;
  if (normalized === "NOT_APPLICABLE") return BlockStatus.NOT_APPLICABLE;

  return BlockStatus.NOT_STARTED;
}

function blockTypeFromName(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("document") || lower.includes("verification")) {
    return "DOCUMENT_CHECK";
  }

  if (lower.includes("risk") || lower.includes("underwriting")) {
    return "RISK_CHECK";
  }

  if (lower.includes("handoff")) {
    return "HANDOFF";
  }

  if (lower.includes("approval")) {
    return "APPROVAL_GATE";
  }

  if (lower.includes("pricing") || lower.includes("premium")) {
    return "PRICING_CHECK";
  }

  if (
    lower.includes("finance") ||
    lower.includes("payment") ||
    lower.includes("utr") ||
    lower.includes("bank")
  ) {
    return "FINANCE_CHECK";
  }

  if (lower.includes("claim")) {
    return "CLAIMS_CHECK";
  }

  if (
    lower.includes("observation") ||
    lower.includes("management") ||
    lower.includes("audit")
  ) {
    return "OBSERVATION";
  }

  if (lower.includes("query")) {
    return "QUERY";
  }

  if (lower.includes("escalation")) {
    return "ESCALATION";
  }

  return "WORKFLOW_BLOCK";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();

    const teamKey = body.teamKey;
    const name = body.name;

    if (!teamKey || typeof teamKey !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "teamKey is required",
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Block name is required",
        },
        { status: 400 }
      );
    }

    const insuranceCase = await prisma.insuranceCase.findUnique({
      where: {
        id: caseId,
      },
      select: {
        id: true,
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

    const lastBlock = await prisma.caseBlock.findFirst({
      where: {
        caseId,
        teamKey,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const requestedOrder =
      typeof body.order === "number" && body.order > 0 ? body.order : null;

    const nextOrder = requestedOrder ?? (lastBlock?.order ?? 0) + 1;

    const existingBlockAtOrder = await prisma.caseBlock.findFirst({
      where: {
        caseId,
        teamKey,
        order: nextOrder,
      },
      select: {
        id: true,
      },
    });

    const createdBlock = await prisma.$transaction(async (tx) => {
      // If user inserts in the middle, shift existing blocks down.
      if (existingBlockAtOrder) {
        const blocksToShift = await tx.caseBlock.findMany({
          where: {
            caseId,
            teamKey,
            order: {
              gte: nextOrder,
            },
          },
          orderBy: {
            order: "desc",
          },
        });

        for (const block of blocksToShift) {
          await tx.caseBlock.update({
            where: {
              id: block.id,
            },
            data: {
              order: block.order + 1,
            },
          });
        }
      }

      return tx.caseBlock.create({
        data: {
          caseId,
          teamKey,
          teamName: body.teamName ?? teamKey,
          name,
          blockType: body.blockType ?? blockTypeFromName(name),
          order: nextOrder,
          status: toBlockStatus(body.status),

          inputs: body.inputs ?? [],
          requiredDocs: body.requiredDocs ?? null,
          checks: body.checks ?? null,
          responsible: body.responsible ?? body.responsibleRole ?? null,
          observers: body.observers ?? [],
          slaDays: body.slaDays ?? null,
          output: body.output ?? body.outputs ?? [],
          outputVisibility: body.outputVisibility ?? null,
          routeRules: body.routeRules ?? null,
          routeToNext: body.routeToNext ?? "",
          pendingReason: body.pendingReason ?? "",
          comments: body.comments ?? null,
          learningNotes: body.learningNotes ?? null,

          isDraggable: body.isDraggable ?? true,
          isDisabled: body.isDisabled ?? false,
          config: body.config ?? body,
        },
      });
    });

    const updatedTeamBlocks = await prisma.caseBlock.findMany({
      where: {
        caseId,
        teamKey,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case block added",
      data: {
        createdBlock,
        teamBlocks: updatedTeamBlocks,
      },
    });
  } catch (error) {
    console.error("Add case block error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add case block",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}