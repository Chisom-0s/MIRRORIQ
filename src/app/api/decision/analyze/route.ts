import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { evaluatePurchaseConfidence } from "@/lib/decision-engine/scoring";
import { generateClaudeDecisionExplanation } from "@/lib/claude/client";
import type { DecisionEngineInput } from "@/lib/decision-engine/types";

const requestSchema = z.object({
  product: z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    brand: z.string().default("Curated Atelier"),
    category: z.string().default("Apparel"),
    price: z.union([z.string(), z.number()]).default("$240"),
    color: z.string().optional(),
    occasion: z.string().optional(),
    description: z.string().optional(),
  }),
  visual: z
    .object({
      tryOnStatus: z.enum(["success", "running", "error", "none"]).optional(),
      resultImageUrl: z.string().nullish(),
      confidenceIndicator: z.number().optional(),
      hasGarmentAlignment: z.boolean().optional(),
    })
    .optional(),
  skinProfile: z
    .object({
      skinType: z.string().optional(),
      overallScore: z.number().optional(),
      metrics: z.record(z.string(), z.number()).optional(),
    })
    .optional(),
  occasion: z.string().optional(),
  preferences: z
    .object({
      styleVibe: z.string().optional(),
      colorPalette: z.string().optional(),
      fitPreference: z.string().optional(),
      budgetTier: z.string().optional(),
    })
    .optional(),
  alternatives: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        brand: z.string(),
        price: z.string(),
        imageUrl: z.string().optional(),
        score: z.number().optional(),
        difference: z.string().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const input: DecisionEngineInput = parsed.data;

    // 1. Calculate deterministic MirrorIQ Purchase Confidence Score
    const scoreResult = evaluatePurchaseConfidence(input);

    // 2. Generate structured Claude interpretation and explanation
    const claudeExplanation = await generateClaudeDecisionExplanation(input, scoreResult);

    // 3. Compose response payload
    const responsePayload = {
      overallScore: scoreResult.overallScore,
      visualCompatibility: scoreResult.visualCompatibility,
      colorCompatibility: scoreResult.colorCompatibility,
      occasionCompatibility: scoreResult.occasionCompatibility,
      versatility: scoreResult.versatility,
      userPreferenceFit: scoreResult.userPreferenceFit,
      recommendation: scoreResult.recommendation,
      recommendationDisclaimer: scoreResult.recommendationDisclaimer,
      headline: claudeExplanation.headline,
      summary: claudeExplanation.summary,
      strengths: claudeExplanation.strengths,
      tradeoffs: claudeExplanation.tradeoffs,
      recommendationExplanation: claudeExplanation.recommendationExplanation,
      factors: scoreResult.factors,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[api/decision/analyze] Error:", error);
    return NextResponse.json(
      { error: "Internal decision engine error" },
      { status: 500 },
    );
  }
}
