'use client';

import { Eye, FileCode, Code } from 'lucide-react';
import { MobileTab } from '@/app/studio/hooks/useStudioState';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  resourceCount: number;
}

export function MobileTabBar({ activeTab, onTabChange, resourceCount }: MobileTabBarProps) {
  return (
    <div className="flex md:hidden border-b border-border bg-surface">
      <button
        onClick={() => onTabChange('editor')}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors ${
          activeTab === 'editor'
            ? 'border-b-2 border-accent bg-background text-foreground'
            : 'text-muted'
        }`}
      >
        <Code className="h-4 w-4" />
        <span>Editor</span>
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors ${
          activeTab === 'preview'
            ? 'border-b-2 border-accent bg-background text-foreground'
            : 'text-muted'
        }`}
      >
        <Eye className="h-4 w-4" />
        <span>Preview</span>
        <span className="rounded-md bg-surface-elevated px-1.5 text-xs">{resourceCount}</span>
      </button>
      <button
        onClick={() => onTabChange('terraform')}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors ${
          activeTab === 'terraform'
            ? 'border-b-2 border-accent bg-background text-foreground'
            : 'text-muted'
        }`}
      >
        <FileCode className="h-4 w-4" />
        <span>Terraform</span>
      </button>
    </div>
  );
}
