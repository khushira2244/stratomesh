import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteContext = {
  params: Promise<{
    emailId: string;
  }>;
};

const salesEmails = [
  {
    id: "email_sunrise_happy_001",
    storyKey: "happy-new-policy",
    fromName: "Apex Risk Brokers",
    fromEmail: "broker@apexrisk.example",
    subject: "New Fire & Property Policy Request — Sunrise Foods",
    status: "NEW",
    attachment: {
      id: "att_sunrise_001",
      fileName: "01_happy_new_policy_sunrise_foods.md",
      mimeType: "text/markdown",
      sourcePath: "docs/broker-docs/01_happy_new_policy_sunrise_foods.md",
    },
  },
];

function getBaseUrl(request: Request) {
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { emailId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const email = salesEmails.find((item) => item.id === emailId);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Sales intake email not found",
        },
        { status: 404 }
      );
    }

    const attachmentId = body.attachmentId ?? email.attachment.id;

    if (attachmentId !== email.attachment.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Attachment not found for this email",
        },
        { status: 404 }
      );
    }

    const absolutePath = path.join(process.cwd(), email.attachment.sourcePath);

    const fileBuffer = await fs.readFile(absolutePath);

    const file = new File([fileBuffer], email.attachment.fileName, {
      type: email.attachment.mimeType,
    });

    const formData = new FormData();
    formData.append("file", file);

    const baseUrl = getBaseUrl(request);

    const createCaseResponse = await fetch(
      `${baseUrl}/api/insurance-company/cases/from-upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const createCaseResult = await createCaseResponse.json();

    if (!createCaseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Email attachment was selected, but case creation failed",
          createCaseResult,
        },
        { status: 500 }
      );
    }

    const createdCase = createCaseResult.case;

    return NextResponse.json({
      success: true,
      message: "Sales intake email converted into insurance case",
      data: {
        emailId: email.id,
        storyKey: email.storyKey,
        attachmentId: email.attachment.id,
        emailStatus: "CONVERTED_TO_CASE",
        createdCase: {
          id: createdCase.id,
          caseCode: createdCase.caseCode,
          title: createdCase.title,
          currentTeam: createdCase.currentTeam,
          currentBlockName: createdCase.currentBlockName,
          currentStatus: createdCase.currentStatus,
          documentsCount: createdCase.documents?.length ?? 0,
          blocksCount: createdCase.caseBlocks?.length ?? 0,
        },
        nextRoute: `/insurance-company/cases/${createdCase.id}`,
      },
    });
  } catch (error) {
    console.error("Create case from sales email error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create case from sales intake email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}