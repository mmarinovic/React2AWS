'use client';

import { X } from 'lucide-react';
import { PanelType } from './ActivityBar';
import { componentSchemas } from '@/lib/autocomplete/schema';
import { exampleTemplates, ExampleTemplate } from '@/lib/examples/templates';
import { useState } from 'react';

interface SidePanelProps {
  activePanel: PanelType;
  onClose: () => void;
  onSelectExample: (template: ExampleTemplate) => void;
  selectedExampleId: string;
}

const componentOrder = ['VPC', 'RDS', 'Fargate', 'Lambda', 'S3', 'DynamoDB', 'EC2', 'ALB', 'SecurityGroup'];

export function SidePanel({ activePanel, onClose, onSelectExample, selectedExampleId }: SidePanelProps) {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  if (!activePanel) return null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-700 bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <span className="text-sm font-medium text-slate-200">
          {activePanel === 'docs' && 'How it works'}
          {activePanel === 'reference' && 'Syntax Reference'}
          {activePanel === 'examples' && 'Examples'}
        </span>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
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

function DocsPanel() {
  const steps = [
    { num: 1, title: 'Write JSX', desc: 'Use React-like components with Tailwind-inspired className syntax' },
    { num: 2, title: 'Parse', desc: 'Code is parsed in real-time, extracting configurations' },
    { num: 3, title: 'Generate', desc: 'Production-ready Terraform files following AWS best practices' },
  ];

  return (
    <div className="p-3 space-y-4">
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
              {step.num}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">{step.title}</div>
              <div className="text-xs text-slate-400">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Syntax Pattern */}
      <div className="rounded-lg bg-slate-900 p-3">
        <div className="text-xs font-medium text-slate-300 mb-2">Syntax Pattern</div>
        <code className="text-xs text-emerald-400">
          {'<Component className="prefix-value" />'}
        </code>
      </div>

      {/* Tips */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-slate-300">Tips</div>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>• Nest resources inside <code className="text-orange-400">&lt;VPC&gt;</code></li>
          <li>• Use <code className="text-emerald-400">multi-az</code> for HA</li>
          <li>• Press <kbd className="rounded bg-slate-700 px-1">Ctrl+Space</kbd> for autocomplete</li>
        </ul>
      </div>
    </div>
  );
}

function ReferencePanel({
  expandedComponent,
  onToggle
}: {
  expandedComponent: string | null;
  onToggle: (name: string) => void;
}) {
  const orderedSchemas = componentOrder
    .map(name => componentSchemas[name])
    .filter(Boolean);

  return (
    <div className="divide-y divide-slate-700">
      {orderedSchemas.map((schema) => (
        <div key={schema.name}>
          <button
            onClick={() => onToggle(schema.name)}
            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-700/50"
          >
            <span className="text-sm text-orange-400">&lt;{schema.name}&gt;</span>
            <span className="text-xs text-slate-500">{schema.options.length}</span>
          </button>

          {expandedComponent === schema.name && (
            <div className="bg-slate-900 px-3 py-2">
              <div className="flex flex-wrap gap-1">
                {schema.options.map((option) => (
                  <span
                    key={option.value}
                    className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-emerald-400"
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

function ExamplesPanel({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (template: ExampleTemplate) => void;
}) {
  return (
    <div className="divide-y divide-slate-700">
      {exampleTemplates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`flex w-full flex-col items-start px-3 py-2.5 text-left transition-colors ${
            selectedId === template.id
              ? 'bg-slate-700'
              : 'hover:bg-slate-700/50'
          }`}
        >
          <span className="text-sm font-medium text-slate-200">{template.name}</span>
          <span className="text-xs text-slate-400">{template.description}</span>
        </button>
      ))}
    </div>
  );
}
