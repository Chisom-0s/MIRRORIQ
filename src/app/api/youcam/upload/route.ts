import { NextRequest, NextResponse } from "next/server";
import { uploadImage, youCamFeatureSchema, YouCamError } from "@/lib/youcam";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") ?? formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_image",
            message: "No image file provided in form data ('file' or 'image' field).",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const rawFeature = formData.get("feature");
    const featureParsed = youCamFeatureSchema.safeParse(rawFeature ?? "skin-analysis");
    const feature = featureParsed.success ? featureParsed.data : "skin-analysis";

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const contentType = file.type || "image/jpeg";
    const fileName = (file instanceof File && file.name) ? file.name : "upload.jpg";

    const result = await uploadImage({
      feature,
      bytes,
      contentType,
      fileName,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.httpStatus });
    }
    console.error("[api/youcam/upload] Unexpected error:", error);
    return NextResponse.json(
      {
        error: {
          code: "unknown",
          message: error instanceof Error ? error.message : "Internal server error",
          retryable: false,
        },
      },
      { status: 500 },
    );
  }
}
