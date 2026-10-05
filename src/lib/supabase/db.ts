import { createSupabaseServerClient } from "./server";
import type { DecisionResult } from "@/lib/store";

export interface SaveAnalysisInput {
  productName: string;
  productBrand?: string;
  productCategory?: string;
  productPrice?: string;
  productImageUrl: string;
  previewImageUrl?: string;
  decision: DecisionResult;
  rawYouCamResult?: unknown;
}

export async function persistAnalysisToDb(input: SaveAnalysisInput) {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        product_name: input.productName,
        product_brand: input.productBrand,
        product_category: input.productCategory,
        product_price: input.productPrice,
        product_image_url: input.productImageUrl,
        preview_image_url: input.previewImageUrl,
        confidence_score: input.decision.confidenceScore,
        verdict: input.decision.verdict,
        factors: input.decision.factors,
        recommendation: input.decision.recommendation,
        alternatives: input.decision.alternatives,
        raw_youcam_result: input.rawYouCamResult ?? {},
      })
      .select()
      .single();

    if (error) {
      console.warn("[supabase] Failed to save analysis to db:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("[supabase] Database persistence exception:", err);
    return null;
  }
}
