'use client';

import { useState, useMemo, Fragment } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { TerraformOutput as TerraformOutputType } from '@/types/aws';
import JSZip from 'jszip';

interface TerraformOutputProps {
  files: TerraformOutputType | null;
}

type FileKey = keyof TerraformOutputType;

const FILE_TABS: { key: FileKey; label: string; filename: string }[] = [
  { key: 'mainTf', label: 'main.tf', filename: 'main.tf' },
  { key: 'variablesTf', label: 'variables.tf', filename: 'variables.tf' },
  { key: 'outputsTf', label: 'outputs.tf', filename: 'outputs.tf' },
  { key: 'backendTf', label: 'backend.tf', filename: 'backend.tf' },
  { key: 'tfvarsExample', label: 'tfvars.example', filename: 'terraform.tfvars.example' },
];

// Token types for syntax highlighting
type TokenType = 'comment' | 'string' | 'keyword' | 'resource' | 'number' | 'boolean' | 'property' | 'text';

interface Token {
  type: TokenType;
  value: string;
}

// Colors for each token type
const tokenColors: Record<TokenType, string> = {
  comment: '#9ca3af',
  string: '#059669',
  keyword: '#7c3aed',
  resource: '#ea580c',
  number: '#d97706',
  boolean: '#2563eb',
  property: '#0284c7',
  text: '#0a0a0a',
};

// Simple tokenizer for HCL
function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    // Comment
    if (remaining.startsWith('#')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }

    // String
    const stringMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    // Keywords
    const keywordMatch = remaining.match(/^(resource|provider|data|variable|output|module|terraform|locals|required_providers)\b/);
    if (keywordMatch) {
      tokens.push({ type: 'keyword', value: keywordMatch[0] });
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    // AWS resource types
    const resourceMatch = remaining.match(/^aws_[a-z_]+/);
    if (resourceMatch) {
      tokens.push({ type: 'resource', value: resourceMatch[0] });
      remaining = remaining.slice(resourceMatch[0].length);
      continue;
    }

    // Booleans
    const boolMatch = remaining.match(/^(true|false)\b/);
    if (boolMatch) {
      tokens.push({ type: 'boolean', value: boolMatch[0] });
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^\d+/);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Property names (word followed by spaces and =)
    const propMatch = remaining.match(/^([a-z_][a-z_0-9]*)(\s*=)/);
    if (propMatch) {
      tokens.push({ type: 'property', value: propMatch[1] });
      tokens.push({ type: 'text', value: propMatch[2] });
      remaining = remaining.slice(propMatch[0].length);
      continue;
    }

    // Whitespace and other text
    const textMatch = remaining.match(/^(\s+|[^\s"#]+)/);
    if (textMatch) {
      tokens.push({ type: 'text', value: textMatch[0] });
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    // Fallback: single character
    tokens.push({ type: 'text', value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

function HighlightedLine({ line }: { line: string }) {
  const tokens = tokenizeLine(line);

  return (
    <>
      {tokens.map((token, i) => (
        <span
          key={i}
          style={{
            color: tokenColors[token.type],
            fontWeight: token.type === 'keyword' ? 500 : undefined,
          }}
        >
          {token.value}
        </span>
      ))}
    </>
  );
}

export function TerraformOutput({ files }: TerraformOutputProps) {
  const [activeTab, setActiveTab] = useState<FileKey>('mainTf');
  const [copied, setCopied] = useState(false);

  const currentFile = FILE_TABS.find(f => f.key === activeTab)!;
  const code = files?.[activeTab] ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = async () => {
    if (!files) return;

    const zip = new JSZip();
    zip.file('main.tf', files.mainTf);
    zip.file('variables.tf', files.variablesTf);
    zip.file('outputs.tf', files.outputsTf);
    zip.file('backend.tf', files.backendTf);
    zip.file('terraform.tfvars.example', files.tfvarsExample);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terraform.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = useMemo(() => code.split('\n'), [code]);

  if (!files) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <p>No resources defined</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-white">
      {/* File tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-1.5">
        {FILE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{currentFile.filename}</span>
          <span className="hidden rounded bg-surface px-2 py-0.5 text-xs text-muted sm:inline">Terraform</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground lg:gap-1.5 lg:px-3"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="hidden text-green-600 sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1 rounded-md bg-accent px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover lg:gap-1.5 lg:px-3"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download All</span>
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm leading-relaxed font-mono">
          {lines.map((line, i) => (
            <Fragment key={i}>
              <HighlightedLine line={line} />
              {i < lines.length - 1 && '\n'}
            </Fragment>
          ))}
        </pre>
      </div>
    </div>
  );
}
