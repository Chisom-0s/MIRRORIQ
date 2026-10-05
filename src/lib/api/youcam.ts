/**
 * YouCam API service module.
 *
 * All YouCam API interactions MUST go through this module.
 * Never call the YouCam API directly from React components.
 * Never expose API credentials to the browser.
 */

import { getServerEnv } from "@/lib/env";

// ─── Types ──────────────────────────────────────────────

export interface YouCamUploadResponse {
  imageId: string;
  imageUrl: string;
}

export interface YouCamSkinAnalysis {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  results?: Record<string, unknown>;
}

export interface YouCamTryOnRequest {
  selfieImageId: string;
  productImageId: string;
  category: string;
}

export interface YouCamTryOnResponse {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  resultImageUrl?: string;
}

export interface YouCamTaskStatus {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: Record<string, unknown>;
  error?: string;
}

// ─── Client ─────────────────────────────────────────────

class YouCamClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const env = getServerEnv();
    this.apiKey = env.YOUCAM_API_KEY;
    this.baseUrl = env.YOUCAM_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new YouCamApiError(
        `YouCam API error ${response.status}: ${errorBody}`,
        response.status,
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Upload an image to YouCam for processing.
   */
  async uploadImage(imageData: FormData): Promise<YouCamUploadResponse> {
    const url = `${this.baseUrl}/upload`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: imageData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new YouCamApiError(
        `YouCam upload error ${response.status}: ${errorBody}`,
        response.status,
      );
    }

    return response.json() as Promise<YouCamUploadResponse>;
  }

  /**
   * Start a skin analysis task.
   */
  async startSkinAnalysis(imageId: string): Promise<YouCamSkinAnalysis> {
    return this.request<YouCamSkinAnalysis>("/skin-analysis", {
      method: "POST",
      body: JSON.stringify({ imageId }),
    });
  }

  /**
   * Start a virtual try-on task.
   */
  async startTryOn(params: YouCamTryOnRequest): Promise<YouCamTryOnResponse> {
    return this.request<YouCamTryOnResponse>("/try-on", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Check the status of an asynchronous task.
   */
  async getTaskStatus(taskId: string): Promise<YouCamTaskStatus> {
    return this.request<YouCamTaskStatus>(`/task/${taskId}`);
  }
}

// ─── Error ──────────────────────────────────────────────

export class YouCamApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "YouCamApiError";
  }
}

// ─── Singleton ──────────────────────────────────────────

let client: YouCamClient | null = null;

/**
 * Get the singleton YouCam API client.
 * Must only be called from server-side code.
 */
export function getYouCamClient(): YouCamClient {
  if (!client) {
    client = new YouCamClient();
  }
  return client;
}
