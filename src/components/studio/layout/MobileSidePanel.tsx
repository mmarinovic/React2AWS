'use client';

import { Book, FileText, FolderOpen } from 'lucide-react';
import { SidePanel } from '@/components/studio/SidePanel';
import { ExampleTemplate } from '@/lib/examples/templates';
import { MobilePanelType } from '@/app/studio/hooks/useStudioState';

interface MobileSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: MobilePanelType;
  onPanelChange: (panel: MobilePanelType) => void;
  onSelectExample: (template: ExampleTemplate) => void;
  selectedExampleId: string;
}

export function MobileSidePanel({
  isOpen,
  onClose,
  activePanel,
  onPanelChange,
  onSelectExample,
  selectedExampleId,
}: MobileSidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-2xl flex flex-col border-r border-border">
        <div className="flex border-b border-border">
          <button
            onClick={() => onPanelChange('docs')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs transition-colors ${
              activePanel === 'docs'
                ? 'border-b-2 border-accent text-foreground bg-background'
                : 'text-muted'
            }`}
          >
            <Book className="h-3.5 w-3.5" />
            <span>How it works</span>
          </button>
          <button
            onClick={() => onPanelChange('reference')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs transition-colors ${
              activePanel === 'reference'
                ? 'border-b-2 border-accent text-foreground bg-background'
                : 'text-muted'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Reference</span>
          </button>
          <button
            onClick={() => onPanelChange('examples')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs transition-colors ${
              activePanel === 'examples'
                ? 'border-b-2 border-accent text-foreground bg-background'
                : 'text-muted'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Examples</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SidePanel
            activePanel={activePanel}
            onClose={onClose}
            onSelectExample={onSelectExample}
            selectedExampleId={selectedExampleId}
          />
        </div>
      </div>
    </div>
  );
}
