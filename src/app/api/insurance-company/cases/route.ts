import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cases = await prisma.insuranceCase.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
        clientLocation: true,

        brokerName: true,
        brokerContactPerson: true,
        brokerPriority: true,

        expectedPremium: true,
        targetPremium: true,
        sumInsured: true,
        quoteDeadline: true,
        policyStartDate: true,
        monthEndPriority: true,

        currentTeam: true,
        currentBlockName: true,
        currentStatus: true,
        businessImpact: true,
        riskTags: true,

        createdAt: true,

        _count: {
          select: {
            documents: true,
            caseBlocks: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error("Get insurance cases error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get insurance cases",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}