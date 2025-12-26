'use client';

import { Book, FileText, FolderOpen, Settings } from 'lucide-react';

export type PanelType = 'docs' | 'reference' | 'examples' | null;

interface ActivityBarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

const items = [
  { id: 'docs' as const, icon: Book, label: 'How it works' },
  { id: 'reference' as const, icon: FileText, label: 'Syntax Reference' },
  { id: 'examples' as const, icon: FolderOpen, label: 'Examples' },
];

export function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  return (
    <div className="flex h-full w-12 flex-col items-center border-r border-slate-700 bg-slate-800 py-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onPanelChange(activePanel === item.id ? null : item.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            activePanel === item.id
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
          }`}
          title={item.label}
        >
          <item.icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
