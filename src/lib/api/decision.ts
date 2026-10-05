/**
 * Decision analysis service module.
 *
 * Uses Claude API for structured product/purchase reasoning.
 * All Claude API interactions MUST go through this module.
 */

import { getServerEnv } from "@/lib/env";

// ─── Types ──────────────────────────────────────────────

export interface DecisionAnalysisRequest {
  skinAnalysis: Record<string, unknown>;
  tryOnResult: Record<string, unknown>;
  productInfo: {
    name: string;
    category: string;
    description?: string;
  };
}

export interface DecisionAnalysisResponse {
  confidence: number;
  verdict: "recommended" | "neutral" | "not-recommended";
  reasoning: string[];
  alternatives?: string[];
}

// ─── Client ─────────────────────────────────────────────

class DecisionClient {
  private readonly apiKey: string;

  constructor() {
    const env = getServerEnv();
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    this.apiKey = env.ANTHROPIC_API_KEY;
  }

  /**
   * Analyze skin/try-on data and return a structured purchase decision.
   */
  async analyze(
    request: DecisionAnalysisRequest,
  ): Promise<DecisionAnalysisResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: this.buildPrompt(request),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(`Claude API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text?: string }>;
    };
    const text = data.content.find((c) => c.type === "text")?.text;

    if (!text) {
      throw new Error("No text response from Claude API");
    }

    return JSON.parse(text) as DecisionAnalysisResponse;
  }

  private buildPrompt(request: DecisionAnalysisRequest): string {
    return [
      "You are a purchase-decision analyst for fashion and beauty products.",
      "Analyze the following skin analysis and virtual try-on results,",
      "then provide a structured JSON purchase recommendation.",
      "",
      "Product:",
      JSON.stringify(request.productInfo, null, 2),
      "",
      "Skin Analysis:",
      JSON.stringify(request.skinAnalysis, null, 2),
      "",
      "Try-On Result:",
      JSON.stringify(request.tryOnResult, null, 2),
      "",
      "Respond with ONLY valid JSON matching this schema:",
      '{',
      '  "confidence": <number 0-100>,',
      '  "verdict": "recommended" | "neutral" | "not-recommended",',
      '  "reasoning": ["<reason1>", "<reason2>", ...],',
      '  "alternatives": ["<alt1>", "<alt2>", ...]',
      '}',
    ].join("\n");
  }
}

// ─── Singleton ──────────────────────────────────────────

let client: DecisionClient | null = null;

/**
 * Get the singleton decision analysis client.
 * Must only be called from server-side code.
 */
export function getDecisionClient(): DecisionClient {
  if (!client) {
    client = new DecisionClient();
  }
  return client;
}
