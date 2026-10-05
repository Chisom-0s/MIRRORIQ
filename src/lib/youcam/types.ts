/**
 * YouCam wire schemas (validated with Zod) and normalized application types.
 *
 * Source: official YouCam API V2 OpenAPI (https://yce.perfectcorp.com/document/index.html).
 * Raw shapes live here only; the rest of the app consumes the normalized types.
 */

import { z } from "zod";

// ─── Features ───────────────────────────────────────────────

/** Supported YouCam V2 features. The value is the path segment after /file and /task. */
export const YOUCAM_FEATURES = ["skin-analysis", "makeup-vto"] as const;
export type YouCamFeature = (typeof YOUCAM_FEATURES)[number];
export const youCamFeatureSchema = z.enum(YOUCAM_FEATURES);

/** SD (standard) skin analysis actions from the V2 docs. SD and HD cannot be mixed. */
export const SKIN_ANALYSIS_SD_ACTIONS = [
  "wrinkle",
  "droopy_upper_eyelid",
  "droopy_lower_eyelid",
  "firmness",
  "acne",
  "moisture",
  "eye_bag",
  "dark_circle_v2",
  "age_spot",
  "radiance",
  "redness",
  "oiliness",
  "pore",
  "texture",
  "tear_trough",
  "skin_type",
] as const;
export type SkinAnalysisAction = (typeof SKIN_ANALYSIS_SD_ACTIONS)[number];
export const skinAnalysisActionSchema = z.enum(SKIN_ANALYSIS_SD_ACTIONS);

// ─── Upload ─────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;
/** The File API rejects files larger than 10MB. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const fileApiResponseSchema = z.object({
  status: z.number().optional(),
  data: z.object({
    files: z
      .array(
        z.object({
          content_type: z.string(),
          file_name: z.string(),
          file_id: z.string().min(1),
          requests: z
            .array(
              z.object({
                headers: z.record(z.string(), z.union([z.string(), z.number()])),
                url: z.string().url(),
                method: z.string(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),
});
export type FileApiResponse = z.infer<typeof fileApiResponseSchema>;

export interface YouCamUploadResult {
  feature: YouCamFeature;
  fileId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

// ─── Tasks ──────────────────────────────────────────────────

export const runTaskResponseSchema = z.object({
  status: z.number().optional(),
  data: z.object({ task_id: z.string().min(1) }),
});

export const taskStatusResponseSchema = z.object({
  status: z.number().optional(),
  data: z.object({
    task_status: z.enum(["running", "success", "error"]),
    error: z.string().nullish(),
    error_message: z.string().nullish(),
    results: z.unknown().optional(),
  }),
});

export const urlResultsSchema = z.object({ url: z.string().url() });

export const skinAnalysisJsonResultsSchema = z.object({
  output: z.array(
    z.object({
      type: z.string(),
      region: z.string().optional(),
      raw_score: z.number().optional(),
      ui_score: z.number().optional(),
      score: z.number().optional(),
      mask_urls: z.array(z.string()).optional(),
    }),
  ),
});

/** Body YouCam returns with non-2xx responses. */
export const errorBodySchema = z.object({
  status: z.number().optional(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
});

export type YouCamTaskStatus = "running" | "success" | "error";

export interface YouCamSkinMetric {
  type: string;
  region?: string;
  score?: number;
  uiScore?: number;
  rawScore?: number;
  maskUrls: string[];
}

export interface YouCamSkinAnalysisResult {
  metrics: YouCamSkinMetric[];
}

export interface YouCamTryOnResult {
  /** Result image URL. Valid for 2 hours per YouCam docs. */
  imageUrl: string;
}

export interface YouCamTaskCreated {
  feature: YouCamFeature;
  taskId: string;
}

export interface YouCamTaskResult {
  feature: YouCamFeature;
  taskId: string;
  status: YouCamTaskStatus;
  /** Set when `status === "error"`. */
  error?: { code: string; message: string; upstreamCode?: string };
  skinAnalysis?: YouCamSkinAnalysisResult;
  tryOn?: YouCamTryOnResult;
}

// ─── Request inputs (validated at the route boundary) ───────

export const skinAnalysisRequestSchema = z.object({
  fileId: z.string().min(1),
  actions: z.array(skinAnalysisActionSchema).min(1).max(7).optional(),
});
export type SkinAnalysisRequest = z.infer<typeof skinAnalysisRequestSchema>;

/** Every effect needs a `category`; the remaining fields follow the makeup-vto spec. */
export const makeupEffectSchema = z.object({ category: z.string().min(1) }).passthrough();
export type MakeupEffect = z.infer<typeof makeupEffectSchema>;

export const tryOnRequestSchema = z.object({
  fileId: z.string().min(1),
  effects: z.array(makeupEffectSchema).min(1),
});
export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;
