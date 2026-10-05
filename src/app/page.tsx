import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
        <div className="text-lg font-semibold tracking-tight text-neutral-900">
          MirrorIQ
        </div>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-neutral-500">
          <Link href="/analyze" className="hover:text-neutral-900 transition-colors">
            Analyze
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 sm:py-32">
        <div className="max-w-2xl text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-neutral-400 mb-4">
            Visual Purchase Intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.1]">
            Know what works
            <br />
            before you spend.
          </h1>
          <p className="mt-6 text-lg text-neutral-500 max-w-md mx-auto leading-relaxed">
            AI-powered analysis that tells you whether a product is actually
            right for you — before you buy it.
          </p>
          <div className="mt-10">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-neutral-100">
        <p className="text-xs text-neutral-400 text-center">
          &copy; {new Date().getFullYear()} MirrorIQ. Your visual purchase decision engine.
        </p>
      </footer>
    </main>
  );
}
