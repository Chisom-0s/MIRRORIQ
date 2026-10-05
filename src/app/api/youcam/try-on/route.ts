import { NextRequest, NextResponse } from "next/server";
import {
  createTryOnTask,
  tryOnRequestSchema,
  YouCamError,
} from "@/lib/youcam";

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parsed = tryOnRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_request",
            message: "Invalid try-on request body",
            issues: parsed.error.issues,
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const result = await createTryOnTask(
      parsed.data.fileId,
      parsed.data.effects,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.httpStatus });
    }
    console.error("[api/youcam/try-on] Unexpected error:", error);
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
