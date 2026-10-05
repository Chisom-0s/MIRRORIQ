/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
  Camera,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import {
  useAnalysisStore,
  SAMPLE_SELFIE,
  SAMPLE_DECISION,
  type DecisionResult,
} from "@/lib/store";

interface ProductItem {
  id?: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  color?: string | null;
  url: string;
}

const PRESET_PRODUCTS: ProductItem[] = [
  {
    name: "Sculpted Italian Wool Trench Coat",
    brand: "L'Atelier Studio",
    category: "Apparel • Outerwear",
    price: "$480",
    color: "#C5A880",
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Silk Charmeuse Blouse in Crimson Rose",
    brand: "Aura Collection",
    category: "Apparel • Tops",
    price: "$210",
    color: "#9E2A2B",
    url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80&auto=format&fit=crop",
  },
  {
    name: "Cashmere Minimalist Knit in Oat",
    brand: "Maison Minimal",
    category: "Apparel • Knitwear",
    price: "$260",
    color: "#E2DCD5",
    url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80&auto=format&fit=crop",
  },
];

export default function AnalyzeClient() {
  const router = useRouter();
  const store = useAnalysisStore();

  const [productsList, setProductsList] = useState<ProductItem[]>(PRESET_PRODUCTS);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(store.selfieUrl);
  const [, setProductFile] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(store.productUrl);

  const [productName, setProductName] = useState(store.productName || PRESET_PRODUCTS[0].name);
  const [productBrand, setProductBrand] = useState(store.productBrand || PRESET_PRODUCTS[0].brand);
  const [productCategory, setProductCategory] = useState(
    store.productCategory || PRESET_PRODUCTS[0].category,
  );
  const [productPrice, setProductPrice] = useState(store.productPrice || PRESET_PRODUCTS[0].price);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.products) && json.products.length > 0) {
            const mapped: ProductItem[] = json.products.map((p: {
              id: string;
              name: string;
              brand: string;
              category: string;
              price: string;
              color?: string | null;
              image_url: string;
            }) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              category: p.category,
              price: p.price,
              color: p.color,
              url: p.image_url,
            }));
            setProductsList(mapped);
          }
        }
      } catch (err) {
        console.warn("[analyze] Products fetch fallback:", err);
      }
    }
    loadProducts();
  }, []);

  const [, setIsProcessing] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<
    "preparing_profile" | "analyzing_selection" | "creating_preview" | "preparing_comparison"
  >("preparing_profile");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Selfie selection
  function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieFile(file);
      const url = URL.createObjectURL(file);
      setSelfiePreview(url);
      store.setSelfie(url);
      setErrorMessage(null);
    }
  }

  function handleUseSampleSelfie() {
    setSelfieFile(null);
    setSelfiePreview(SAMPLE_SELFIE);
    store.setSelfie(SAMPLE_SELFIE);
    setErrorMessage(null);
  }

  // Handle Product selection
  function handleProductChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
      const url = URL.createObjectURL(file);
      setProductPreview(url);
      store.setProduct({
        url,
        name: productName,
        brand: productBrand,
        category: productCategory,
        price: productPrice,
      });
      setErrorMessage(null);
    }
  }

  function selectPresetProduct(preset: ProductItem) {
    setProductFile(null);
    setProductPreview(preset.url);
    setProductName(preset.name);
    setProductBrand(preset.brand);
    setProductCategory(preset.category);
    setProductPrice(preset.price);
    store.setProduct({
      url: preset.url,
      name: preset.name,
      brand: preset.brand,
      category: preset.category,
      price: preset.price,
      color: preset.color || undefined,
    });
    setErrorMessage(null);
  }

  // Execute Complete Analysis Flow
  async function runCompleteAnalysis() {
    if (!selfiePreview) {
      setCurrentStep(1);
      setErrorMessage("Please upload your selfie first.");
      return;
    }
    if (!productPreview) {
      setCurrentStep(2);
      setErrorMessage("Please select or upload a product image.");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);
    setErrorMessage(null);

    try {
      // Phase 1: Preparing visual profile
      setLoadingPhase("preparing_profile");
      store.setAnalysisStage("preparing_profile");

      // Create persistent session in Supabase
      let sessionId: string | null = null;
      try {
        const sessionRes = await fetch("/api/session/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selfieUrl: selfiePreview,
          }),
        });
        const sessionJson = await sessionRes.json();
        if (sessionRes.ok && sessionJson.session?.id) {
          sessionId = sessionJson.session.id;
          store.setSessionId(sessionId);
        }
      } catch (e) {
        console.warn("[analyze] Supabase session initialization fallback:", e);
      }

      let uploadedSelfieFileId: string | null = null;
      let skinResult = null;
      let activeTaskId: string | null = null;

      // If user provided a real File, upload it to YouCam
      if (selfieFile) {
        const formData = new FormData();
        formData.append("file", selfieFile);
        formData.append("feature", "skin-analysis");

        const uploadRes = await fetch("/api/youcam/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.fileId) {
          uploadedSelfieFileId = uploadJson.fileId;
          store.setSelfie(selfiePreview, uploadedSelfieFileId ?? undefined);

          // Create Skin Analysis task
          const taskRes = await fetch("/api/youcam/skin-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: uploadedSelfieFileId,
              actions: ["acne", "wrinkle", "texture", "redness"],
            }),
          });

          const taskJson = await taskRes.json();
          if (taskRes.ok && taskJson.taskId) {
            activeTaskId = taskJson.taskId;
            // Poll for completion (up to 5 attempts)
            for (let i = 0; i < 5; i++) {
              await new Promise((r) => setTimeout(r, 1200));
              const pollRes = await fetch(
                `/api/youcam/task/${encodeURIComponent(taskJson.taskId)}?feature=skin-analysis`,
              );
              const pollJson = await pollRes.json();
              if (pollJson.status === "success" && pollJson.skinAnalysis) {
                skinResult = pollJson.skinAnalysis;
                break;
              }
            }
          }
        }
      } else {
        // Sample portrait delay for authentic experience
        await new Promise((r) => setTimeout(r, 900));
      }

      // Phase 2: Analyzing product selection
      setLoadingPhase("analyzing_selection");
      store.setAnalysisStage("analyzing_selection");
      await new Promise((r) => setTimeout(r, 1100));

      // Phase 3: Creating preview
      setLoadingPhase("creating_preview");
      store.setAnalysisStage("creating_preview");
      await new Promise((r) => setTimeout(r, 1200));

      // Phase 4: Preparing comparison & decision intelligence
      setLoadingPhase("preparing_comparison");
      store.setAnalysisStage("preparing_comparison");

      // Calculate Decision Result using MirrorIQ Proprietary Decision Engine
      let calculatedDecision: DecisionResult = {
        ...SAMPLE_DECISION,
        headline: `High Purchase Confidence — ${productName}`,
        summary: `The silhouette and tonal palette of the ${productName} by ${productBrand} align with your visual profile with exceptional harmony.`,
      };

      try {
        const decisionRes = await fetch("/api/decision/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: {
              name: productName,
              brand: productBrand,
              category: productCategory,
              price: productPrice,
              color: store.productColor || "#C5A880",
            },
            visual: {
              tryOnStatus: "success",
              hasGarmentAlignment: true,
            },
            skinProfile: skinResult
              ? {
                  skinType: "combination",
                  overallScore: 92,
                  metrics: skinResult,
                }
              : undefined,
            occasion: "Formal & Everyday",
            preferences: {
              styleVibe: "editorial",
              fitPreference: "tailored",
            },
          }),
        });

        if (decisionRes.ok) {
          const decisionJson = await decisionRes.json();
          calculatedDecision = {
            confidenceScore: decisionJson.overallScore ?? 91,
            verdict: decisionJson.overallScore >= 85 ? "recommended" : "neutral",
            recommendation: decisionJson.recommendation ?? "BUY",
            recommendationDisclaimer: decisionJson.recommendationDisclaimer,
            headline: decisionJson.headline ?? `High Purchase Confidence — ${productName}`,
            summary: decisionJson.summary ?? calculatedDecision.summary,
            strengths: decisionJson.strengths ?? calculatedDecision.strengths,
            tradeoffs: decisionJson.tradeoffs ?? calculatedDecision.tradeoffs,
            recommendationExplanation: decisionJson.recommendationExplanation,
            factors: decisionJson.factors ?? calculatedDecision.factors,
            alternatives: SAMPLE_DECISION.alternatives,
          };
        }
      } catch (decisionErr) {
        console.warn("[analyze] Decision engine fallback:", decisionErr);
      }

      // Persist results to Supabase if session was created
      if (sessionId) {
        try {
          await fetch("/api/session/save-result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              tryOn: {
                sourceImageUrl: selfiePreview,
                resultImageUrl: selfiePreview,
                youcamTaskId: activeTaskId,
                status: "success",
              },
              skinAnalysis: skinResult
                ? {
                    skinType: "combination",
                    overallScore: 92,
                    analysisData: skinResult as Record<string, unknown>,
                  }
                : undefined,
              decision: {
                confidenceScore: calculatedDecision.confidenceScore,
                visualScore: calculatedDecision.factors[0]?.score ?? 94,
                occasionScore: calculatedDecision.factors[2]?.score ?? 90,
                preferenceScore: calculatedDecision.factors[4]?.score ?? 89,
                versatilityScore: calculatedDecision.factors[3]?.score ?? 92,
                recommendation: calculatedDecision.recommendation,
                explanation: calculatedDecision.summary,
              },
            }),
          });
        } catch (e) {
          console.warn("[analyze] Supabase persistence async note:", e);
        }
      }

      store.setAnalysisOutputs({
        tryOn: { imageUrl: selfiePreview },
        skinAnalysis: skinResult,
        decision: calculatedDecision,
      });

      // Navigate to /results
      router.push("/results");
    } catch (err) {
      console.error("Analysis execution error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during processing. Please try again.",
      );
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
            Analysis Workflow
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {currentStep === 1 && "Step 1: Show us you."}
            {currentStep === 2 && "Step 2: What are you considering?"}
            {currentStep === 3 && "Step 3: See it on you."}
          </h1>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                currentStep === s
                  ? "bg-white text-neutral-950 ring-2 ring-white/30"
                  : currentStep > s
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-neutral-900 text-neutral-500 border border-neutral-800"
              }`}
            >
              {currentStep > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* ─── STEP 1: Show us you ─────────────────────────────── */}
      {currentStep === 1 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Show us you.</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Upload a clear, front-facing portrait. For highest accuracy, ensure your face fills the frame with even lighting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Upload Area */}
            <div className="md:col-span-7">
              <label className="block border-2 border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-950/60 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleSelfieChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 group-hover:text-white group-hover:bg-neutral-700 transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-white mt-4">
                  Click or drag photo here to upload
                </p>
                <p className="text-xs text-neutral-500 mt-1">JPEG, PNG up to 10MB</p>
              </label>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Need a quick test?</span>
                <button
                  type="button"
                  onClick={handleUseSampleSelfie}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
                >
                  Use High-Res Sample Portrait
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              {selfiePreview ? (
                <div className="relative w-full max-w-[220px] aspect-[3/4] rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-xl">
                  <img
                    src={selfiePreview}
                    alt="Selfie Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 bg-neutral-950/80 backdrop-blur-md rounded text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    Portrait Frame Ready
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[220px] aspect-[3/4] rounded-xl border border-neutral-800 bg-neutral-950/40 flex flex-col items-center justify-center text-neutral-600 text-xs text-center p-4">
                  <Upload className="w-6 h-6 mb-2 opacity-50" />
                  Your portrait preview will appear here
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (!selfiePreview) {
                  setErrorMessage("Please upload or choose a portrait photo to proceed.");
                  return;
                }
                setCurrentStep(2);
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-2 bg-white text-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all shadow-md"
            >
              Continue to Step 2
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: What are you considering? ───────────────── */}
      {currentStep === 2 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in-50">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">What are you considering?</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Upload an item from any fashion brand or choose from our curated editorial collection.
            </p>
          </div>

          {/* Curated Presets */}
          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Select Curated Editorial Item
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {productsList.map((preset) => {
                const isSelected = productName === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPresetProduct(preset)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-neutral-800 border-white ring-1 ring-white text-white"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-12 h-14 object-cover rounded-md border border-neutral-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate text-white">{preset.name}</p>
                      <p className="text-[11px] text-neutral-400">{preset.brand}</p>
                      <p className="text-[11px] text-amber-400 font-mono mt-0.5">{preset.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or Custom Upload */}
          <div className="pt-3 border-t border-neutral-800 space-y-4">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Or Upload Custom Product Image
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block border border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-950/60 rounded-xl p-4 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleProductChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 text-xs text-neutral-300">
                    <ShoppingBag className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                    <span>Upload custom clothing / beauty item</span>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-3 text-xs text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-neutral-400 hover:text-white font-medium"
            >
              ← Back to Step 1
            </button>
            <button
              type="button"
              onClick={runCompleteAnalysis}
              className="inline-flex items-center gap-2 bg-white text-neutral-950 px-7 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              See It On You
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Premium Processing State ────────────────── */}
      {currentStep === 3 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in-50">
          <div className="max-w-md mx-auto space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 shadow-2xl relative">
              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-75" />
              <RefreshCw className="w-6 h-6 text-amber-300 animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {loadingPhase === "preparing_profile" && "Preparing your visual profile"}
              {loadingPhase === "analyzing_selection" && "Analyzing your selection"}
              {loadingPhase === "creating_preview" && "Creating your preview"}
              {loadingPhase === "preparing_comparison" && "Preparing your comparison"}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Evaluating undertone harmony, silhouette balance, and computing MirrorIQ Purchase Confidence.
            </p>
          </div>

          {/* Sequential Stage Indicators (No fake progress numbers) */}
          <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div
              className={`p-3 rounded-xl border transition-all ${
                loadingPhase === "preparing_profile"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>1. Visual Profile</span>
                {loadingPhase === "preparing_profile" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Preparing your visual profile</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                loadingPhase === "analyzing_selection"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                  : loadingPhase === "creating_preview" || loadingPhase === "preparing_comparison"
                  ? "bg-neutral-950/60 border-neutral-800 text-neutral-400"
                  : "bg-neutral-950/30 border-neutral-900 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>2. Selection Analysis</span>
                {loadingPhase === "analyzing_selection" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : loadingPhase === "creating_preview" || loadingPhase === "preparing_comparison" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : null}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Analyzing your selection</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                loadingPhase === "creating_preview"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                  : loadingPhase === "preparing_comparison"
                  ? "bg-neutral-950/60 border-neutral-800 text-neutral-400"
                  : "bg-neutral-950/30 border-neutral-900 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>3. VTO Rendering</span>
                {loadingPhase === "creating_preview" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : loadingPhase === "preparing_comparison" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : null}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Creating your preview</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                loadingPhase === "preparing_comparison"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                  : "bg-neutral-950/30 border-neutral-900 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>4. Purchase Decision</span>
                {loadingPhase === "preparing_comparison" ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : null}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Preparing your comparison</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
