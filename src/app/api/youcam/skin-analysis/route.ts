import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getYouCamClient, YouCamApiError } from "@/lib/api/youcam";

const requestSchema = z.object({
  imageId: z.string().min(1, "imageId is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const client = getYouCamClient();
    const result = await client.startSkinAnalysis(parsed.data.imageId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Skin analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
