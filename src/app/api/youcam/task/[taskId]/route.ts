import { NextRequest, NextResponse } from "next/server";
import {
  getTask,
  youCamFeatureSchema,
  YouCamError,
} from "@/lib/youcam";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await context.params;

    if (!taskId) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_request",
            message: "taskId parameter is required",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const rawFeature = searchParams.get("feature");
    const featureParsed = youCamFeatureSchema.safeParse(rawFeature ?? "skin-analysis");
    const feature = featureParsed.success ? featureParsed.data : "skin-analysis";

    const result = await getTask(feature, taskId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.httpStatus });
    }
    console.error("[api/youcam/task] Unexpected error:", error);
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
