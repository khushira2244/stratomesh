import { NextResponse } from "next/server";

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

    const host = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Step 1: upload file and extract AI JSON
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const uploadResponse = await fetch(
      `${baseUrl}/api/insurance-company/upload-request`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "File upload/extraction failed",
          uploadResult,
        },
        { status: 500 }
      );
    }

    // Step 2: save extracted data as real insurance case
    const saveResponse = await fetch(
      `${baseUrl}/api/insurance-company/cases/from-extraction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: uploadResult.data,
          fileName: uploadResult.file?.name,
          rawDocumentText: uploadResult.rawDocumentText,
        }),
      }
    );

    const saveResult = await saveResponse.json();

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Extraction worked, but case save failed",
          uploadResult,
          saveResult,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Broker request uploaded, extracted, and saved as insurance case",
      file: uploadResult.file,
      extractedSummary: uploadResult.data?.caseSummary,
      case: saveResult.data,
    });
  } catch (error) {
    console.error("Create case from upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload, extract, and create insurance case",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}