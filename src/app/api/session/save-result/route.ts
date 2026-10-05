import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  saveSkinAnalysis,
  saveTryOnResult,
  saveDecisionReport,
  updateSessionStatus,
} from "@/lib/supabase/services";

const schema = z.object({
  sessionId: z.string().uuid(),
  productId: z.string().uuid().nullish(),
  tryOn: z
    .object({
      sourceImageUrl: z.string(),
      resultImageUrl: z.string().nullish(),
      youcamTaskId: z.string().nullish(),
      status: z.enum(["running", "success", "error"]),
    })
    .optional(),
  skinAnalysis: z
    .object({
      skinType: z.string().nullish(),
      overallScore: z.number().nullish(),
      analysisData: z.record(z.string(), z.unknown()),
    })
    .optional(),
  decision: z.object({
    confidenceScore: z.number(),
    visualScore: z.number().nullish(),
    occasionScore: z.number().nullish(),
    preferenceScore: z.number().nullish(),
    versatilityScore: z.number().nullish(),
    recommendation: z.string().nullish(),
    explanation: z.string().nullish(),
  }),
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

    const { sessionId, productId, tryOn, skinAnalysis, decision } = parsed.data;

    if (skinAnalysis) {
      await saveSkinAnalysis({
        sessionId,
        skinType: skinAnalysis.skinType,
        overallScore: skinAnalysis.overallScore,
        analysisData: skinAnalysis.analysisData as unknown as import("@/lib/supabase/types").Json,
      });
    }

    if (tryOn) {
      await saveTryOnResult({
        sessionId,
        productId,
        sourceImageUrl: tryOn.sourceImageUrl,
        resultImageUrl: tryOn.resultImageUrl,
        youcamTaskId: tryOn.youcamTaskId,
        status: tryOn.status,
      });
    }

    const decisionRecord = await saveDecisionReport({
      sessionId,
      productId,
      confidenceScore: decision.confidenceScore,
      visualScore: decision.visualScore,
      occasionScore: decision.occasionScore,
      preferenceScore: decision.preferenceScore,
      versatilityScore: decision.versatilityScore,
      recommendation: decision.recommendation,
      explanation: decision.explanation,
    });

    await updateSessionStatus(sessionId, "completed");

    return NextResponse.json({ success: true, decisionRecord });
  } catch (err) {
    console.error("[api/session/save-result] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
