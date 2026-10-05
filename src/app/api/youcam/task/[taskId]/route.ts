import { NextRequest, NextResponse } from "next/server";
import { getYouCamClient, YouCamApiError } from "@/lib/api/youcam";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId parameter is required" },
        { status: 400 },
      );
    }

    const client = getYouCamClient();
    const result = await client.getTaskStatus(taskId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof YouCamApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    console.error("Task status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
