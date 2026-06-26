import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://localhost:3001/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;

    const response = await fetch(
      `${BACKEND_BASE_URL}/insurance-company/intake/sales/emails/${emailId}/create-case`,
      {
        method: "POST",
      }
    );

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Frontend create-case proxy failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Frontend proxy failed while creating case",
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 500 }
    );
  }
}