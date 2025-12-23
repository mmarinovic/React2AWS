'use client';

import { useState, useMemo, Fragment } from 'react';
import { Copy, Check, ChevronRight, ChevronDown, Folder, FileText, FileCode } from 'lucide-react';
import { TerraformOutput as TerraformOutputType } from '@/types/aws';
import { HighlightedLine } from './HighlightedLine';

interface TerraformOutputProps {
  files: TerraformOutputType | null;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

function buildFileTree(fileTree: Record<string, string>): TreeNode[] {
  const root: TreeNode[] = [];

  const paths = Object.keys(fileTree).sort();

  for (const path of paths) {
    const parts = path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let node = current.find(n => n.name === part);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
        };
        current.push(node);
      }

      if (!isLast) {
        current = node.children;
      }
    }
  }

  return root;
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  }).map(node => ({
    ...node,
    children: sortNodes(node.children),
  }));
}

interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expandedFolders: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

function FileTreeNode({ node, depth, selectedPath, expandedFolders, onSelect, onToggle }: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (node.isFolder) {
      onToggle(node.path);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-elevated ${
          isSelected ? 'bg-accent/10 text-foreground' : 'text-muted'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted" />
            )}
            <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {node.isFolder && isExpanded && (
        <>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedFolders={expandedFolders}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </>
      )}
    </>
  );
}

export function TerraformOutput({ files }: TerraformOutputProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['modules'])
  );
  const [copied, setCopied] = useState(false);

  const fileTree = useMemo(() => {
    if (!files?.fileTree) return [];
    return sortNodes(buildFileTree(files.fileTree));
  }, [files]);

  const allPaths = useMemo(() => {
    if (!files?.fileTree) return [];
    return Object.keys(files.fileTree).sort();
  }, [files]);

  const effectiveSelectedPath = selectedPath ?? allPaths.find(p => p.endsWith('.tf')) ?? allPaths[0] ?? null;

  const code = effectiveSelectedPath && files?.fileTree ? files.fileTree[effectiveSelectedPath] ?? '' : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelect = (path: string) => {
    setSelectedPath(path);
  };

  const lines = useMemo(() => code.split('\n'), [code]);

  if (!files) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <div className="text-center">
          <FileCode className="mx-auto mb-3 h-10 w-10 text-muted/50" />
          <p className="text-sm">No resources defined</p>
          <p className="text-xs text-muted/60 mt-1">Write JSX to generate Terraform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background" data-testid="terraform-output">
      {/* File tree sidebar */}
      <div className="flex w-48 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-3 py-2.5">
          <span className="text-xs font-medium text-foreground">Files</span>
        </div>
        <div className="flex-1 overflow-auto py-1">
          {fileTree.map(node => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              selectedPath={effectiveSelectedPath}
              expandedFolders={expandedFolders}
              onSelect={handleSelect}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Code panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {effectiveSelectedPath ?? 'No file selected'}
            </span>
          </div>
          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {code ? (
            <pre className="p-4 text-sm leading-relaxed font-mono">
              {lines.map((line, i) => (
                <Fragment key={i}>
                  <HighlightedLine line={line} />
                  {i < lines.length - 1 && '\n'}
                </Fragment>
              ))}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <p className="text-sm">Select a file to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
