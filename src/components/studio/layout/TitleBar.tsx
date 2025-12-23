'use client';

import Link from 'next/link';
import { Home, Menu, X, Share2, Download, Check } from 'lucide-react';

interface TitleBarProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  shareStatus: 'idle' | 'copied';
  onShare: () => void;
  onDownload: () => void;
}

export function TitleBar({ mobileMenuOpen, onToggleMobileMenu, shareStatus, onShare, onDownload }: TitleBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 md:px-4">
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
          title="Back to home"
        >
          <Home className="h-4 w-4" />
        </Link>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <span className="text-[10px] font-bold text-background">R2</span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">Infrastructure Studio</span>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm text-muted hover:bg-surface-elevated hover:text-foreground transition-colors"
          title="Copy share link"
        >
          {shareStatus === 'copied' ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-2 sm:px-3 py-1.5 text-sm font-medium text-background hover:bg-accent-hover transition-colors"
          title="Download Terraform files"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
        <button
          onClick={onToggleMobileMenu}
          className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg text-muted hover:bg-surface-elevated hover:text-foreground transition-colors ml-1"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
