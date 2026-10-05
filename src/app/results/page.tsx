import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results",
  description: "Your purchase confidence score and detailed product analysis.",
};

export default function ResultsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Results
        </h1>
        <p className="mt-4 text-neutral-500">
          Purchase confidence score and detailed analysis will be displayed here.
        </p>
      </div>
    </main>
  );
}
