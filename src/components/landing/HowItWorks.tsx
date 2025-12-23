import { Code, Layers, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Write JSX',
    description: 'Define infrastructure using familiar React component syntax with className attributes.',
    icon: Code,
  },
  {
    step: '02',
    title: 'Configure',
    description: 'Set resource properties using intuitive Tailwind-inspired prefix-value pairs.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Generate',
    description: 'Get production-ready Terraform files with best practices baked in.',
    icon: Zap,
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted">Three steps from JSX to deployed infrastructure</p>
        </div>

        {/* Steps - Horizontal on desktop, vertical on mobile */}
        <div className="mt-16 lg:mt-20">
          {/* Desktop: Horizontal layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute left-1/4 right-1/4 top-12 h-px bg-gradient-to-r from-accent/50 via-accent to-accent/50" />

              <div className="relative grid grid-cols-3 gap-8">
                {steps.map((item, index) => (
                  <div key={item.step} className="group relative flex flex-col items-center text-center">
                    {/* Step number ring */}
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-surface transition-all duration-300 group-hover:border-accent/50 group-hover:bg-surface-elevated">
                        <item.icon className="h-8 w-8 text-accent" />
                      </div>
                      {/* Step badge */}
                      <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
                        {index + 1}
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {index < steps.length - 1 && (
                      <div className="absolute -right-4 top-12 hidden lg:block">
                        <ArrowRight className="h-5 w-5 text-accent/50" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical layout */}
          <div className="lg:hidden">
            <div className="relative space-y-8">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-accent via-accent/50 to-transparent" />

              {steps.map((item, index) => (
                <div key={item.step} className="relative flex gap-6">
                  {/* Icon */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
                    <item.icon className="h-5 w-5 text-accent" />
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
