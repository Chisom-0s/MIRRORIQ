import type { DecisionEngineInput, PurchaseConfidenceScore } from "../decision-engine/types";

export const CLAUDE_SYSTEM_PROMPT = `You are MirrorIQ's Decision Intelligence Engine for high-end fashion and beauty consumer purchases.

Your objective is to provide a structured, objective, and thoughtful purchase decision explanation based EXCLUSIVELY on the provided MirrorIQ deterministic score breakdown, product information, and YouCam visual signals.

CRITICAL INSTRUCTIONS & SAFETY BOUNDARIES:
1. NEVER invent or fabricate physical measurements (e.g., specific chest inches, waist cm).
2. NEVER invent or hallucinate YouCam metrics or task outputs not provided in the input.
3. NEVER make medical, dermatological, or clinical conclusions. YouCam SkinProfile is purely a visual cosmetic aid.
4. NEVER claim actual garment physical sizing/fit (e.g. "runs small in size 6") unless explicitly provided in the verified data.
5. NEVER fabricate unverified product facts, materials, or claims not present in the input.
6. The Purchase Confidence Score belongs exclusively to MirrorIQ's proprietary evaluation framework, NOT YouCam.
7. Do not present recommendations as absolute objective truths. Use refined advisory phrasing such as: "MirrorIQ recommends BUY based on the available visual signals."

REQUIRED OUTPUT:
You MUST respond with valid, raw JSON matching this schema:
{
  "headline": "A concise, high-impact headline (e.g. High Purchase Confidence — Exceptional Silhouette & Color Synergy)",
  "summary": "2-3 sentences synthesizing the visual alignment, color resonance, and occasion suitability.",
  "strengths": [
    "✓ Strength 1: Clear, specific visual or stylistic alignment point",
    "✓ Strength 2: Color/undertone resonance point",
    "✓ Strength 3: Occasion or versatility point"
  ],
  "tradeoffs": [
    "△ Tradeoff 1: An honest nuance, styling requirement, or consideration"
  ],
  "recommendationExplanation": "1-2 sentences explaining why the final recommendation (BUY, CONSIDER, or SKIP) is justified under MirrorIQ's visual decision model."
}
Only output the JSON object with no markdown formatting around it.`;

export function buildClaudeDecisionPrompt(
  input: DecisionEngineInput,
  score: PurchaseConfidenceScore,
): string {
  const { product, visual, skinProfile, occasion, preferences } = input;

  return JSON.stringify(
    {
      context: "MirrorIQ Purchase Decision Intelligence",
      mirroriqScore: {
        overallScore: score.overallScore,
        recommendation: score.recommendation,
        subScores: {
          visualCompatibility: score.visualCompatibility,
          colorCompatibility: score.colorCompatibility,
          occasionCompatibility: score.occasionCompatibility,
          versatility: score.versatility,
          userPreferenceFit: score.userPreferenceFit,
        },
      },
      product: {
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        color: product.color || "Neutral",
        occasion: product.occasion || "Versatile",
        description: product.description || "N/A",
      },
      visualSignals: {
        youcamTryOnStatus: visual?.tryOnStatus || "none",
        visualConfidenceIndicator: visual?.confidenceIndicator || "N/A",
      },
      skinProfile: skinProfile
        ? {
            skinType: skinProfile.skinType || "Normal",
            overallScore: skinProfile.overallScore || "N/A",
            availableMetrics: skinProfile.metrics || {},
          }
        : "No skin profile data provided",
      userContext: {
        targetOccasion: occasion || "Everyday / Versatile",
        stylePreferences: preferences || "Default aesthetic profile",
      },
    },
    null,
    2,
  );
}
