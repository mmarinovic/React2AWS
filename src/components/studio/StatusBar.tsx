'use client';

import { Share2, Download, Check, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  resourceCount: number;
  errorCount: number;
  shareStatus: 'idle' | 'copied';
  onShare: () => void;
  onDownload: () => void;
}

export function StatusBar({
  resourceCount,
  errorCount,
  shareStatus,
  onShare,
  onDownload,
}: StatusBarProps) {
  return (
    <div className="flex h-8 sm:h-6 items-center justify-between border-t border-slate-700 bg-slate-800 px-2 sm:px-3 text-xs">
      {/* Left side - status info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-slate-400">
          <span className="sm:hidden">{resourceCount}</span>
          <span className="hidden sm:inline">{resourceCount} resource{resourceCount !== 1 ? 's' : ''}</span>
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span className="sm:hidden">{errorCount}</span>
            <span className="hidden sm:inline">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          </span>
        )}
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={onShare}
          className="flex items-center gap-1 rounded px-2 py-1 sm:py-0.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          title="Share"
        >
          {shareStatus === 'copied' ? (
            <>
              <Check className="h-3.5 sm:h-3 w-3.5 sm:w-3 text-green-400" />
              <span className="hidden sm:inline text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 sm:h-3 w-3.5 sm:w-3" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1 rounded px-2 py-1 sm:py-0.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          title="Download"
        >
          <Download className="h-3.5 sm:h-3 w-3.5 sm:w-3" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
