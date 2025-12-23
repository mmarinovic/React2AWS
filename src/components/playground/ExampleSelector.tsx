'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { exampleTemplates, ExampleTemplate } from '@/lib/examples/templates';

interface ExampleSelectorProps {
  selectedId: string;
  onSelect: (template: ExampleTemplate) => void;
}

export function ExampleSelector({ selectedId, onSelect }: ExampleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
      >
        <span>Examples</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-white py-2 shadow-lg md:w-72">
          {exampleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template);
                setIsOpen(false);
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
            >
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {template.id === selectedId && (
                  <Check className="h-4 w-4 text-accent" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{template.name}</div>
                <div className="mt-0.5 text-xs text-muted">{template.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

