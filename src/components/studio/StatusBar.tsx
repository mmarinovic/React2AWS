'use client';

import { AlertCircle } from 'lucide-react';

interface StatusBarProps {
  resourceCount: number;
  errorCount: number;
}

export function StatusBar({ resourceCount, errorCount }: StatusBarProps) {
  return (
    <div className="flex h-8 sm:h-7 items-center border-t border-border bg-surface px-2 sm:px-3 text-xs" data-testid="status-bar">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-muted">
          <span className="sm:hidden">{resourceCount}</span>
          <span className="hidden sm:inline">
            {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
          </span>
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span className="sm:hidden">{errorCount}</span>
            <span className="hidden sm:inline">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
