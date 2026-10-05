/**
 * Application-level YouCam errors.
 *
 * Raw YouCam error codes/HTTP statuses are mapped to a small, stable set of
 * application codes so the rest of the app never depends on upstream wire formats.
 */

export type YouCamErrorCode =
  | "missing_api_key"
  | "invalid_api_key"
  | "invalid_image"
  | "unsupported_image"
  | "invalid_request"
  | "invalid_task_id"
  | "timeout"
  | "task_failed"
  | "rate_limited"
  | "insufficient_units"
  | "malformed_response"
  | "unknown";

const HTTP_STATUS: Record<YouCamErrorCode, number> = {
  missing_api_key: 503,
  invalid_api_key: 502,
  invalid_image: 422,
  unsupported_image: 415,
  invalid_request: 400,
  invalid_task_id: 404,
  timeout: 504,
  task_failed: 422,
  rate_limited: 429,
  insufficient_units: 402,
  malformed_response: 502,
  unknown: 502,
};

export class YouCamError extends Error {
  readonly code: YouCamErrorCode;
  /** HTTP status YouCam answered with, when there was a response. */
  readonly upstreamStatus?: number;
  /** Raw YouCam error identifier (e.g. `error_no_face`, `CreditInsufficiency`). */
  readonly upstreamCode?: string;

  constructor(
    code: YouCamErrorCode,
    message: string,
    details?: { upstreamStatus?: number; upstreamCode?: string },
  ) {
    super(message);
    this.name = "YouCamError";
    this.code = code;
    this.upstreamStatus = details?.upstreamStatus;
    this.upstreamCode = details?.upstreamCode;
  }

  /** Status code this error should be surfaced with from our own route handlers. */
  get httpStatus(): number {
    return HTTP_STATUS[this.code];
  }

  get retryable(): boolean {
    return this.code === "timeout" || this.code === "rate_limited";
  }

  toJSON(): YouCamErrorBody {
    return {
      code: this.code,
      message: this.message,
      upstreamCode: this.upstreamCode,
      retryable: this.retryable,
    };
  }
}

export interface YouCamErrorBody {
  code: YouCamErrorCode;
  message: string;
  upstreamCode?: string;
  retryable: boolean;
}

/** Map a YouCam HTTP error response (`error_code` field) to an application error. */
export function fromHttpError(
  httpStatus: number,
  upstreamCode: string | undefined,
  upstreamMessage: string | undefined,
): YouCamError {
  const details = { upstreamStatus: httpStatus, upstreamCode };
  const suffix = upstreamMessage ? `: ${upstreamMessage}` : "";

  switch (upstreamCode) {
    case "InvalidApiKey":
    case "InactiveApiKey":
    case "ExpiredApiKey":
      return new YouCamError(
        "invalid_api_key",
        `YouCam rejected the API key (${upstreamCode}).`,
        details,
      );
    case "CreditInsufficiency":
      return new YouCamError(
        "insufficient_units",
        "The YouCam account does not have enough API units for this request.",
        details,
      );
    case "InvalidTaskId":
      return new YouCamError(
        "invalid_task_id",
        "YouCam does not recognise this task ID (it may have expired).",
        details,
      );
    case "TaskTimeout":
      return new YouCamError(
        "timeout",
        "YouCam reported the task did not respond in the expected time.",
        details,
      );
    case "InvalidParameters":
    case "BadRequest":
    case "InvalidStyle":
    case "InvalidStyleGroup":
      return new YouCamError(
        "invalid_request",
        `YouCam rejected the request parameters${suffix}`,
        details,
      );
    default:
      break;
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return new YouCamError("invalid_api_key", "YouCam rejected the credentials.", details);
  }
  if (httpStatus === 429) {
    return new YouCamError(
      "rate_limited",
      "YouCam rate limit reached. Try again shortly.",
      details,
    );
  }
  if (httpStatus === 408 || httpStatus === 504) {
    return new YouCamError("timeout", "YouCam timed out.", details);
  }
  return new YouCamError(
    "unknown",
    `YouCam returned HTTP ${httpStatus}${upstreamCode ? ` (${upstreamCode})` : ""}${suffix}`,
    details,
  );
}

const IMAGE_ERRORS = new Set([
  "error_no_face",
  "error_src_face_too_small",
  "error_decode_image",
  "error_download_image",
  "error_pose",
  "error_face_parsing",
  "error_multiple_people",
  "error_no_shoulder",
  "error_large_face_angle",
  "error_nsfw_content_detected",
  "exceed_nsfw_retry_limits",
]);

const UNSUPPORTED_ERRORS = new Set(["exceed_max_filesize", "error_unsupport_ratio"]);

/** Map the `error` field of a task that finished with `task_status: "error"`. */
export function fromTaskError(
  upstreamCode: string | null | undefined,
  upstreamMessage: string | undefined,
): YouCamError {
  const code = upstreamCode ?? "unknown_internal_error";
  const details = { upstreamCode: code };
  const suffix = upstreamMessage ? ` ${upstreamMessage}` : "";

  if (UNSUPPORTED_ERRORS.has(code)) {
    return new YouCamError(
      "unsupported_image",
      `YouCam cannot accept this image (${code}).${suffix}`,
      details,
    );
  }
  if (IMAGE_ERRORS.has(code)) {
    return new YouCamError(
      "invalid_image",
      `YouCam could not use this image (${code}).${suffix}`,
      details,
    );
  }
  if (code === "invalid_parameter") {
    return new YouCamError("invalid_request", `YouCam rejected a parameter.${suffix}`, details);
  }
  return new YouCamError("task_failed", `The YouCam task failed (${code}).${suffix}`, details);
}
