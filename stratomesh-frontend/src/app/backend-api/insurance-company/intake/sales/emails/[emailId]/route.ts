import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  process.env.BACKEND_BASE_URL ||
  "http://localhost:3001/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ emailId: string }> }
) {
  const { emailId } = await context.params;

  const response = await fetch(
    `${BACKEND_BASE_URL}/insurance-company/intake/sales/emails/${emailId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
}