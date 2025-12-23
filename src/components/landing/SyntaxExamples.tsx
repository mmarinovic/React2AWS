'use client';

import { useState } from 'react';
import { SyntaxHighlight } from './SyntaxHighlight';
import { Database, Container, Zap, Server } from 'lucide-react';

const examples = [
  {
    id: 'database',
    title: 'Database',
    icon: Database,
    code: '<RDS className="engine-postgres instance-lg storage-100gb multi-az backup-14d" name="main-db" />',
  },
  {
    id: 'container',
    title: 'Container',
    icon: Container,
    code: '<Fargate className="mem-2gb cpu-1 port-8080 count-3" name="api-service" />',
  },
  {
    id: 'function',
    title: 'Function',
    icon: Zap,
    code: '<Lambda className="runtime-nodejs22 mem-512mb timeout-30s" name="handler" />',
  },
  {
    id: 'storage',
    title: 'Storage',
    icon: Server,
    code: '<S3 className="acl-private versioned encrypted" name="uploads" />',
  },
];

export function SyntaxExamples() {
  const [activeTab, setActiveTab] = useState('database');
  const activeExample = examples.find(e => e.id === activeTab) || examples[0];

  return (
    <section className="relative bg-background py-24 lg:py-32">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Intuitive Syntax</h2>
          <p className="mt-4 text-lg text-muted">Configuration that feels natural to React developers</p>
        </div>

        {/* Tab selector and code display */}
        <div className="mx-auto mt-16 max-w-3xl">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveTab(example.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === example.id
                    ? 'bg-accent text-background'
                    : 'bg-surface text-muted hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                <example.icon className="h-4 w-4" />
                {example.title}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-surface-elevated px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <span className="text-xs text-muted">{activeExample.title.toLowerCase()}.jsx</span>
            </div>

            {/* Code area */}
            <div className="p-6">
              <SyntaxHighlight code={activeExample.code} />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Component</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              <span>Attribute</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Value</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
