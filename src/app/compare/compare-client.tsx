/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Check,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  useAnalysisStore,
  SAMPLE_PRODUCT,
  SAMPLE_DECISION,
  SAMPLE_SELFIE,
} from "@/lib/store";

export default function CompareClient() {
  const store = useAnalysisStore();

  const primaryProduct = {
    id: "primary",
    name: store.productName || SAMPLE_PRODUCT.name,
    brand: store.productBrand || SAMPLE_PRODUCT.brand,
    price: store.productPrice || SAMPLE_PRODUCT.price,
    imageUrl: store.productUrl || SAMPLE_PRODUCT.url,
    previewUrl: store.tryOnResult?.imageUrl || store.selfieUrl || SAMPLE_SELFIE,
    confidenceScore: store.decisionResult?.confidenceScore || 91,
    matchReason: "High harmonic contrast and tailored fit",
    difference: "Baseline selection",
    colorHex: store.productColor || SAMPLE_PRODUCT.color,
  };

  const alternatives = store.decisionResult?.alternatives || SAMPLE_DECISION.alternatives;
  const allItems = [primaryProduct, ...alternatives];

  const [selectedWinnerId, setSelectedWinnerId] = useState<string>("primary");

  const handleSelectWinner = async (itemId: string) => {
    setSelectedWinnerId(itemId);
    if (store.sessionId) {
      try {
        await fetch("/api/session/comparison", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: store.sessionId,
            scoreA: primaryProduct.confidenceScore,
            scoreB: alternatives[0]?.confidenceScore ?? 85,
          }),
        });
      } catch (e) {
        console.warn("[compare] Supabase comparison persistence note:", e);
      }
    }
  };

  useEffect(() => {
    if (!store.decisionResult) {
      store.loadSampleAnalysis();
    }
  }, [store]);

  return (
    <div className="space-y-10 animate-in fade-in-50">
      {/* ─── Header & Context ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">
            <Link href="/results" className="hover:text-neutral-900">Results</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Side-by-Side Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Compare Alternatives
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Objective side-by-side trade-off analysis evaluated against your visual profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            New Analysis
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all shadow-sm"
          >
            View Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Side-by-Side Comparison Grid ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {allItems.map((item, idx) => {
          const isPrimary = idx === 0;
          const isSelectedWinner = selectedWinnerId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                isSelectedWinner
                  ? "border-neutral-950 ring-2 ring-neutral-950 shadow-2xl bg-white"
                  : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300"
              }`}
            >
              <div className="p-5 sm:p-6 space-y-5">
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                      isPrimary
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {isPrimary ? "Your Selection" : `Alternative #${idx}`}
                  </span>

                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-neutral-950">
                    <span className="text-lg">{item.confidenceScore}%</span>
                    <span className="text-[10px] text-neutral-400 uppercase">Score</span>
                  </div>
                </div>

                {/* Visual Preview Image */}
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-950 relative border border-neutral-200 shadow-inner group">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] text-white flex items-center justify-between">
                    <span className="truncate">{item.brand}</span>
                    <span className="font-mono font-bold text-amber-300">{item.price}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-950 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-neutral-500">{item.brand}</p>
                </div>

                {/* Trade-off Matrix */}
                <div className="space-y-2.5 pt-3 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Strength
                    </span>
                    <p className="text-neutral-800 font-medium mt-0.5">{item.matchReason}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                      Key Difference
                    </span>
                    <p className="text-neutral-600 mt-0.5">{item.difference}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-4 bg-neutral-100/60 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleSelectWinner(item.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isSelectedWinner
                      ? "bg-neutral-950 text-white shadow-md"
                      : "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {isSelectedWinner ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Selected as Preferred
                    </>
                  ) : (
                    "Select as Preferred"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Recommendation Synthesis ──────────────────────────── */}
      <div className="bg-neutral-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">MirrorIQ Comparative Verdict</h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
          Based on undertone analysis and proportional geometry, your primary choice (
          <strong className="text-white">{primaryProduct.name}</strong>) retains the highest overall confidence index ({primaryProduct.confidenceScore}%). If you prefer softer styling for everyday casual wear, Alternative #1 provides a compelling second option.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Scores calculated by MirrorIQ Visual Decision Model</span>
          </div>

          <Link
            href="/results"
            className="sm:ml-auto text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            Back to Detailed Breakdown →
          </Link>
        </div>
      </div>
    </div>
  );
}
