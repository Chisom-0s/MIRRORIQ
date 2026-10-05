import { z } from "zod";

/**
 * Zod Schema for Structured Claude Decision Engine Explanation.
 *
 * Enforces structured format:
 * - headline: Brief punchy verdict headline
 * - summary: Executive summary highlighting key synergy
 * - strengths: Array of 2-4 specific reasons why this works
 * - tradeoffs: Array of 1-3 honest considerations or styling nuances
 * - recommendationExplanation: Nuanced reasoning behind BUY / CONSIDER / SKIP
 */
export const ClaudeDecisionResponseSchema = z.object({
  headline: z.string().min(5).max(160),
  summary: z.string().min(20).max(400),
  strengths: z
    .array(z.string().min(5).max(200))
    .min(2, "Must provide at least 2 strengths")
    .max(5),
  tradeoffs: z
    .array(z.string().min(5).max(200))
    .min(1, "Must provide at least 1 tradeoff")
    .max(4),
  recommendationExplanation: z.string().min(20).max(400),
});

export type ClaudeDecisionResponse = z.infer<typeof ClaudeDecisionResponseSchema>;
