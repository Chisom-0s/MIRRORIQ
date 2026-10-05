/**
 * YouCam File API: register a file, receive a pre-signed URL + file_id, upload the bytes.
 *
 * Flow (V2 docs): POST /s2s/v2.0/file/{feature} -> PUT bytes to `requests[0].url`
 * -> use `file_id` as `src_file_id` when creating the AI task.
 */

import "server-only";
import { youcamRequest, putToPresignedUrl } from "./client";
import { YouCamError } from "./errors";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  fileApiResponseSchema,
  type YouCamFeature,
  type YouCamUploadResult,
} from "./types";

export interface UploadImageInput {
  feature: YouCamFeature;
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
}

function isAllowedType(type: string): type is (typeof ALLOWED_IMAGE_TYPES)[number] {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

function toStringHeaders(headers: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, String(v)]));
}

export async function uploadImage(input: UploadImageInput): Promise<YouCamUploadResult> {
  if (!isAllowedType(input.contentType)) {
    throw new YouCamError("unsupported_image", "Only JPEG and PNG images are supported.");
  }
  if (input.bytes.byteLength === 0) {
    throw new YouCamError("invalid_image", "The image file is empty.");
  }
  if (input.bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new YouCamError("unsupported_image", "The image is larger than the 10MB limit.");
  }

  const registered = await youcamRequest({
    method: "POST",
    path: `/s2s/v2.0/file/${input.feature}`,
    body: {
      files: [
        {
          content_type: input.contentType,
          file_name: input.fileName,
          file_size: input.bytes.byteLength,
        },
      ],
    },
    schema: fileApiResponseSchema,
  });

  const file = registered.data.files[0];
  const upload = file.requests[0];
  await putToPresignedUrl(upload.url, toStringHeaders(upload.headers), input.bytes);

  return {
    feature: input.feature,
    fileId: file.file_id,
    fileName: file.file_name,
    contentType: file.content_type,
    sizeBytes: input.bytes.byteLength,
  };
}
