import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    scenarioKey: string;
  }>;
};

const demoScenarioConfig: Record<
  string,
  {
    scenarioName: string;
    agendaId: string;
    agendaLabel: string;
    startTeam: string;
    searchTerms: string[];
  }
> = {
  "happy-new-policy": {
    scenarioName: "Sunrise Foods Insurance",
    agendaId: "new-policy-premium-closure",
    agendaLabel: "New Business / New Policy",
    startTeam: "sales",
    searchTerms: ["Sunrise", "Sunrise Foods", "SUNRISEF"],
  },

  // Future scenario. This will work after we create claim case data.
"claim-settlement": {
  scenarioName: "Claim Settlement Journey",
  agendaId: "claim-review",
  agendaLabel: "Claim Review",
  startTeam: "sales",
  searchTerms: ["Delta Logistics"],
},
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { scenarioKey } = await context.params;

    const scenarioConfig = demoScenarioConfig[scenarioKey];

    if (!scenarioConfig) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported demo scenario: ${scenarioKey}`,
          supportedScenarios: Object.keys(demoScenarioConfig),
        },
        { status: 404 }
      );
    }

    const latestCase = await prisma.insuranceCase.findFirst({
  where: {
    NOT: [
      {
        title: {
          contains: "Template",
          mode: "insensitive",
        },
      },
      {
        insuranceType: {
          equals: "Generic",
          mode: "insensitive",
        },
      },
      {
        clientCompanyName: {
          equals: "",
        },
      },
    ],
    OR: scenarioConfig.searchTerms.flatMap((term) => [
      {
        clientCompanyName: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        title: {
          contains: term,
          mode: "insensitive",
        },
      },
      {
        caseCode: {
          contains: term,
          mode: "insensitive",
        },
      },
    ]),
  },
  orderBy: {
    createdAt: "desc",
  },
  select: {
    id: true,
    caseCode: true,
    title: true,
    clientCompanyName: true,
    insuranceType: true,
    currentTeam: true,
    currentBlockName: true,
    currentStatus: true,
    expectedPremium: true,
    targetPremium: true,
    sumInsured: true,
    brokerName: true,
    brokerEmail: true,
    monthEndPriority: true,
    createdAt: true,
  },
});

    if (!latestCase) {
      return NextResponse.json(
        {
          success: false,
          message: `No active case found for scenario: ${scenarioKey}`,
          data: {
            scenarioKey,
            scenarioName: scenarioConfig.scenarioName,
            agendaId: scenarioConfig.agendaId,
            agendaLabel: scenarioConfig.agendaLabel,
            startTeam: scenarioConfig.startTeam,
            activeCaseId: null,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Demo scenario resolved",
      data: {
        scenarioKey,
        scenarioName: scenarioConfig.scenarioName,
        agendaId: scenarioConfig.agendaId,
        agendaLabel: scenarioConfig.agendaLabel,
        startTeam: scenarioConfig.startTeam,

        activeCaseId: latestCase.id,
        caseId: latestCase.id,
        caseCode: latestCase.caseCode,
        title: latestCase.title,
        clientCompanyName: latestCase.clientCompanyName,
        insuranceType: latestCase.insuranceType,
        currentTeam: latestCase.currentTeam,
        currentBlockName: latestCase.currentBlockName,
        currentStatus: latestCase.currentStatus,
        expectedPremium: latestCase.expectedPremium,
        targetPremium: latestCase.targetPremium,
        sumInsured: latestCase.sumInsured,
        brokerName: latestCase.brokerName,
        brokerEmail: latestCase.brokerEmail,
        monthEndPriority: latestCase.monthEndPriority,
        createdAt: latestCase.createdAt,
      },
    });
  } catch (error) {
    console.error("Resolve demo scenario error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to resolve demo scenario",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}