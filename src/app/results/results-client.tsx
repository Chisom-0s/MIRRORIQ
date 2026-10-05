/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Layers,
  ShieldCheck,
} from "lucide-react";
import {
  useAnalysisStore,
  SAMPLE_SELFIE,
  SAMPLE_PRODUCT,
  SAMPLE_DECISION,
} from "@/lib/store";

export default function ResultsClient() {
  const store = useAnalysisStore();
  const [activeView, setActiveView] = useState<"split" | "preview" | "original">("split");
  const [saved, setSaved] = useState(false);

  // Fallback to sample data if user lands on /results directly
  const productUrl = store.productUrl || SAMPLE_PRODUCT.url;
  const productName = store.productName || SAMPLE_PRODUCT.name;
  const productBrand = store.productBrand || SAMPLE_PRODUCT.brand;
  const productPrice = store.productPrice || SAMPLE_PRODUCT.price;
  const previewUrl = store.tryOnResult?.imageUrl || store.selfieUrl || SAMPLE_SELFIE;
  const decision = store.decisionResult || SAMPLE_DECISION;

  useEffect(() => {
    if (!store.decisionResult) {
      store.loadSampleAnalysis();
    }
  }, [store]);

  return (
    <div className="space-y-10 animate-in fade-in-50">
      {/* ─── Breadcrumb & Title Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">
            <Link href="/" className="hover:text-neutral-900">Home</Link>
            <span>/</span>
            <Link href="/analyze" className="hover:text-neutral-900">Analyze</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Decision Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            {productName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {productBrand} • {productPrice} • Analysis generated for your visual profile
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSaved(!saved)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
              saved
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
            <span>{saved ? "Saved to Workspace" : "Save Analysis"}</span>
          </button>

          <Link
            href="/compare"
            className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all shadow-sm"
          >
            Compare Alternatives
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Main Content Grid: Visual Preview vs Decision Score ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Preview (Original vs MirrorIQ Preview) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 rounded-2xl p-4 sm:p-6 text-white space-y-4 border border-neutral-800 shadow-xl">
            
            {/* View Switcher Controls */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-neutral-300" />
                Visual Comparison Engine
              </span>

              <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveView("split")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    activeView === "split"
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("preview")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    activeView === "preview"
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  MirrorIQ Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("original")}
                  className={`px-3 py-1 rounded font-medium transition-all ${
                    activeView === "original"
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Original Product
                </button>
              </div>
            </div>

            {/* Visual Display */}
            {activeView === "split" && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Original Product */}
                <div className="space-y-2">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
                    <img
                      src={productUrl}
                      alt="Original Product"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] uppercase font-mono tracking-wider text-neutral-300 border border-neutral-700">
                      Original Product
                    </div>
                  </div>
                  <p className="text-center text-[11px] text-neutral-400">Flat/Model Product View</p>
                </div>

                {/* MirrorIQ Preview */}
                <div className="space-y-2">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-950 border border-amber-500/30 relative group shadow-2xl">
                    <img
                      src={previewUrl}
                      alt="MirrorIQ Preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-neutral-950/90 backdrop-blur-md rounded text-[10px] uppercase font-mono tracking-wider text-amber-300 border border-amber-400/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      MirrorIQ Preview
                    </div>
                  </div>
                  <p className="text-center text-[11px] text-amber-300/80 font-medium">
                    Rendered on your profile
                  </p>
                </div>
              </div>
            )}

            {activeView === "preview" && (
              <div className="aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-950 border border-amber-500/30 relative">
                <img
                  src={previewUrl}
                  alt="MirrorIQ Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-neutral-950/90 backdrop-blur-md rounded text-xs uppercase font-mono tracking-wider text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  MirrorIQ High-Resolution Preview
                </div>
              </div>
            )}

            {activeView === "original" && (
              <div className="aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative">
                <img
                  src={productUrl}
                  alt="Original Product"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded text-xs uppercase font-mono tracking-wider text-neutral-300 border border-neutral-700">
                  Original Item View
                </div>
              </div>
            )}

            {/* Quick Actions underneath image */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
              <span>Visual rendering calibrated with skin undertones</span>
              <Link href="/analyze" className="text-amber-400 hover:underline">
                Re-upload with another photo ↺
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Decision Intelligence & Scores */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Purchase Confidence Score Card */}
          <div className="bg-white border-2 border-neutral-950 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  Decision Engine
                </span>
                <h2 className="text-base font-semibold text-neutral-900">
                  Purchase Confidence
                </h2>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Recommended
              </div>
            </div>

            {/* Large Score Display */}
            <div className="flex items-baseline gap-4 py-3 border-y border-neutral-100">
              <span className="text-6xl sm:text-7xl font-bold tracking-tight text-neutral-950 font-mono">
                {decision.confidenceScore}
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-neutral-900">
                  {decision.confidenceScore >= 85
                    ? "High Purchase Confidence"
                    : decision.confidenceScore >= 70
                      ? "Moderate Purchase Confidence"
                      : "Low Purchase Confidence"}
                </p>
                <p className="text-xs text-neutral-500">
                  {decision.headline || "Calibrated across 5 visual compatibility signals"}
                </p>
              </div>
            </div>

            {/* Why MirrorIQ thinks this works */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                Why MirrorIQ thinks this works
              </h3>
              <div className="space-y-2">
                {(decision.strengths && decision.strengths.length > 0
                  ? decision.strengths
                  : [
                      "Color temperature aligns with visual profile at 94% chromatic harmony.",
                      "Occasion suitability is rated at 92% for your intended setting.",
                      "Drape and silhouette coherence provides structured visual balance.",
                    ]
                ).map((strength, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-800 leading-relaxed bg-neutral-50/80 p-2.5 rounded-lg border border-neutral-200/70">
                    <span className="text-emerald-600 font-semibold shrink-0 mt-0.5">✓</span>
                    <span>{strength.replace(/^✓\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tradeoffs */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <span className="text-amber-600 font-bold">△</span>
                Tradeoffs
              </h3>
              <div className="space-y-2">
                {(decision.tradeoffs && decision.tradeoffs.length > 0
                  ? decision.tradeoffs
                  : [
                      "Structured tailoring requires intentional styling balance with casual wardrobe layers.",
                    ]
                ).map((tradeoff, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-800 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70">
                    <span className="text-amber-600 font-semibold shrink-0 mt-0.5">△</span>
                    <span>{tradeoff.replace(/^△\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Box */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                decision.recommendation === "BUY" || decision.confidenceScore >= 85
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
                  : decision.recommendation === "CONSIDER" || decision.confidenceScore >= 70
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-950"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold opacity-75">
                  Recommendation
                </span>
                <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider bg-white/80 border shadow-xs">
                  {decision.recommendation || (decision.confidenceScore >= 85 ? "BUY" : decision.confidenceScore >= 70 ? "CONSIDER" : "SKIP")}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {decision.recommendationDisclaimer ||
                  `MirrorIQ recommends ${decision.recommendation || "BUY"} based on the available visual signals.`}
              </p>
            </div>

            {/* Critical Label: Clearly state this is MirrorIQ's score */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-800 shrink-0" />
              <p className="text-[11px] leading-tight">
                <strong className="text-neutral-900">MirrorIQ Decision Score:</strong> Calculated objectively by MirrorIQ proprietary decision engine.
              </p>
            </div>

            {/* Dimensional Score Factors */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Dimensional Factor Breakdown
              </h3>

              <div className="space-y-3">
                {decision.factors.map((factor) => (
                  <div key={factor.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800">{factor.label}</span>
                      <span className="font-mono font-bold text-neutral-950">{factor.score}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-950 rounded-full transition-all duration-700"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2 pt-2">
              <Link
                href="/compare"
                className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                <span>Compare Alternative Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/workspace"
                className="w-full block text-center py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
              >
                Go to Workspace Hub →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
