import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEAM_ORDER = [
  "sales",
  "underwriting",
  "pricing",
  "policyIssuance",
  "finance",
  "claims",
  "management",
];

export async function GET() {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        name: "Guardian General Insurance",
      },
      include: {
        teams: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          message: "Insurance organization not found. Create a case from extraction first.",
        },
        { status: 404 }
      );
    }

    const teamCaseCounts = await prisma.caseBlock.groupBy({
      by: ["teamKey"],
      _count: {
        id: true,
      },
      where: {
        case: {
          organizationId: organization.id,
        },
      },
    });

    const teamStatusCounts = await prisma.caseBlock.groupBy({
      by: ["teamKey", "status"],
      _count: {
        id: true,
      },
      where: {
        case: {
          organizationId: organization.id,
        },
      },
    });

    const teams = organization.teams
      .map((team) => {
        const blockCount =
          teamCaseCounts.find((item) => item.teamKey === team.slug)?._count.id ?? 0;

        const statusSummary = teamStatusCounts
          .filter((item) => item.teamKey === team.slug)
          .reduce<Record<string, number>>((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {});

        return {
          id: team.id,
          name: team.name,
          slug: team.slug,
          description: team.description,
          blockCount,
          statusSummary,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        };
      })
      .sort((a, b) => {
        return TEAM_ORDER.indexOf(a.slug) - TEAM_ORDER.indexOf(b.slug);
      });

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        layer: organization.layer,
      },
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    console.error("Get insurance teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get insurance teams",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}