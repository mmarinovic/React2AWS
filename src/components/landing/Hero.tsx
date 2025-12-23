import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedCodePreview } from './AnimatedCodePreview';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 gradient-radial-top" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        {/* Badge */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-muted">Infrastructure as Code, Reimagined</span>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-8 text-center">
          <h1 className="animate-fade-in-up delay-100 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span className="block">AWS infrastructure as</span>
            <span className="mt-2 block">
              <span className="relative inline-flex items-baseline">
                <span className="text-accent text-glow-orange">&lt;</span>
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">React</span>
                <span className="text-accent text-glow-orange">/&gt;</span>
                {/* Underline accent */}
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              </span>
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl">
            Write JSX with Tailwind-inspired className syntax.
            <span className="text-foreground"> Generate production-ready Terraform.</span>
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/studio"
              className="group relative flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow"
            >
              Open Studio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com/mmarinovic/React2AWS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-7 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-muted hover:bg-surface"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Code Preview */}
        <div className="animate-fade-in-up delay-400 mt-16 lg:mt-20">
          <AnimatedCodePreview />
        </div>

      </div>
    </section>
  );
}
