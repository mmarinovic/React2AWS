'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Code, Cpu, FileCode } from 'lucide-react';

interface HowItWorksProps {
  isOpen: boolean;
  onToggle: () => void;
}

const steps = [
  {
    icon: Code,
    title: 'Write JSX',
    description: 'Define your infrastructure using React-like components with Tailwind-inspired className syntax.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Cpu,
    title: 'Parse & Validate',
    description: 'Your code is parsed in real-time, extracting resource configurations from className attributes.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: FileCode,
    title: 'Generate Terraform',
    description: 'Production-ready Terraform files are generated following AWS best practices.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
];

export function HowItWorks({ isOpen, onToggle }: HowItWorksProps) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-foreground">How It Works</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border p-4">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.bgColor}`}>
                  <step.icon className={`h-4 w-4 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">Step {index + 1}</span>
                    <span className="text-sm font-medium text-foreground">{step.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick tips */}
          <div className="mt-4 rounded-lg bg-surface p-3">
            <p className="text-xs font-medium text-foreground mb-2">Quick Tips</p>
            <ul className="space-y-1 text-xs text-muted">
              <li>- Nest resources inside <code className="text-orange-600">&lt;VPC&gt;</code> for proper networking</li>
              <li>- Use <code className="text-emerald-600">multi-az</code> flag for high availability</li>
              <li>- Press <kbd className="rounded bg-white px-1 border border-border">Ctrl+Space</kbd> for autocomplete</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
