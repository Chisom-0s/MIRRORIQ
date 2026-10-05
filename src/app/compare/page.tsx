import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare products side-by-side to find the best match for you.",
};

export default function ComparePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Compare
        </h1>
        <p className="mt-4 text-neutral-500">
          Side-by-side product comparison and alternative recommendations.
        </p>
      </div>
    </main>
  );
}
