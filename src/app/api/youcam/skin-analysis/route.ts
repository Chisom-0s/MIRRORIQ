import { NextRequest, NextResponse } from "next/server";
import {
  createSkinAnalysisTask,
  skinAnalysisActionSchema,
  YouCamError,
} from "@/lib/youcam";
import { z } from "zod";

const bodySchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
  actions: z.array(skinAnalysisActionSchema).min(1).max(7).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parsed = bodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_request",
            message: "Invalid skin analysis request body",
            issues: parsed.error.issues,
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const result = await createSkinAnalysisTask(
      parsed.data.fileId,
      parsed.data.actions,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.httpStatus });
    }
    console.error("[api/youcam/skin-analysis] Unexpected error:", error);
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
