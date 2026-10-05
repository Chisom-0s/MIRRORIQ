import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveComparison } from "@/lib/supabase/services";

const schema = z.object({
  sessionId: z.string().uuid(),
  productAId: z.string().uuid().nullish(),
  productBId: z.string().uuid().nullish(),
  scoreA: z.number().nullish(),
  scoreB: z.number().nullish(),
  winnerProductId: z.string().uuid().nullish(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const comparison = await saveComparison(parsed.data);
    return NextResponse.json({ success: true, comparison });
  } catch (err) {
    console.error("[api/session/comparison] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
