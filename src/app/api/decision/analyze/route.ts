import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDecisionClient } from "@/lib/api/decision";

const requestSchema = z.object({
  skinAnalysis: z.record(z.string(), z.unknown()).nullish(),
  tryOnResult: z.record(z.string(), z.unknown()).nullish(),
  productInfo: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
  }),
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

    const client = getDecisionClient();
    const result = await client.analyze(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/decision/analyze] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
