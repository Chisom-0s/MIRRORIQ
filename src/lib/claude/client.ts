import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_SYSTEM_PROMPT, buildClaudeDecisionPrompt } from "./prompts.ts";
import { ClaudeDecisionResponseSchema, type ClaudeDecisionResponse } from "./schemas.ts";
import type { DecisionEngineInput, PurchaseConfidenceScore } from "../decision-engine/types.ts";

/**
 * Deterministic fallback generator when Claude API is unreachable,
 * unconfigured, or returns invalid schema data.
 */
export function generateDeterministicFallbackExplanation(
  input: DecisionEngineInput,
  score: PurchaseConfidenceScore,
): ClaudeDecisionResponse {
  const { product } = input;
  const isBuy = score.overallScore >= 85;
  const isConsider = score.overallScore >= 70 && score.overallScore < 85;

  const headline = isBuy
    ? `High Purchase Confidence — ${product.name}`
    : isConsider
      ? `Moderate Purchase Confidence — Stylistic Alignment for ${product.name}`
      : `Low Purchase Confidence — Review Alternatives for ${product.name}`;

  const summary = isBuy
    ? `The tailored silhouette and color palette of ${product.name} align with your visual profile with exceptional harmony and negligible styling friction.`
    : isConsider
      ? `The ${product.name} offers balanced aesthetic resonance, though styling versatility depends on complementary wardrobe pairings.`
      : `Visual geometry and undertone indicators suggest this piece presents styling friction compared to alternate silhouettes.`;

  const strengths = [
    `Color temperature aligns with visual profile at ${score.colorCompatibility}% chromatic harmony.`,
    `Occasion suitability is rated at ${score.occasionCompatibility}% for your intended setting.`,
    `Drape and silhouette coherence provides structured visual balance.`,
  ];

  const tradeoffs = isBuy
    ? [`Requires thoughtful coordination with existing neutral wardrobe layers.`]
    : isConsider
      ? [
          `Distinctive cut may limit cross-occasion versatility outside of primary settings.`,
          `Color saturation requires deliberate styling balance.`,
        ]
      : [
          `Proportions show lower harmonic resonance with your primary visual profile.`,
          `Higher styling friction relative to alternative catalog recommendations.`,
        ];

  const recommendationExplanation = `MirrorIQ recommends ${score.recommendation} based on the available visual signals, with a composite purchase confidence rating of ${score.overallScore}/100.`;

  return {
    headline,
    summary,
    strengths,
    tradeoffs,
    recommendationExplanation,
  };
}

/**
 * Calls Anthropic Claude to generate a structured, validated natural language
 * explanation of the deterministic MirrorIQ score.
 */
export async function generateClaudeDecisionExplanation(
  input: DecisionEngineInput,
  score: PurchaseConfidenceScore,
): Promise<ClaudeDecisionResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.info("[claude/client] ANTHROPIC_API_KEY not configured — using deterministic generator.");
    return generateDeterministicFallbackExplanation(input, score);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const userPrompt = buildClaudeDecisionPrompt(input, score);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0.2,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const firstBlock = message.content[0];
    if (!firstBlock || firstBlock.type !== "text") {
      console.warn("[claude/client] Received non-text response from Claude, using fallback.");
      return generateDeterministicFallbackExplanation(input, score);
    }

    let rawText = firstBlock.text.trim();
    // Strip code fence if model wrapped in ```json ... ```
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsedJson = JSON.parse(rawText);
    const validated = ClaudeDecisionResponseSchema.safeParse(parsedJson);

    if (!validated.success) {
      console.warn(
        "[claude/client] Response schema validation failed, using fallback:",
        validated.error.issues,
      );
      return generateDeterministicFallbackExplanation(input, score);
    }

    return validated.data;
  } catch (error) {
    console.error("[claude/client] Claude API call failed, falling back to deterministic:", error);
    return generateDeterministicFallbackExplanation(input, score);
  }
}
