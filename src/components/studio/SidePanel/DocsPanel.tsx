'use client';

const steps = [
  { num: 1, title: 'Write JSX', desc: 'Use React-like components with Tailwind-inspired className syntax' },
  { num: 2, title: 'Parse', desc: 'Code is parsed in real-time, extracting configurations' },
  { num: 3, title: 'Generate', desc: 'Production-ready Terraform files following AWS best practices' },
];

export function DocsPanel() {
  return (
    <div className="p-3 space-y-4">
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
              {step.num}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{step.title}</div>
              <div className="text-xs text-muted">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-background border border-border p-3">
        <div className="text-xs font-medium text-foreground mb-2">Syntax Pattern</div>
        <code className="text-xs text-emerald-400">
          {'<Component className="prefix-value" />'}
        </code>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-foreground">Tips</div>
        <ul className="space-y-1 text-xs text-muted">
          <li>• Nest resources inside <code className="text-accent">&lt;VPC&gt;</code></li>
          <li>• Use <code className="text-emerald-400">multi-az</code> for HA</li>
          <li>• Press <kbd className="rounded bg-surface-elevated border border-border px-1">Ctrl+Space</kbd> for autocomplete</li>
        </ul>
      </div>
    </div>
  );
}
