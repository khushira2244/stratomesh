import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

function groupBlocksByTeam(blocks: any[]) {
  return blocks.reduce<Record<string, any[]>>((acc, block) => {
    if (!acc[block.teamKey]) {
      acc[block.teamKey] = [];
    }

    acc[block.teamKey].push(block);
    return acc;
  }, {});
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;

    const insuranceCase = await prisma.insuranceCase.findUnique({
      where: {
        id: caseId,
      },
      include: {
        brokerRequestDocument: true,
        documents: {
          orderBy: {
            createdAt: "asc",
          },
        },
        caseBlocks: {
          orderBy: [
            {
              teamKey: "asc",
            },
            {
              order: "asc",
            },
          ],
        },
        aiSuggestions: {
          orderBy: {
            createdAt: "desc",
          },
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

    const blocksByTeam = groupBlocksByTeam(insuranceCase.caseBlocks);

    return NextResponse.json({
      success: true,
      data: {
        ...insuranceCase,
        blocksByTeam,
      },
    });
  } catch (error) {
    console.error("Get insurance case detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get insurance case detail",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}