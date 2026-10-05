/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Plus,
} from "lucide-react";
import { useAnalysisStore, SAMPLE_SELFIE, SAMPLE_PRODUCT } from "@/lib/store";

export default function WorkspaceClient() {
  const store = useAnalysisStore();

  useEffect(() => {
    if (!store.decisionResult) {
      store.loadSampleAnalysis();
    }
  }, [store]);

  const activeSelfie = store.selfieUrl || SAMPLE_SELFIE;
  const history = store.history;

  return (
    <div className="space-y-10 animate-in fade-in-50">
      {/* ─── Header & Top Action ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Personal Intelligence Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 mt-1">
            Visual Decision Workspace
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage your visual profile, active wardrobe analyses, and decision history.
          </p>
        </div>

        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          New Product Analysis
        </Link>
      </div>

      {/* ─── Visual Profile Summary Card ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-neutral-950 text-white rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Active Profile
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">
                Calibrated
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-md shrink-0">
                <img
                  src={activeSelfie}
                  alt="Active Visual Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">Visual Profile #1</h3>
                <p className="text-xs text-neutral-400">Warm Neutral Undertone</p>
                <p className="text-[11px] text-amber-300/90 font-mono">High Contrast Ratio</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Color Season:</span>
                <span className="text-white font-medium">Autumn Neutral</span>
              </div>
              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Best Contrast Palette:</span>
                <span className="text-white font-medium">Camel, Noir, Crimson</span>
              </div>
            </div>
          </div>

          <Link
            href="/analyze"
            className="w-full text-center py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium rounded-lg transition-colors block"
          >
            Update Profile Portrait
          </Link>
        </div>

        {/* ─── Active Simulation Quick-Look ─────────────────────── */}
        <div className="lg:col-span-8 bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Latest Simulation
              </span>
              <Link
                href="/results"
                className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
              >
                View Full Results →
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
              <div className="w-24 h-28 rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm shrink-0">
                <img
                  src={store.productUrl || SAMPLE_PRODUCT.url}
                  alt="Latest Product"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase font-mono">
                    {store.decisionResult?.confidenceScore ?? 91}% Match
                  </span>
                  <span className="text-xs text-neutral-500">
                    {store.productBrand || SAMPLE_PRODUCT.brand}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-950 truncate">
                  {store.productName || SAMPLE_PRODUCT.name}
                </h3>
                <p className="text-xs text-neutral-600 line-clamp-2">
                  {store.decisionResult?.summary ||
                    "Exceptional shoulder silhouette and chromatic alignment."}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Ready to compare with alternative options?</span>
            <Link
              href="/compare"
              className="font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              Open Comparison Matrix →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Analysis History Gallery ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-950">Recent Analyses</h2>
          <span className="text-xs text-neutral-500 font-mono">{history.length} saved</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{item.date}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">
                    {item.confidenceScore}% Score
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 relative border border-neutral-100">
                  <img
                    src={item.productUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                    {item.productName}
                  </h4>
                  <p className="text-[11px] text-neutral-500">{item.productBrand}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 text-[11px]">{item.verdict}</span>
                <Link
                  href="/results"
                  className="text-neutral-950 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
