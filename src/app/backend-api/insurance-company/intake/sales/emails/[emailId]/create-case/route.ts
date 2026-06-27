import { NextResponse } from "next/server";

function getBackendBaseUrl(request: Request) {
  // 1. On Vercel / deployed backend, use env if provided
  if (process.env.BACKEND_BASE_URL) {
    return process.env.BACKEND_BASE_URL.replace(/\/$/, "");
  }

  // 2. If backend-api and api are in same Next app, call same origin
  const origin = new URL(request.url).origin;
  return `${origin}/api`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params;
    const backendBaseUrl = getBackendBaseUrl(request);

    const bodyText = await request.text();

    const response = await fetch(
      `${backendBaseUrl}/insurance-company/intake/sales/emails/${emailId}/create-case`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            request.headers.get("Content-Type") || "application/json",
        },
        body: bodyText || undefined,
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
  } catch (error) {
    console.error("Create-case proxy failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Proxy failed while creating case",
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 500 }
    );
  }
}