/**
 * ═════════════════════════════════════════════════════════════════════
 * MirrorIQ Proprietary Purchase Decision Engine — Deterministic Scoring
 * ═════════════════════════════════════════════════════════════════════
 *
 * IMPORTANT:
 * - YouCam AI provides raw visual/try-on and skin metrics.
 * - MirrorIQ calculates the proprietary Purchase Confidence Score.
 * - Claude provides natural language interpretation and structured rationale,
 *   never calculating the score directly.
 *
 * SCORING WEIGHT DISTRIBUTION:
 * 1. Visual Compatibility:        25% (0.25)
 * 2. Color & Undertone Harmony:   25% (0.25)
 * 3. Occasion Compatibility:       20% (0.20)
 * 4. Product Versatility Index:    15% (0.15)
 * 5. User Preference Fit:          15% (0.15)
 * Total:                         100% (1.00)
 *
 * RECOMMENDATION VERDICTS:
 * - Score >= 85: BUY
 * - Score 70–84: CONSIDER
 * - Score < 70:  SKIP
 */

import type {
  DecisionEngineInput,
  PurchaseConfidenceScore,
  RecommendationVerdict,
  ScoreFactor,
  ProductInfo,
  YouCamVisualInput,
  YouCamSkinProfileInput,
  OccasionTarget,
  UserPreferences,
} from "./types";

export const SCORING_WEIGHTS = {
  VISUAL_COMPATIBILITY: 0.25,
  COLOR_COMPATIBILITY: 0.25,
  OCCASION_COMPATIBILITY: 0.2,
  VERSATILITY: 0.15,
  USER_PREFERENCE_FIT: 0.15,
} as const;

export const VERDICT_THRESHOLDS = {
  BUY: 85,
  CONSIDER: 70,
} as const;

/**
 * Normalizes any number to a bounded integer/float between min and max.
 */
function clamp(val: number, min = 0, max = 100): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * 1. Visual Compatibility Scoring (Weight: 25%)
 * Evaluates YouCam VTO rendering status, drape coherence, and visual fit signals.
 */
export function calculateVisualCompatibility(
  product: ProductInfo,
  visual?: YouCamVisualInput,
): number {
  let baseScore = 80;

  if (visual) {
    if (visual.tryOnStatus === "success") {
      baseScore = 90;
      if (visual.confidenceIndicator) {
        baseScore = visual.confidenceIndicator;
      }
      if (visual.hasGarmentAlignment) {
        baseScore += 4;
      }
    } else if (visual.tryOnStatus === "running") {
      baseScore = 75;
    } else if (visual.tryOnStatus === "error") {
      baseScore = 60;
    }
  }

  // Structured tailored items receive higher visual structure index
  const cat = (product.category || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  if (cat.includes("outerwear") || cat.includes("coat") || desc.includes("sculpted") || desc.includes("tailored")) {
    baseScore += 3;
  }

  return clamp(Math.round(baseScore));
}

/**
 * 2. Color & Undertone Compatibility Scoring (Weight: 25%)
 * Evaluates chromatic resonance between product color and user skin profile.
 */
export function calculateColorCompatibility(
  product: ProductInfo,
  skinProfile?: YouCamSkinProfileInput,
  preferences?: UserPreferences,
): number {
  let score = 80;
  const colorStr = (product.color || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const name = (product.name || "").toLowerCase();

  // Color temperature heuristic
  const isWarmColor =
    colorStr.includes("c5a880") ||
    colorStr.includes("camel") ||
    colorStr.includes("rose") ||
    colorStr.includes("gold") ||
    colorStr.includes("9e2a2b") ||
    colorStr.includes("amber") ||
    desc.includes("warm") ||
    desc.includes("crimson");

  const isNeutralColor =
    colorStr.includes("e2dcd5") ||
    colorStr.includes("1c1917") ||
    colorStr.includes("black") ||
    colorStr.includes("noir") ||
    colorStr.includes("oat") ||
    colorStr.includes("charcoal") ||
    desc.includes("heather");

  const isNeonOrClashing =
    colorStr.includes("neon") ||
    colorStr.includes("fluorescent") ||
    name.includes("neon") ||
    desc.includes("neon");

  if (isNeonOrClashing) {
    score = 54;
  } else if (isWarmColor || isNeutralColor) {
    score = 86;
  }

  if (skinProfile) {
    const skinScore = skinProfile.overallScore ?? 85;
    const radianceBonus = skinScore > 80 ? 4 : 0;
    score += radianceBonus;

    if (skinProfile.skinType === "combination" || skinProfile.skinType === "normal") {
      score += 2;
    }
  }

  if (preferences?.colorPalette) {
    const pref = preferences.colorPalette.toLowerCase();
    if (pref === "warm" && isWarmColor) score += 6;
    else if (pref === "neutral" && isNeutralColor) score += 6;
    else if (pref === "high-contrast" && (colorStr.includes("noir") || colorStr.includes("1c1917"))) score += 6;
    else if ((pref === "neutral" || pref === "warm") && isNeonOrClashing) score -= 15;
  }

  return clamp(Math.round(score));
}

/**
 * 3. Occasion Compatibility Scoring (Weight: 20%)
 * Evaluates how appropriately the item serves the user's intended setting.
 */
export function calculateOccasionCompatibility(
  product: ProductInfo,
  occasion?: OccasionTarget,
): number {
  let score = 80;
  const targetOccasion = (occasion || "everyday").toLowerCase();
  const prodOccasion = (product.occasion || "").toLowerCase();
  const prodCat = (product.category || "").toLowerCase();

  const isCostumeOrNovelty = prodCat.includes("costume") || prodOccasion.includes("festival") || prodCat.includes("party");

  if (targetOccasion.includes("boardroom") || targetOccasion.includes("professional") || targetOccasion.includes("work")) {
    if (isCostumeOrNovelty) {
      return 45;
    }
    if (prodCat.includes("outerwear") || prodCat.includes("knitwear") || prodCat.includes("blouse")) {
      score = 92;
    } else {
      score = 80;
    }
  } else if (targetOccasion.includes("formal") || targetOccasion.includes("editorial")) {
    if (isCostumeOrNovelty) {
      return 50;
    }
    if (prodOccasion.includes("formal") || prodOccasion.includes("editorial") || prodCat.includes("outerwear")) {
      score = 94;
    } else if (prodCat.includes("tops") || prodCat.includes("blouse")) {
      score = 88;
    }
  } else if (targetOccasion.includes("evening") || targetOccasion.includes("black tie")) {
    if (prodOccasion.includes("evening") || prodOccasion.includes("black tie") || prodOccasion.includes("night")) {
      score = 93;
    } else {
      score = 78;
    }
  } else if (targetOccasion.includes("casual") || targetOccasion.includes("everyday")) {
    if (prodCat.includes("knitwear") || prodOccasion.includes("casual") || prodOccasion.includes("minimal")) {
      score = 95;
    } else if (prodCat.includes("outerwear")) {
      score = 88;
    }
  }

  return clamp(Math.round(score));
}

/**
 * 4. Product Versatility Scoring (Weight: 15%)
 * Evaluates styling flexibility and multi-scenario longevity.
 */
export function calculateVersatility(product: ProductInfo): number {
  let score = 78;
  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();

  if (cat.includes("costume") || name.includes("neon") || desc.includes("party")) {
    return 48;
  }

  // Outerwear and neutral knitwear have inherently higher versatility
  if (cat.includes("outerwear") || name.includes("trench") || name.includes("coat")) {
    score = 92;
  } else if (cat.includes("knitwear") || name.includes("knit") || name.includes("cashmere")) {
    score = 90;
  } else if (cat.includes("blouse") || name.includes("silk")) {
    score = 86;
  }

  if (desc.includes("virgin wool") || desc.includes("cashmere") || desc.includes("minimalist")) {
    score += 3;
  }

  return clamp(Math.round(score));
}

/**
 * 5. User Preference Fit Scoring (Weight: 15%)
 * Evaluates adherence to user style profile, budget tier, and silhouette vibe.
 */
export function calculateUserPreferenceFit(
  product: ProductInfo,
  preferences?: UserPreferences,
): number {
  let score = 82;

  if (!preferences) {
    return 82;
  }

  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();

  if (preferences.styleVibe) {
    const vibe = preferences.styleVibe.toLowerCase();
    if (vibe === "minimalist") {
      if (name.includes("minimal") || desc.includes("clean") || desc.includes("minimalist")) {
        score += 10;
      } else if (cat.includes("costume") || name.includes("neon")) {
        score -= 25;
      }
    } else if (vibe === "editorial" && (desc.includes("sculpted") || desc.includes("tailored"))) {
      score += 10;
    } else if (vibe === "classic" && (name.includes("trench") || desc.includes("double-breasted"))) {
      score += 8;
    }
  }

  if (preferences.fitPreference) {
    const fit = preferences.fitPreference.toLowerCase();
    if (fit === "tailored" && (desc.includes("tailored") || desc.includes("structured"))) {
      score += 4;
    } else if (fit === "relaxed" && (desc.includes("relaxed") || desc.includes("unstructured"))) {
      score += 4;
    }
  }

  return clamp(Math.round(score));
}

/**
 * Evaluates the deterministic Purchase Confidence Score for a given input.
 */
export function evaluatePurchaseConfidence(
  input: DecisionEngineInput,
): PurchaseConfidenceScore {
  const { product, visual, skinProfile, occasion, preferences } = input;

  const visualCompatibility = calculateVisualCompatibility(product, visual);
  const colorCompatibility = calculateColorCompatibility(product, skinProfile, preferences);
  const occasionCompatibility = calculateOccasionCompatibility(product, occasion);
  const versatility = calculateVersatility(product);
  const userPreferenceFit = calculateUserPreferenceFit(product, preferences);

  // Deterministic Weighted Sum
  const rawOverall =
    visualCompatibility * SCORING_WEIGHTS.VISUAL_COMPATIBILITY +
    colorCompatibility * SCORING_WEIGHTS.COLOR_COMPATIBILITY +
    occasionCompatibility * SCORING_WEIGHTS.OCCASION_COMPATIBILITY +
    versatility * SCORING_WEIGHTS.VERSATILITY +
    userPreferenceFit * SCORING_WEIGHTS.USER_PREFERENCE_FIT;

  const overallScore = clamp(Math.round(rawOverall));

  // Determine Recommendation Verdict
  let recommendation: RecommendationVerdict = "CONSIDER";
  if (overallScore >= VERDICT_THRESHOLDS.BUY) {
    recommendation = "BUY";
  } else if (overallScore < VERDICT_THRESHOLDS.CONSIDER) {
    recommendation = "SKIP";
  }

  // Recommendation Disclaimer statement
  const recommendationDisclaimer = `MirrorIQ recommends ${recommendation} based on the available visual signals and compatibility metrics.`;

  // Factor breakdown for UI presentation
  const factors: ScoreFactor[] = [
    {
      label: "Visual Silhouette & Fit Coherence",
      score: visualCompatibility,
      weightPercentage: 25,
      status: visualCompatibility >= 88 ? "positive" : visualCompatibility >= 75 ? "neutral" : "warning",
      description:
        visualCompatibility >= 88
          ? "Garment structure and shoulder drape align seamlessly with your visual geometry."
          : "Standard drape alignment with mild visual tension along proportional seams.",
    },
    {
      label: "Color & Undertone Harmony",
      score: colorCompatibility,
      weightPercentage: 25,
      status: colorCompatibility >= 88 ? "positive" : colorCompatibility >= 75 ? "neutral" : "warning",
      description:
        colorCompatibility >= 88
          ? "The tonal temperature enhances natural facial radiance with strong chromatic resonance."
          : "Neutral chromatic contrast suitable for layered styling.",
    },
    {
      label: "Occasion Alignment",
      score: occasionCompatibility,
      weightPercentage: 20,
      status: occasionCompatibility >= 88 ? "positive" : occasionCompatibility >= 75 ? "neutral" : "warning",
      description:
        occasionCompatibility >= 88
          ? "Architectural styling specifically calibrated for your intended occasion setting."
          : "Moderate occasion utility across adjacent settings.",
    },
    {
      label: "Wardrobe Versatility Index",
      score: versatility,
      weightPercentage: 15,
      status: versatility >= 88 ? "positive" : versatility >= 75 ? "neutral" : "warning",
      description:
        versatility >= 88
          ? "High rotation potential with clean transitions across multiple seasons and layers."
          : "Specialized silhouette optimized for specific styling ensembles.",
    },
    {
      label: "User Preference Fit",
      score: userPreferenceFit,
      weightPercentage: 15,
      status: userPreferenceFit >= 88 ? "positive" : userPreferenceFit >= 75 ? "neutral" : "warning",
      description:
        userPreferenceFit >= 88
          ? "Strong convergence with your defined aesthetic preferences and silhouette standards."
          : "Balanced alignment with secondary preference criteria.",
    },
  ];

  // Deterministic fallback explanation
  const explanation = `${recommendationDisclaimer} The ${product.name} achieves an overall Purchase Confidence Index of ${overallScore}/100. Visual fit index is scored at ${visualCompatibility}%, color harmony at ${colorCompatibility}%, and occasion alignment at ${occasionCompatibility}%.`;

  return {
    overallScore,
    visualCompatibility,
    colorCompatibility,
    occasionCompatibility,
    versatility,
    userPreferenceFit,
    recommendation,
    recommendationDisclaimer,
    explanation,
    factors,
  };
}
