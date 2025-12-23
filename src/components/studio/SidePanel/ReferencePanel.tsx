'use client';

import { componentSchemas } from '@/lib/autocomplete/schema';

interface ReferencePanelProps {
  expandedComponent: string | null;
  onToggle: (name: string) => void;
}

const componentOrder = ['VPC', 'RDS', 'Fargate', 'Lambda', 'S3', 'DynamoDB', 'EC2', 'ALB', 'SecurityGroup'];

export function ReferencePanel({ expandedComponent, onToggle }: ReferencePanelProps) {
  const orderedSchemas = componentOrder
    .map(name => componentSchemas[name])
    .filter(Boolean);

  return (
    <div className="divide-y divide-border">
      {orderedSchemas.map((schema) => (
        <div key={schema.name}>
          <button
            onClick={() => onToggle(schema.name)}
            className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors ${
              expandedComponent === schema.name
                ? 'bg-surface-elevated'
                : 'hover:bg-surface-elevated/50'
            }`}
          >
            <span className="text-sm text-accent">&lt;{schema.name}&gt;</span>
            <span className="text-xs text-muted bg-background px-1.5 py-0.5 rounded">{schema.options.length}</span>
          </button>

          {expandedComponent === schema.name && (
            <div className="bg-background border-t border-border px-3 py-3">
              <div className="flex flex-wrap gap-1.5">
                {schema.options.map((option) => (
                  <span
                    key={option.value}
                    className="rounded-md bg-surface border border-border px-2 py-1 text-xs text-emerald-400"
                    title={option.description}
                  >
                    {option.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
