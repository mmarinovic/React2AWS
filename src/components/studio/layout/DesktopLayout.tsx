'use client';

import { Eye, FileCode, AlertCircle } from 'lucide-react';
import { Editor } from '@/components/studio/Editor';
import { Preview } from '@/components/studio/Preview';
import { TerraformOutput } from '@/components/studio/TerraformOutput';
import { ActivityBar, PanelType } from '@/components/studio/ActivityBar';
import { SidePanel } from '@/components/studio/SidePanel';
import { RightPanelTab } from '@/app/studio/hooks/useStudioState';
import { ExampleTemplate } from '@/lib/examples/templates';
import { AWSResource } from '@/types/aws';
import { TerraformOutput as TerraformOutputType } from '@/types/aws';

interface DesktopLayoutProps {
  code: string;
  onCodeChange: (code: string) => void;
  resources: AWSResource[];
  terraformFiles: TerraformOutputType | null;
  errorCount: number;
  resourceCount: number;
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
  rightPanelTab: RightPanelTab;
  onRightPanelTabChange: (tab: RightPanelTab) => void;
  onSelectExample: (template: ExampleTemplate) => void;
  selectedExampleId: string;
}

export function DesktopLayout({
  code,
  onCodeChange,
  resources,
  terraformFiles,
  errorCount,
  resourceCount,
  activePanel,
  onPanelChange,
  rightPanelTab,
  onRightPanelTabChange,
  onSelectExample,
  selectedExampleId,
}: DesktopLayoutProps) {
  return (
    <>
      <div className="hidden md:block">
        <ActivityBar activePanel={activePanel} onPanelChange={onPanelChange} />
      </div>

      <div className="hidden md:block">
        <SidePanel
          activePanel={activePanel}
          onClose={() => onPanelChange(null)}
          onSelectExample={onSelectExample}
          selectedExampleId={selectedExampleId}
        />
      </div>

      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="flex flex-1 flex-col border-r border-border">
          <div className="flex items-center border-b border-border bg-surface">
            <div className="flex items-center gap-2 border-r border-border bg-background px-4 py-2">
              <span className="text-sm text-foreground">infrastructure.jsx</span>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="flex items-center gap-2 border-b border-red-900/30 bg-red-950/30 px-3 py-1.5">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-400">
                {errorCount} parsing error{errorCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Editor value={code} onChange={onCodeChange} />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center border-b border-border bg-surface">
            <button
              onClick={() => onRightPanelTabChange('preview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                rightPanelTab === 'preview'
                  ? 'border-b-2 border-accent bg-background text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
              <span className="rounded-md bg-surface-elevated px-1.5 text-xs text-muted">{resourceCount}</span>
            </button>
            <button
              onClick={() => onRightPanelTabChange('terraform')}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                rightPanelTab === 'terraform'
                  ? 'border-b-2 border-accent bg-background text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>Terraform</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-background">
            {rightPanelTab === 'preview' ? (
              <div className="h-full p-4">
                <Preview resources={resources} />
              </div>
            ) : (
              <TerraformOutput files={terraformFiles} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
