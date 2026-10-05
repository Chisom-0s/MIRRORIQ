import type { Metadata } from "next";
import { Navigation, Footer } from "@/components/navigation";
import ResultsClient from "./results-client";

export const metadata: Metadata = {
  title: "Analysis Results",
  description: "Your MirrorIQ Purchase Confidence Score and visual decision analysis.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ResultsClient />
      </main>
      <Footer />
    </div>
  );
}
