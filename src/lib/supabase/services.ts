import "server-only";
import { createAdminClient } from "./admin";
import type { Database, Json } from "./types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type AnalysisSessionRow = Database["public"]["Tables"]["analysis_sessions"]["Row"];
export type SkinAnalysisRow = Database["public"]["Tables"]["skin_analyses"]["Row"];
export type TryOnResultRow = Database["public"]["Tables"]["try_on_results"]["Row"];
export type DecisionReportRow = Database["public"]["Tables"]["decision_reports"]["Row"];
export type ComparisonRow = Database["public"]["Tables"]["comparisons"]["Row"];

// ─── Products ───────────────────────────────────────────────

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[supabase/services] getProducts error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductById(id: string): Promise<ProductRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[supabase/services] getProductById error:", error.message);
    return null;
  }
  return data;
}

// ─── Analysis Sessions ──────────────────────────────────────

export interface CreateSessionInput {
  userId?: string | null;
  selfieUrl: string;
}

export async function createAnalysisSession(
  input: CreateSessionInput,
): Promise<AnalysisSessionRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("analysis_sessions")
    .insert({
      user_id: input.userId ?? null,
      selfie_url: input.selfieUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase/services] createAnalysisSession error:", error.message);
    return null;
  }
  return data;
}

export async function updateSessionStatus(
  sessionId: string,
  status: "pending" | "processing" | "completed" | "failed",
  completedAt?: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("analysis_sessions")
    .update({
      status,
      completed_at: completedAt ?? (status === "completed" ? new Date().toISOString() : null),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("[supabase/services] updateSessionStatus error:", error.message);
    return false;
  }
  return true;
}

// ─── Skin Analyses ──────────────────────────────────────────

export interface SaveSkinAnalysisInput {
  sessionId: string;
  skinType?: string | null;
  overallScore?: number | null;
  analysisData: Json;
}

export async function saveSkinAnalysis(
  input: SaveSkinAnalysisInput,
): Promise<SkinAnalysisRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("skin_analyses")
    .insert({
      session_id: input.sessionId,
      skin_type: input.skinType ?? null,
      overall_score: input.overallScore ?? null,
      analysis_data: input.analysisData,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase/services] saveSkinAnalysis error:", error.message);
    return null;
  }
  return data;
}

// ─── Try-On Results ─────────────────────────────────────────

export interface SaveTryOnResultInput {
  sessionId: string;
  productId?: string | null;
  sourceImageUrl: string;
  resultImageUrl?: string | null;
  youcamTaskId?: string | null;
  status: "running" | "success" | "error";
}

export async function saveTryOnResult(
  input: SaveTryOnResultInput,
): Promise<TryOnResultRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("try_on_results")
    .insert({
      session_id: input.sessionId,
      product_id: input.productId ?? null,
      source_image_url: input.sourceImageUrl,
      result_image_url: input.resultImageUrl ?? null,
      youcam_task_id: input.youcamTaskId ?? null,
      status: input.status,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase/services] saveTryOnResult error:", error.message);
    return null;
  }
  return data;
}

// ─── Decision Reports ───────────────────────────────────────

export interface SaveDecisionReportInput {
  sessionId: string;
  productId?: string | null;
  confidenceScore: number;
  visualScore?: number | null;
  occasionScore?: number | null;
  preferenceScore?: number | null;
  versatilityScore?: number | null;
  recommendation?: string | null;
  explanation?: string | null;
}

export async function saveDecisionReport(
  input: SaveDecisionReportInput,
): Promise<DecisionReportRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("decision_reports")
    .insert({
      session_id: input.sessionId,
      product_id: input.productId ?? null,
      confidence_score: input.confidenceScore,
      visual_score: input.visualScore ?? null,
      occasion_score: input.occasionScore ?? null,
      preference_score: input.preferenceScore ?? null,
      versatility_score: input.versatilityScore ?? null,
      recommendation: input.recommendation ?? null,
      explanation: input.explanation ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase/services] saveDecisionReport error:", error.message);
    return null;
  }
  return data;
}

// ─── Comparisons ────────────────────────────────────────────

export interface SaveComparisonInput {
  sessionId: string;
  productAId?: string | null;
  productBId?: string | null;
  scoreA?: number | null;
  scoreB?: number | null;
  winnerProductId?: string | null;
}

export async function saveComparison(
  input: SaveComparisonInput,
): Promise<ComparisonRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comparisons")
    .insert({
      session_id: input.sessionId,
      product_a_id: input.productAId ?? null,
      product_b_id: input.productBId ?? null,
      score_a: input.scoreA ?? null,
      score_b: input.scoreB ?? null,
      winner_product_id: input.winnerProductId ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[supabase/services] saveComparison error:", error.message);
    return null;
  }
  return data;
}

// ─── Full Session Query ─────────────────────────────────────

export async function getAnalysisSessionWithDetails(sessionId: string) {
  const supabase = createAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from("analysis_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  const [skinRes, tryOnRes, decisionRes, comparisonsRes] = await Promise.all([
    supabase.from("skin_analyses").select("*").eq("session_id", sessionId),
    supabase.from("try_on_results").select("*, products(*)").eq("session_id", sessionId),
    supabase.from("decision_reports").select("*, products(*)").eq("session_id", sessionId),
    supabase.from("comparisons").select("*").eq("session_id", sessionId),
  ]);

  return {
    session,
    skinAnalyses: skinRes.data ?? [],
    tryOnResults: tryOnRes.data ?? [],
    decisionReports: decisionRes.data ?? [],
    comparisons: comparisonsRes.data ?? [],
  };
}
