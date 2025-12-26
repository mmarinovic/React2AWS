'use client';

import { useState, useMemo, Fragment } from 'react';
import { Copy, Check } from 'lucide-react';
import { TerraformOutput as TerraformOutputType } from '@/types/aws';

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

// Colors for each token type (dark theme)
const tokenColors: Record<TokenType, string> = {
  comment: '#64748b',
  string: '#4ade80',
  keyword: '#c084fc',
  resource: '#fb923c',
  number: '#fbbf24',
  boolean: '#60a5fa',
  property: '#38bdf8',
  text: '#e2e8f0',
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

  const lines = useMemo(() => code.split('\n'), [code]);

  if (!files) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        <p>No resources defined</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* File tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-700 bg-slate-800 px-2 py-1.5">
        {FILE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-slate-900 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">{currentFile.filename}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
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
