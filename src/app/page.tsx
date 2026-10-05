import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Navigation, Footer } from "@/components/navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navigation />

      <main className="flex-1 flex flex-col">
        {/* ─── Hero Section ───────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 border-b border-neutral-100 bg-gradient-to-b from-neutral-50/70 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Core Value Proposition */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-medium tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Visual Purchase Intelligence</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-950 leading-[1.08] max-w-2xl">
                  Know what works <br className="hidden sm:inline" />
                  <span className="font-serif italic font-normal text-neutral-700">before</span> you spend.
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-xl leading-relaxed">
                  MirrorIQ combines visual AI, virtual try-on and decision intelligence to help you make more confident fashion and beauty purchases.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/analyze"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-neutral-950 text-white px-8 py-4 text-sm font-semibold tracking-wide uppercase rounded-lg hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl active:scale-95 group"
                  >
                    <span>Analyze a product</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-neutral-700 px-6 py-4 text-sm font-medium hover:text-neutral-950 transition-colors rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    See how it works
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </a>
                </div>

                {/* 3 Value Pillars */}
                <div className="pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-900">Visual VTO</p>
                    <p className="text-[11px] text-neutral-500 leading-tight">Accurate live rendering</p>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 pl-4">
                    <p className="text-xs font-semibold text-neutral-900">Decision Score</p>
                    <p className="text-[11px] text-neutral-500 leading-tight">Objective 0-100 index</p>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 pl-4">
                    <p className="text-xs font-semibold text-neutral-900">Zero Regret</p>
                    <p className="text-[11px] text-neutral-500 leading-tight">Avoid costly returns</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Product vs Preview Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl p-4 sm:p-5 space-y-4">
                  
                  {/* Card Header with Decision Score */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                        Live Simulation
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        Italian Wool Trench Coat
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-800 font-mono">91%</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Confidence</span>
                    </div>
                  </div>

                  {/* Visual Side-by-Side Snapshot */}
                  <div className="grid grid-cols-2 gap-3 relative">
                    <div className="space-y-1.5">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 relative border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&auto=format&fit=crop"
                          alt="Original Product"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] font-medium tracking-wide uppercase bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                          Original Product
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 relative border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop&crop=faces"
                          alt="MirrorIQ Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] font-medium tracking-wide uppercase bg-neutral-950 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                          MirrorIQ Preview
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Factors Preview */}
                  <div className="bg-neutral-50 rounded-xl p-3 space-y-2 border border-neutral-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Undertone Harmony
                      </span>
                      <span className="font-mono font-semibold text-neutral-900">94%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Silhouette Compatibility
                      </span>
                      <span className="font-mono font-semibold text-neutral-900">90%</span>
                    </div>
                  </div>

                  <Link
                    href="/analyze"
                    className="block w-full py-2.5 text-center text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Try Analysis on Your Photo →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── 3-Step "How It Works" Section (Under 10 Seconds) ─ */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-mono tracking-widest text-neutral-400">
                Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight mt-1">
                How MirrorIQ Works
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                Three friction-free steps to objective visual purchase clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4 hover:border-neutral-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-mono font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Show us you.
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Upload a clear portrait selfie. Our visual engine extracts your facial geometry, undertones, and proportions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4 hover:border-neutral-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-mono font-bold text-sm">
                  2
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  What are you considering?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Upload any apparel or beauty item you are considering purchasing online or in-store.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4 hover:border-neutral-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-mono font-bold text-sm">
                  3
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  See it on you & decide.
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Experience realistic VTO simulation and receive MirrorIQ’s comprehensive Purchase Confidence Score before you check out.
                </p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-neutral-950 text-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all shadow-sm"
              >
                Launch Analysis Flow
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
