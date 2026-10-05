import { notFound } from "next/navigation";
import YouCamTestClient from "./test-client";

export const metadata = {
  title: "YouCam API Test Harness | MirrorIQ Dev",
  robots: {
    index: false,
    follow: false,
  },
};

export default function YouCamTestPage() {
  // Protect route in production
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <span>DEVELOPMENT ONLY</span>
            <span>•</span>
            <span>YOUCAM V2 REAL API HARNESS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            YouCam Service Layer Integration Tester
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Verify real file upload, AI task creation (Skin Analysis & Try-On), polling, and normalized response parsing against the live YouCam V2 API.
          </p>
        </header>

        <YouCamTestClient />
      </div>
    </main>
  );
}
