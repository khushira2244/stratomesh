import { NextResponse } from "next/server";
import { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
    documentId: string;
  }>;
};

function toDocumentStatus(status?: string): DocumentStatus | undefined {
  if (!status) return undefined;

  const normalized = status.toUpperCase();

  if (normalized === "RECEIVED") return DocumentStatus.RECEIVED;
  if (normalized === "MISSING") return DocumentStatus.MISSING;
  if (normalized === "PARTIAL") return DocumentStatus.PARTIAL;
  if (normalized === "NOT_REQUIRED") return DocumentStatus.NOT_REQUIRED;

  return undefined;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { caseId, documentId } = await context.params;
    const body = await request.json();

    const existingDocument = await prisma.caseDocument.findFirst({
      where: {
        id: documentId,
        caseId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        {
          success: false,
          message: "Case document not found",
        },
        { status: 404 }
      );
    }

    const status = toDocumentStatus(body.status);

    const updatedDocument = await prisma.caseDocument.update({
      where: {
        id: documentId,
      },
      data: {
        ...(status && { status }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.isRequired !== undefined && { isRequired: body.isRequired }),
        ...(body.owner !== undefined && { owner: body.owner }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case document updated",
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Update case document error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update case document",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}