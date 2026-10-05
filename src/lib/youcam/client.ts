/**
 * Server-only YouCam HTTP client.
 *
 * - Authenticates with `Authorization: Bearer <API_KEY>` (V2 API, no auth endpoint).
 * - Enforces a request timeout.
 * - Validates every JSON response with Zod before returning it.
 * - Logs method, path, status and duration only. Never keys, never image data.
 */

import "server-only";
import type { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { YouCamError, fromHttpError } from "./errors";
import { errorBodySchema } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

interface YouCamConfig {
  apiKey: string;
  baseUrl: string;
}

function getConfig(): YouCamConfig {
  try {
    const env = getServerEnv();
    return { apiKey: env.YOUCAM_API_KEY, baseUrl: env.YOUCAM_API_BASE_URL.replace(/\/+$/, "") };
  } catch {
    throw new YouCamError(
      "missing_api_key",
      "YouCam is not configured. Set YOUCAM_API_KEY and YOUCAM_API_BASE_URL on the server.",
    );
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

export interface YouCamRequestOptions<S extends z.ZodType> {
  method: "GET" | "POST";
  /** Path beginning with `/s2s/...`. */
  path: string;
  body?: unknown;
  schema: S;
  timeoutMs?: number;
}

/** Call a YouCam endpoint and return the Zod-validated response body. */
export async function youcamRequest<S extends z.ZodType>(
  options: YouCamRequestOptions<S>,
): Promise<z.infer<S>> {
  const { apiKey, baseUrl } = getConfig();
  const started = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${options.path}`, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[youcam] ${options.method} ${options.path} failed after ${Date.now() - started}ms`);
    if (isAbortError(error)) {
      throw new YouCamError("timeout", `YouCam did not respond within ${timeoutMs / 1000}s.`);
    }
    throw new YouCamError("unknown", "Could not reach YouCam.");
  }

  console.info(
    `[youcam] ${options.method} ${options.path} -> ${response.status} (${Date.now() - started}ms)`,
  );

  const text = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }

  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(json);
    const body = parsed.success ? parsed.data : {};
    throw fromHttpError(
      response.status,
      body.error_code,
      body.error ?? body.error_message,
    );
  }

  const parsed = options.schema.safeParse(json);
  if (!parsed.success) {
    console.error(`[youcam] malformed response from ${options.path}:`, parsed.error.issues.map((i) => i.path.join(".")));
    throw new YouCamError("malformed_response", "YouCam returned a response we could not understand.", {
      upstreamStatus: response.status,
    });
  }
  return parsed.data;
}

/** PUT bytes to a pre-signed upload URL returned by the File API. */
export async function putToPresignedUrl(
  url: string,
  headers: Record<string, string>,
  body: Uint8Array,
  timeoutMs = 60_000,
): Promise<void> {
  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers,
      body: Buffer.from(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new YouCamError("timeout", "Uploading the image to YouCam timed out.");
    }
    throw new YouCamError("unknown", "Could not upload the image to YouCam storage.");
  }
  // The pre-signed URL host is intentionally not logged.
  console.info(`[youcam] PUT <presigned> -> ${response.status} (${Date.now() - started}ms)`);
  if (!response.ok) {
    throw new YouCamError(
      "unknown",
      `YouCam storage rejected the upload (HTTP ${response.status}).`,
      { upstreamStatus: response.status },
    );
  }
}
