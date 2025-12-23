import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      {/* Radial gradient */}
      <div className="pointer-events-none absolute inset-0 gradient-radial-center" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Glowing border container */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/50 p-12 backdrop-blur-sm lg:p-16">
          {/* Corner accents */}
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-accent/20 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-accent/20 to-transparent" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Ready to build?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
              Start defining your AWS infrastructure with React components today.
            </p>
            <div className="mt-10">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-background transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow"
              >
                Open Infrastructure Studio
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
