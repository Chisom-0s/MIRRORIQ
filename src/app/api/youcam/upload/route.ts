import { NextRequest, NextResponse } from "next/server";
import { getYouCamClient, YouCamApiError } from "@/lib/api/youcam";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    const client = getYouCamClient();
    const result = await client.uploadImage(uploadData);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
