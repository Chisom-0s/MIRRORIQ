import test from "node:test";
import assert from "node:assert/strict";

import { ClaudeDecisionResponseSchema } from "../src/lib/claude/schemas.ts";
import { generateDeterministicFallbackExplanation } from "../src/lib/claude/client.ts";
import { evaluatePurchaseConfidence } from "../src/lib/decision-engine/scoring.ts";

test("Claude Schema: validates correct structured response", () => {
  const validData = {
    headline: "High Purchase Confidence — Exceptional Silhouette & Color Synergy",
    summary:
      "The tailored shoulder structure and warm camel hue create balanced contrast with your undertones. Proportions align with your visual profile with negligible return risk.",
    strengths: [
      "Warm neutral tones enhance facial radiance with 94% chromatic alignment.",
      "Structured collar and lapel line elongate neckline and balance upper proportions.",
      "Mid-weight wool drape holds structure cleanly without bulk in active movement.",
    ],
    tradeoffs: [
      "Structured tailoring requires intentional styling balance when paired with casual streetwear.",
    ],
    recommendationExplanation:
      "MirrorIQ recommends BUY based on the available visual signals, with a composite purchase confidence rating of 91/100.",
  };

  const parsed = ClaudeDecisionResponseSchema.safeParse(validData);
  assert.ok(parsed.success, "Valid data should parse successfully");
  if (parsed.success) {
    assert.equal(parsed.data.headline, validData.headline);
    assert.equal(parsed.data.strengths.length, 3);
  }
});

test("Claude Schema: rejects responses with missing strengths or tradeoffs", () => {
  const incompleteData = {
    headline: "High Purchase Confidence",
    summary: "A good match for you with high compatibility across all factors.",
    strengths: [], // Empty - must fail min(2)
    tradeoffs: [], // Empty - must fail min(1)
    recommendationExplanation: "Recommended for purchase based on visual metrics.",
  };

  const parsed = ClaudeDecisionResponseSchema.safeParse(incompleteData);
  assert.equal(parsed.success, false, "Schema must reject empty strengths and tradeoffs");
});

test("Claude Schema: rejects non-string or malformed types", () => {
  const corruptedData = {
    headline: 12345, // Invalid type
    summary: null,
    strengths: "Should be an array",
    tradeoffs: {},
    recommendationExplanation: 99,
  };

  const parsed = ClaudeDecisionResponseSchema.safeParse(corruptedData);
  assert.equal(parsed.success, false, "Schema must reject invalid types");
});

test("Deterministic Fallback: generates valid ClaudeDecisionResponse structure", () => {
  const input = {
    product: {
      name: "Silk Charmeuse Blouse",
      brand: "Aura Collection",
      category: "Tops",
      price: "$210",
      color: "#9E2A2B",
    },
  };

  const score = evaluatePurchaseConfidence(input);
  const fallback = generateDeterministicFallbackExplanation(input, score);

  // Validate the fallback against the real Zod schema
  const parsed = ClaudeDecisionResponseSchema.safeParse(fallback);
  assert.ok(parsed.success, "Deterministic fallback must strictly conform to ClaudeDecisionResponseSchema");
  assert.ok(fallback.strengths.length >= 2, "Fallback must provide at least 2 strengths");
  assert.ok(fallback.tradeoffs.length >= 1, "Fallback must provide at least 1 tradeoff");
  assert.ok(fallback.recommendationExplanation.includes("MirrorIQ recommends"), "Disclaimer wording must be present");
});
