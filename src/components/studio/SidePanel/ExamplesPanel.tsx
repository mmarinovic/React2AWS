'use client';

import { exampleTemplates, ExampleTemplate } from '@/lib/examples/templates';

interface ExamplesPanelProps {
  selectedId: string;
  onSelect: (template: ExampleTemplate) => void;
}

export function ExamplesPanel({ selectedId, onSelect }: ExamplesPanelProps) {
  return (
    <div className="divide-y divide-border">
      {exampleTemplates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`flex w-full flex-col items-start px-3 py-3 text-left transition-colors ${
            selectedId === template.id
              ? 'bg-accent/10 border-l-2 border-l-accent'
              : 'hover:bg-surface-elevated/50'
          }`}
        >
          <span className="text-sm font-medium text-foreground">{template.name}</span>
          <span className="text-xs text-muted mt-0.5">{template.description}</span>
        </button>
      ))}
    </div>
  );
}
