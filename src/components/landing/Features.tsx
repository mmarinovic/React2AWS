import { Eye, Sparkles, Shield, Download, Globe, Share2 } from 'lucide-react';

const features = [
  {
    title: 'Real-time Preview',
    desc: 'See your infrastructure as you type',
    icon: Eye,
  },
  {
    title: 'Autocomplete',
    desc: 'Smart suggestions for components and options',
    icon: Sparkles,
  },
  {
    title: 'Best Practices',
    desc: 'Terraform modules with security built-in',
    icon: Shield,
  },
  {
    title: 'Download as ZIP',
    desc: 'Get all Terraform files in one click',
    icon: Download,
  },
  {
    title: 'Share Link',
    desc: 'Share your infrastructure with a single URL',
    icon: Share2,
  },
  {
    title: 'Zero Setup',
    desc: 'No installation required, works in browser',
    icon: Globe,
  },
];

export function Features() {
  return (
    <section className="relative bg-surface py-24 lg:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dense opacity-30" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Developers</h2>
          <p className="mt-4 text-lg text-muted">Everything you need to ship infrastructure faster</p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-accent/30"
            >
              {/* Hover gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-accent transition-colors duration-300 group-hover:border-accent/30">
                  <feature.icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
