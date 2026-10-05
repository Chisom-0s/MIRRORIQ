import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Your active analysis workspace with try-on visualization and results.",
};

export default function WorkspacePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Workspace
        </h1>
        <p className="mt-4 text-neutral-500">
          Your analysis workspace. Try-on results and visual comparisons will appear here.
        </p>
      </div>
    </main>
  );
}
