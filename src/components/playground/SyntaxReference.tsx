'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Book } from 'lucide-react';
import { componentSchemas } from '@/lib/autocomplete/schema';

interface SyntaxReferenceProps {
  isOpen: boolean;
  onToggle: () => void;
}

const componentOrder = ['VPC', 'RDS', 'Fargate', 'Lambda', 'S3', 'DynamoDB', 'EC2', 'ALB', 'SecurityGroup'];

export function SyntaxReference({ isOpen, onToggle }: SyntaxReferenceProps) {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const orderedSchemas = componentOrder
    .map(name => componentSchemas[name])
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Syntax Reference</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Pattern explanation */}
          <div className="border-b border-border bg-surface/50 px-4 py-3">
            <p className="text-xs text-muted">
              Use <code className="rounded bg-slate-200 px-1 py-0.5 text-foreground">className</code> with{' '}
              <code className="rounded bg-slate-200 px-1 py-0.5 text-foreground">prefix-value</code> syntax:
            </p>
            <code className="mt-2 block text-xs text-slate-600">
              {'<RDS className="engine-postgres storage-100gb multi-az" />'}
            </code>
          </div>

          {/* Components list */}
          <div className="max-h-[400px] overflow-y-auto">
            {orderedSchemas.map((schema) => (
              <div key={schema.name} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => setExpandedComponent(
                    expandedComponent === schema.name ? null : schema.name
                  )}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-600">&lt;{schema.name}&gt;</span>
                    <span className="text-xs text-muted">{schema.description}</span>
                  </div>
                  {expandedComponent === schema.name ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted" />
                  )}
                </button>

                {expandedComponent === schema.name && (
                  <div className="bg-surface/30 px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {schema.options.map((option) => (
                        <span
                          key={option.value}
                          className="inline-flex items-center rounded bg-white px-2 py-1 text-xs border border-border"
                          title={option.description}
                        >
                          <span className="text-emerald-600">{option.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
