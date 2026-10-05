/**
 * MirrorIQ Proprietary Decision Engine Types
 *
 * Defines the structural inputs and outputs for deterministic purchase confidence scoring
 * and contextual evaluation.
 */

export type RecommendationVerdict = "BUY" | "CONSIDER" | "SKIP";

export interface ProductInfo {
  id?: string;
  name: string;
  brand: string;
  category: string;
  price: string | number;
  color?: string; // hex code or color name (e.g. "#C5A880", "Camel", "Crimson")
  occasion?: string;
  description?: string;
}

export interface YouCamVisualInput {
  tryOnStatus?: "success" | "running" | "error" | "none";
  resultImageUrl?: string | null;
  confidenceIndicator?: number; // 0-100 visual fit metric if provided
  hasGarmentAlignment?: boolean;
}

export interface YouCamSkinProfileInput {
  skinType?: "oily" | "dry" | "normal" | "combination" | "sensitive" | string;
  overallScore?: number; // 0-100
  metrics?: {
    hydration?: number;
    texture?: number;
    redness?: number;
    acne?: number;
    wrinkles?: number;
    darkCircles?: number;
    pores?: number;
    radiance?: number;
  };
}

export type OccasionTarget =
  | "work"
  | "formal"
  | "evening"
  | "casual"
  | "everyday"
  | "date_night"
  | "vacation"
  | "editorial"
  | string;

export interface UserPreferences {
  styleVibe?: "minimalist" | "bold" | "classic" | "editorial" | "casual" | string;
  colorPalette?: "warm" | "cool" | "neutral" | "high-contrast" | string;
  fitPreference?: "tailored" | "relaxed" | "oversized" | "structured" | string;
  budgetTier?: "budget" | "accessible" | "investment" | "luxury" | string;
}

export interface AlternativeItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl?: string;
  score?: number;
  difference?: string;
}

export interface DecisionEngineInput {
  product: ProductInfo;
  visual?: YouCamVisualInput;
  skinProfile?: YouCamSkinProfileInput;
  occasion?: OccasionTarget;
  preferences?: UserPreferences;
  alternatives?: AlternativeItem[];
}

export interface ScoreFactor {
  label: string;
  score: number;
  weightPercentage: number;
  status: "positive" | "neutral" | "warning";
  description: string;
}

export interface PurchaseConfidenceScore {
  /**
   * Final deterministic MirrorIQ confidence score (0–100).
   * Note: This score is generated exclusively by MirrorIQ's decision logic,
   * not by YouCam.
   */
  overallScore: number;

  /**
   * Dimensional sub-scores (0–100)
   */
  visualCompatibility: number;
  colorCompatibility: number;
  occasionCompatibility: number;
  versatility: number;
  userPreferenceFit: number;

  /**
   * Structured recommendation verdict
   */
  recommendation: RecommendationVerdict;

  /**
   * Disclaimer statement emphasizing visual signal recommendation
   */
  recommendationDisclaimer: string;

  /**
   * Detailed deterministic summary explanation
   */
  explanation: string;

  /**
   * Score factors with individual weights and diagnostics
   */
  factors: ScoreFactor[];
}
