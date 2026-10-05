/**
 * YouCam AI tasks: create, poll, and normalize results.
 *
 * - POST /s2s/v2.0/task/skin-analysis        body: { src_file_id, dst_actions, format: "json" }
 * - POST /s2s/v2.0/task/makeup-vto           body: { src_file_id, version, effects }
 * - GET  /s2s/v2.0/task/{feature}/{task_id}  -> task_status: running | success | error
 *
 * Callers must keep polling until the status is `success` or `error`; the docs warn
 * that an un-polled task expires (InvalidTaskId) while still consuming units.
 */

import "server-only";
import { youcamRequest } from "./client";
import { YouCamError, fromTaskError } from "./errors";
import {
  runTaskResponseSchema,
  skinAnalysisJsonResultsSchema,
  taskStatusResponseSchema,
  urlResultsSchema,
  type MakeupEffect,
  type SkinAnalysisAction,
  type YouCamFeature,
  type YouCamTaskCreated,
  type YouCamTaskResult,
} from "./types";

/**
 * Default skin analysis concerns. Pricing is tiered by concern count
 * (1-4 concerns vs 5-7), so the default stays at 4.
 */
export const DEFAULT_SKIN_ACTIONS: readonly SkinAnalysisAction[] = [
  "acne",
  "wrinkle",
  "texture",
  "redness",
];

export async function createSkinAnalysisTask(
  fileId: string,
  actions: readonly SkinAnalysisAction[] = DEFAULT_SKIN_ACTIONS,
): Promise<YouCamTaskCreated> {
  const res = await youcamRequest({
    method: "POST",
    path: "/s2s/v2.0/task/skin-analysis",
    body: { src_file_id: fileId, dst_actions: actions, format: "json" },
    schema: runTaskResponseSchema,
  });
  return { feature: "skin-analysis", taskId: res.data.task_id };
}

export async function createTryOnTask(
  fileId: string,
  effects: readonly MakeupEffect[],
): Promise<YouCamTaskCreated> {
  const res = await youcamRequest({
    method: "POST",
    path: "/s2s/v2.0/task/makeup-vto",
    body: { src_file_id: fileId, version: "1.0", effects },
    schema: runTaskResponseSchema,
  });
  return { feature: "makeup-vto", taskId: res.data.task_id };
}

/** Single status check. Returns a normalized result; failed tasks carry `error`. */
export async function getTask(
  feature: YouCamFeature,
  taskId: string,
): Promise<YouCamTaskResult> {
  const res = await youcamRequest({
    method: "GET",
    path: `/s2s/v2.0/task/${feature}/${encodeURIComponent(taskId)}`,
    schema: taskStatusResponseSchema,
  });
  const { task_status, error, error_message, results } = res.data;

  if (task_status === "running") {
    return { feature, taskId, status: "running" };
  }

  if (task_status === "error") {
    const mapped = fromTaskError(error, error_message ?? undefined);
    return {
      feature,
      taskId,
      status: "error",
      error: { code: mapped.code, message: mapped.message, upstreamCode: mapped.upstreamCode },
    };
  }

  // success
  if (feature === "skin-analysis") {
    const parsed = skinAnalysisJsonResultsSchema.safeParse(results);
    if (!parsed.success) {
      throw new YouCamError(
        "malformed_response",
        "Skin analysis finished but the result had an unexpected shape.",
      );
    }
    return {
      feature,
      taskId,
      status: "success",
      skinAnalysis: {
        metrics: parsed.data.output.map((m) => ({
          type: m.type,
          region: m.region,
          score: m.score,
          uiScore: m.ui_score,
          rawScore: m.raw_score,
          maskUrls: m.mask_urls ?? [],
        })),
      },
    };
  }

  const parsed = urlResultsSchema.safeParse(results);
  if (!parsed.success) {
    throw new YouCamError(
      "malformed_response",
      "Try-on finished but the result had no image URL.",
    );
  }
  return { feature, taskId, status: "success", tryOn: { imageUrl: parsed.data.url } };
}
