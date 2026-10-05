import type { Metadata } from "next";
import { Navigation, Footer } from "@/components/navigation";
import AnalyzeClient from "./analyze-client";

export const metadata: Metadata = {
  title: "Analyze Product",
  description:
    "Upload your portrait and product to generate real virtual try-on simulation and MirrorIQ purchase confidence analysis.",
};

export default function AnalyzePage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white selection:bg-white selection:text-neutral-950">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <AnalyzeClient />
      </main>
      <Footer />
    </div>
  );
}
