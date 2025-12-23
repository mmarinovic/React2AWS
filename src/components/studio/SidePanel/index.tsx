'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PanelType } from '../ActivityBar';
import { ExampleTemplate } from '@/lib/examples/templates';
import { DocsPanel } from './DocsPanel';
import { ReferencePanel } from './ReferencePanel';
import { ExamplesPanel } from './ExamplesPanel';

interface SidePanelProps {
  activePanel: PanelType;
  onClose: () => void;
  onSelectExample: (template: ExampleTemplate) => void;
  selectedExampleId: string;
}

export function SidePanel({ activePanel, onClose, onSelectExample, selectedExampleId }: SidePanelProps) {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  if (!activePanel) return null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="text-sm font-medium text-foreground">
          {activePanel === 'docs' && 'How it works'}
          {activePanel === 'reference' && 'Syntax Reference'}
          {activePanel === 'examples' && 'Examples'}
        </span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activePanel === 'docs' && <DocsPanel />}
        {activePanel === 'reference' && (
          <ReferencePanel
            expandedComponent={expandedComponent}
            onToggle={(name) => setExpandedComponent(expandedComponent === name ? null : name)}
          />
        )}
        {activePanel === 'examples' && (
          <ExamplesPanel
            selectedId={selectedExampleId}
            onSelect={onSelectExample}
          />
        )}
      </div>
    </div>
  );
}
