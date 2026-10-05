import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-neutral-400 mb-4">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Page not found
        </h1>
        <p className="mt-4 text-neutral-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
