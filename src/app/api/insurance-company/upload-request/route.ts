import { NextResponse } from "next/server";
import mammoth from "mammoth";

async function extractTextFromFile(file: File) {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
    return buffer.toString("utf-8");
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload .txt, .md, or .docx file.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File is required. Upload using form field name: file",
        },
        { status: 400 }
      );
    }

    const rawDocumentText = await extractTextFromFile(file);

    if (!rawDocumentText.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not extract text from uploaded file.",
        },
        { status: 400 }
      );
    }

    const host = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const extractionResponse = await fetch(
      `${protocol}://${host}/api/insurance-company/extract-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawDocumentText,
        }),
      }
    );

    const extractionResult = await extractionResponse.json();

    if (!extractionResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "File uploaded, but AI extraction failed.",
          fileName: file.name,
          rawDocumentLength: rawDocumentText.length,
          extractionError: extractionResult,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Broker request file uploaded and extracted",
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      rawDocumentText,
      data: extractionResult.data,
    });
  } catch (error) {
    console.error("Upload request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload and extract broker request file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}