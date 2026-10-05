import type { Metadata } from "next";
import { Navigation, Footer } from "@/components/navigation";
import CompareClient from "./compare-client";

export const metadata: Metadata = {
  title: "Compare Alternatives",
  description: "Side-by-side visual and decision intelligence product comparison.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <CompareClient />
      </main>
      <Footer />
    </div>
  );
}
