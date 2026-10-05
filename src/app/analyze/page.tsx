import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze",
  description: "Upload your selfie and select a product to begin your purchase analysis.",
};

export default function AnalyzePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Start Your Analysis
        </h1>
        <p className="mt-4 text-neutral-500">
          Upload a selfie and select a product to see how it works for you.
        </p>
      </div>
    </main>
  );
}
