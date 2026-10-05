import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAnalysisSession } from "@/lib/supabase/services";

const schema = z.object({
  userId: z.string().uuid().nullish(),
  selfieUrl: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", issues: parsed.error.issues }, { status: 400 });
    }

    const session = await createAnalysisSession({
      userId: parsed.data.userId,
      selfieUrl: parsed.data.selfieUrl,
    });

    if (!session) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error("[api/session/create] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
