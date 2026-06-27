import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "https://stratomesh-3tvv.vercel.app/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ emailId: string }> }
) {
    console.log("🔥 FRONTEND CREATE CASE PROXY ROUTE HIT");
  try {
    const { emailId } = await params;

    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}/insurance-company/intake/sales/emails/${emailId}/create-case`,
      {
        method: "POST",
      }
    );

    const text = await backendResponse.text();

    return new NextResponse(text, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Frontend create-case proxy failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Frontend create-case proxy failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}