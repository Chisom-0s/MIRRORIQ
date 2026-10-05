import test from "node:test";
import assert from "node:assert/strict";

import { evaluatePurchaseConfidence } from "../src/lib/decision-engine/scoring.ts";
import { generateClaudeDecisionExplanation } from "../src/lib/claude/client.ts";

test("API Failure Path: Graceful fallback when ANTHROPIC_API_KEY is not set or network fails", async () => {
  // Ensure no API key in this sub-test
  const originalKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  try {
    const input = {
      product: {
        name: "Sculpted Italian Wool Trench Coat",
        brand: "L'Atelier Studio",
        category: "Apparel • Outerwear",
        price: "$480",
      },
    };

    const score = evaluatePurchaseConfidence(input);
    const explanation = await generateClaudeDecisionExplanation(input, score);

    assert.ok(explanation, "Explanation must not be null");
    assert.ok(explanation.headline.includes("Sculpted Italian Wool Trench Coat"));
    assert.ok(explanation.strengths.length >= 2);
    assert.ok(explanation.tradeoffs.length >= 1);
    assert.ok(explanation.recommendationExplanation.includes("MirrorIQ recommends"));
  } finally {
    if (originalKey) {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
  }
});

test("API Failure Path: Graceful fallback on invalid/partial product input", () => {
  const minimalInput = {
    product: {
      name: "Unknown Item",
      brand: "Unknown",
      category: "",
      price: "",
    },
  };

  const score = evaluatePurchaseConfidence(minimalInput);
  assert.ok(score.overallScore >= 0 && score.overallScore <= 100);
  assert.ok(["BUY", "CONSIDER", "SKIP"].includes(score.recommendation));
  assert.equal(score.factors.length, 5);
});
