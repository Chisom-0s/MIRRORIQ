import test from "node:test";
import assert from "node:assert/strict";

// Import compiled or direct scoring module logic
import {
  calculateVisualCompatibility,
  calculateColorCompatibility,
  calculateOccasionCompatibility,
  calculateVersatility,
  calculateUserPreferenceFit,
  evaluatePurchaseConfidence,
  SCORING_WEIGHTS,
  VERDICT_THRESHOLDS,
} from "../src/lib/decision-engine/scoring.ts";

test("Decision Engine Scoring Weights sum to exactly 1.0 (100%)", () => {
  const sum =
    SCORING_WEIGHTS.VISUAL_COMPATIBILITY +
    SCORING_WEIGHTS.COLOR_COMPATIBILITY +
    SCORING_WEIGHTS.OCCASION_COMPATIBILITY +
    SCORING_WEIGHTS.VERSATILITY +
    SCORING_WEIGHTS.USER_PREFERENCE_FIT;

  assert.equal(Math.round(sum * 100) / 100, 1.0);
});

test("Visual Compatibility: handles successful try-on with alignment", () => {
  const product = {
    name: "Sculpted Italian Wool Trench Coat",
    brand: "L'Atelier Studio",
    category: "Apparel • Outerwear",
    price: "$480",
    description: "Tailored luxury coat with sculpted storm flap",
  };

  const visual = {
    tryOnStatus: "success",
    hasGarmentAlignment: true,
  };

  const score = calculateVisualCompatibility(product, visual);
  assert.ok(score >= 90 && score <= 100, `Expected 90-100, got ${score}`);
});

test("Visual Compatibility: degrades appropriately on try-on errors", () => {
  const product = {
    name: "Basic Top",
    brand: "Brand",
    category: "Tops",
    price: "$50",
  };

  const visual = {
    tryOnStatus: "error",
  };

  const score = calculateVisualCompatibility(product, visual);
  assert.ok(score <= 70, `Expected <= 70, got ${score}`);
});

test("Color Compatibility: evaluates warm tones and radiant skin profiles", () => {
  const product = {
    name: "Wool Coat",
    brand: "Brand",
    category: "Outerwear",
    price: "$400",
    color: "#C5A880",
    description: "Warm camel outerwear",
  };

  const skin = {
    skinType: "combination",
    overallScore: 92,
  };

  const pref = {
    colorPalette: "warm",
  };

  const score = calculateColorCompatibility(product, skin, pref);
  assert.ok(score >= 88 && score <= 100, `Expected 88-100, got ${score}`);
});

test("Occasion Compatibility: matches formal occasion with outerwear", () => {
  const product = {
    name: "Trench Coat",
    brand: "Brand",
    category: "Outerwear",
    price: "$400",
    occasion: "Formal & Editorial",
  };

  const score = calculateOccasionCompatibility(product, "Formal");
  assert.equal(score, 94);
});

test("Versatility Index: assigns high versatility to classic outerwear and knitwear", () => {
  const coat = {
    name: "Italian Trench Coat",
    brand: "Brand",
    category: "Outerwear",
    price: "$500",
    description: "Virgin wool classic",
  };

  const score = calculateVersatility(coat);
  assert.ok(score >= 90, `Expected versatility >= 90, got ${score}`);
});

test("User Preference Fit: boosts score for aligned silhouette and aesthetic vibe", () => {
  const coat = {
    name: "Sculpted Tailored Overcoat",
    brand: "Studio",
    category: "Outerwear",
    price: "$480",
    description: "Tailored structured wool silhouette",
  };

  const pref = {
    styleVibe: "editorial",
    fitPreference: "tailored",
  };

  const score = calculateUserPreferenceFit(coat, pref);
  assert.ok(score >= 90, `Expected preference fit >= 90, got ${score}`);
});

test("Full Engine: BUY recommendation for high-scoring product", () => {
  const input = {
    product: {
      name: "Sculpted Italian Wool Trench Coat",
      brand: "L'Atelier Studio",
      category: "Apparel • Outerwear",
      price: "$480",
      color: "#C5A880",
      occasion: "Formal & Editorial",
      description: "Tailored virgin wool coat with sculpted flap",
    },
    visual: {
      tryOnStatus: "success",
      hasGarmentAlignment: true,
    },
    skinProfile: {
      skinType: "combination",
      overallScore: 92,
    },
    occasion: "Formal",
    preferences: {
      styleVibe: "editorial",
      fitPreference: "tailored",
      colorPalette: "warm",
    },
  };

  const result = evaluatePurchaseConfidence(input);

  assert.ok(result.overallScore >= VERDICT_THRESHOLDS.BUY, `Score should be >= 85, got ${result.overallScore}`);
  assert.equal(result.recommendation, "BUY");
  assert.ok(result.recommendationDisclaimer.includes("MirrorIQ recommends BUY"));
  assert.equal(result.factors.length, 5);
});

test("Full Engine: SKIP recommendation for mismatched and failed try-on", () => {
  const input = {
    product: {
      name: "Neon Party Dress",
      brand: "FastBrand",
      category: "Costume",
      price: "$20",
      color: "Neon Green",
      occasion: "Festival",
    },
    visual: {
      tryOnStatus: "error",
    },
    occasion: "Professional Boardroom",
    preferences: {
      styleVibe: "minimalist",
      colorPalette: "neutral",
    },
  };

  const result = evaluatePurchaseConfidence(input);

  assert.ok(result.overallScore < VERDICT_THRESHOLDS.CONSIDER, `Score should be < 70, got ${result.overallScore}`);
  assert.equal(result.recommendation, "SKIP");
  assert.ok(result.recommendationDisclaimer.includes("MirrorIQ recommends SKIP"));
});
