import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { YouCamSkinAnalysisResult, YouCamTryOnResult } from "@/lib/youcam/types";

export interface AnalysisFactor {
  label: string;
  score: number;
  status: "positive" | "neutral" | "warning";
  description: string;
}

export interface ProductAlternative {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  previewUrl?: string;
  confidenceScore: number;
  matchReason: string;
  difference: string;
  colorHex?: string;
}

export interface DecisionResult {
  confidenceScore: number;
  verdict: "recommended" | "neutral" | "not-recommended";
  headline: string;
  summary: string;
  factors: AnalysisFactor[];
  recommendation: string;
  alternatives: ProductAlternative[];
}

export interface AnalysisState {
  // Inputs
  selfieUrl: string | null;
  selfieFileId: string | null;
  productUrl: string | null;
  productFileId: string | null;
  productName: string;
  productBrand: string;
  productCategory: string;
  productPrice: string;
  productColor: string;

  // Processing state
  analysisStage:
    | "idle"
    | "preparing_profile"
    | "analyzing_selection"
    | "creating_preview"
    | "preparing_comparison"
    | "completed"
    | "error";
  errorMessage: string | null;

  // Database session
  sessionId: string | null;
  productId: string | null;

  // Outputs
  tryOnResult: YouCamTryOnResult | null;
  skinAnalysisResult: YouCamSkinAnalysisResult | null;
  decisionResult: DecisionResult | null;

  // History / Workspace items
  history: Array<{
    id: string;
    date: string;
    productName: string;
    productBrand: string;
    productUrl: string;
    previewUrl: string;
    confidenceScore: number;
    verdict: string;
  }>;

  // Actions
  setSessionId: (id: string | null) => void;
  setSelfie: (url: string, fileId?: string) => void;
  setProduct: (data: {
    url: string;
    fileId?: string;
    name: string;
    brand?: string;
    category?: string;
    price?: string;
    color?: string;
  }) => void;
  setAnalysisStage: (stage: AnalysisState["analysisStage"], error?: string) => void;
  setAnalysisOutputs: (data: {
    tryOn?: YouCamTryOnResult | null;
    skinAnalysis?: YouCamSkinAnalysisResult | null;
    decision: DecisionResult;
  }) => void;
  resetAnalysis: () => void;
  loadSampleAnalysis: () => void;
}

export const SAMPLE_SELFIE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop&crop=faces";

export const SAMPLE_PRODUCT = {
  url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop",
  name: "Sculpted Italian Wool Trench Coat",
  brand: "L'Atelier Studio",
  category: "Apparel • Outerwear",
  price: "$480",
  color: "#C5A880",
};

export const SAMPLE_DECISION: DecisionResult = {
  confidenceScore: 91,
  verdict: "recommended",
  headline: "High Purchase Confidence — Exceptional Silhouette & Color Synergy",
  summary:
    "The tailored shoulder structure and warm camel hue create balanced contrast with your undertones. Proportions align with your visual profile with negligible return risk.",
  factors: [
    {
      label: "Color & Undertone Harmony",
      score: 94,
      status: "positive",
      description: "Warm neutral tones enhance facial radiance with 94% chromatic alignment.",
    },
    {
      label: "Silhouette & Proportion Fit",
      score: 90,
      status: "positive",
      description: "Structured collar and lapel line elongate neckline and balance upper proportions.",
    },
    {
      label: "Fabric & Drape Compatibility",
      score: 89,
      status: "positive",
      description: "Mid-weight wool drape holds structure cleanly without bulk in active movement.",
    },
    {
      label: "Wardrobe Versatility Index",
      score: 92,
      status: "positive",
      description: "Pairs seamlessly across formal tailoring, denim essentials, and evening silhouettes.",
    },
  ],
  recommendation:
    "Highly Recommended. This piece strongly enhances your visual frame. The high score indicates a product you will wear frequently with minimal post-purchase hesitation.",
  alternatives: [
    {
      id: "alt-1",
      name: "Relaxed Double-Breasted Cashmere Trench",
      brand: "Maison Minimal",
      price: "$620",
      imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80&auto=format&fit=crop",
      previewUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80&auto=format&fit=crop",
      confidenceScore: 88,
      matchReason: "Softer shoulder drape for casual styling",
      difference: "Less structured collar, slightly cooler undertone",
      colorHex: "#D8C7B5",
    },
    {
      id: "alt-2",
      name: "Structured Belted Wool Overcoat in Noir",
      brand: "Vanguard Atelier",
      price: "$450",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80&auto=format&fit=crop",
      previewUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80&auto=format&fit=crop",
      confidenceScore: 84,
      matchReason: "High contrast sharp evening silhouette",
      difference: "Deep black tone requires bolder styling contrast",
      colorHex: "#1C1917",
    },
  ],
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      selfieUrl: null,
      selfieFileId: null,
      productUrl: null,
      productFileId: null,
      productName: "",
      productBrand: "",
      productCategory: "",
      productPrice: "",
      productColor: "",

      analysisStage: "idle",
      errorMessage: null,

      sessionId: null,
      productId: null,

      tryOnResult: null,
      skinAnalysisResult: null,
      decisionResult: null,

      history: [
        {
          id: "hist-1",
          date: "Oct 5, 2026",
          productName: "Sculpted Italian Wool Trench Coat",
          productBrand: "L'Atelier Studio",
          productUrl: SAMPLE_PRODUCT.url,
          previewUrl: SAMPLE_SELFIE,
          confidenceScore: 91,
          verdict: "Recommended",
        },
        {
          id: "hist-2",
          date: "Oct 2, 2026",
          productName: "Silk Charmeuse Blouse in Crimson Rose",
          productBrand: "Aura Collection",
          productUrl:
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80&auto=format&fit=crop",
          previewUrl: SAMPLE_SELFIE,
          confidenceScore: 86,
          verdict: "Recommended",
        },
      ],

      setSessionId: (id) => set({ sessionId: id }),

      setSelfie: (url, fileId) =>
        set({ selfieUrl: url, selfieFileId: fileId ?? null, errorMessage: null }),

      setProduct: (data) =>
        set({
          productUrl: data.url,
          productFileId: data.fileId ?? null,
          productName: data.name,
          productBrand: data.brand || "Selected Item",
          productCategory: data.category || "Apparel",
          productPrice: data.price || "$240",
          productColor: data.color || "#000000",
          errorMessage: null,
        }),

      setAnalysisStage: (stage, error) =>
        set({ analysisStage: stage, errorMessage: error || null }),

      setAnalysisOutputs: ({ tryOn, skinAnalysis, decision }) =>
        set((state) => ({
          tryOnResult: tryOn ?? null,
          skinAnalysisResult: skinAnalysis ?? null,
          decisionResult: decision,
          analysisStage: "completed",
          errorMessage: null,
          history: [
            {
              id: `hist-${Date.now()}`,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              productName: state.productName || "Analyzed Product",
              productBrand: state.productBrand || "Brand",
              productUrl: state.productUrl || "",
              previewUrl: tryOn?.imageUrl || state.selfieUrl || "",
              confidenceScore: decision.confidenceScore,
              verdict: decision.verdict === "recommended" ? "Recommended" : "Review",
            },
            ...state.history.slice(0, 9),
          ],
        })),

      resetAnalysis: () =>
        set({
          selfieUrl: null,
          selfieFileId: null,
          productUrl: null,
          productFileId: null,
          productName: "",
          productBrand: "",
          productCategory: "",
          productPrice: "",
          productColor: "",
          analysisStage: "idle",
          errorMessage: null,
          tryOnResult: null,
          skinAnalysisResult: null,
          decisionResult: null,
        }),

      loadSampleAnalysis: () =>
        set({
          selfieUrl: SAMPLE_SELFIE,
          productUrl: SAMPLE_PRODUCT.url,
          productName: SAMPLE_PRODUCT.name,
          productBrand: SAMPLE_PRODUCT.brand,
          productCategory: SAMPLE_PRODUCT.category,
          productPrice: SAMPLE_PRODUCT.price,
          productColor: SAMPLE_PRODUCT.color,
          analysisStage: "completed",
          errorMessage: null,
          tryOnResult: { imageUrl: SAMPLE_SELFIE },
          decisionResult: SAMPLE_DECISION,
        }),
    }),
    {
      name: "mirroriq-session-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
