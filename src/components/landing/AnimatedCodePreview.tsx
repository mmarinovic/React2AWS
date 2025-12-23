'use client';

import { useState, useEffect } from 'react';
import { Terminal, Check, Loader2, FileCode } from 'lucide-react';

interface CodeToken {
  type: 'bracket' | 'tag' | 'attr' | 'string' | 'text';
  value: string;
}

const codeLines: { indent: number; tokens: CodeToken[] }[] = [
  { indent: 0, tokens: [
    { type: 'bracket', value: '<' },
    { type: 'tag', value: 'Infrastructure' },
    { type: 'bracket', value: '>' },
  ]},
  { indent: 1, tokens: [
    { type: 'bracket', value: '<' },
    { type: 'tag', value: 'VPC' },
    { type: 'text', value: ' ' },
    { type: 'attr', value: 'className' },
    { type: 'text', value: '=' },
    { type: 'string', value: '"cidr-10.0.0.0/16 region-us-east-1"' },
    { type: 'bracket', value: '>' },
  ]},
  { indent: 2, tokens: [
    { type: 'bracket', value: '<' },
    { type: 'tag', value: 'RDS' },
    { type: 'text', value: ' ' },
    { type: 'attr', value: 'className' },
    { type: 'text', value: '=' },
    { type: 'string', value: '"engine-postgres multi-az"' },
    { type: 'text', value: ' ' },
    { type: 'bracket', value: '/>' },
  ]},
  { indent: 2, tokens: [
    { type: 'bracket', value: '<' },
    { type: 'tag', value: 'Fargate' },
    { type: 'text', value: ' ' },
    { type: 'attr', value: 'className' },
    { type: 'text', value: '=' },
    { type: 'string', value: '"mem-2gb cpu-1 port-8080"' },
    { type: 'text', value: ' ' },
    { type: 'bracket', value: '/>' },
  ]},
  { indent: 2, tokens: [
    { type: 'bracket', value: '<' },
    { type: 'tag', value: 'Lambda' },
    { type: 'text', value: ' ' },
    { type: 'attr', value: 'className' },
    { type: 'text', value: '=' },
    { type: 'string', value: '"runtime-nodejs22"' },
    { type: 'text', value: ' ' },
    { type: 'bracket', value: '/>' },
  ]},
  { indent: 1, tokens: [
    { type: 'bracket', value: '</' },
    { type: 'tag', value: 'VPC' },
    { type: 'bracket', value: '>' },
  ]},
  { indent: 0, tokens: [
    { type: 'bracket', value: '</' },
    { type: 'tag', value: 'Infrastructure' },
    { type: 'bracket', value: '>' },
  ]},
];

const outputFiles = ['main.tf', 'variables.tf', 'outputs.tf', 'backend.tf'];

type Phase = 'typing' | 'generating' | 'complete' | 'pause';

function getTokenColor(type: CodeToken['type']): string {
  switch (type) {
    case 'bracket': return 'text-zinc-500';
    case 'tag': return 'text-accent font-medium';
    case 'attr': return 'text-purple-400';
    case 'string': return 'text-emerald-400';
    default: return 'text-zinc-500';
  }
}

function tokensToString(tokens: CodeToken[]): string {
  return tokens.map(t => t.value).join('');
}

function getVisibleTokens(tokens: CodeToken[], charLimit: number): { tokens: CodeToken[]; partial: string } {
  let count = 0;
  const result: CodeToken[] = [];
  let partial = '';

  for (const token of tokens) {
    if (count + token.value.length <= charLimit) {
      result.push(token);
      count += token.value.length;
    } else {
      partial = token.value.slice(0, charLimit - count);
      if (partial) {
        result.push({ ...token, value: partial });
      }
      break;
    }
  }

  return { tokens: result, partial };
}

export function AnimatedCodePreview() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [visibleFiles, setVisibleFiles] = useState<number[]>([]);

  useEffect(() => {
    if (phase === 'pause') {
      const timeout = setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setVisibleFiles([]);
        setPhase('typing');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing') return;

    const line = codeLines[currentLine];
    if (!line) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('generating');
      return;
    }

    const lineLength = tokensToString(line.tokens).length;

    if (currentChar < lineLength) {
      const timeout = setTimeout(() => {
        setCurrentChar((c) => c + 1);
      }, 20 + Math.random() * 20);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [phase, currentLine, currentChar]);

  useEffect(() => {
    if (phase !== 'generating') return;

    if (visibleFiles.length < outputFiles.length) {
      const timeout = setTimeout(() => {
        setVisibleFiles((f) => [...f, f.length]);
      }, 250);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setPhase('complete');
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [phase, visibleFiles]);

  useEffect(() => {
    if (phase !== 'complete') return;
    const timeout = setTimeout(() => {
      setPhase('pause');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [phase]);

  const renderLine = (line: typeof codeLines[0], lineIndex: number) => {
    let visibleTokens: CodeToken[] = [];
    let showCursor = false;

    if (lineIndex < currentLine || phase !== 'typing') {
      visibleTokens = line.tokens;
    } else if (lineIndex === currentLine && phase === 'typing') {
      visibleTokens = getVisibleTokens(line.tokens, currentChar).tokens;
      showCursor = true;
    } else {
      return null;
    }

    return (
      <div key={lineIndex} className="flex leading-7">
        <span className="w-8 shrink-0 select-none pr-4 text-right text-zinc-600">{lineIndex + 1}</span>
        <span style={{ marginLeft: `${line.indent * 16}px` }}>
          {visibleTokens.map((token, i) => (
            <span key={i} className={getTokenColor(token.type)}>
              {token.value}
            </span>
          ))}
          {showCursor && (
            <span className="inline-block w-0.5 h-5 bg-accent ml-0.5 animate-typing-cursor align-middle" />
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Terminal window */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface glow-orange-subtle">
        {/* Window header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-zinc-700 transition-colors hover:bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-zinc-700 transition-colors hover:bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-zinc-700 transition-colors hover:bg-green-500" />
            </div>
            <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-1">
              <FileCode className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-zinc-400">infrastructure.jsx</span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {phase === 'typing' && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Writing...
              </span>
            )}
            {phase === 'generating' && (
              <span className="flex items-center gap-1.5 text-xs text-accent">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating Terraform...
              </span>
            )}
            {(phase === 'complete' || phase === 'pause') && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Ready to deploy
              </span>
            )}
          </div>
        </div>

        {/* Code area */}
        <div className="p-6 font-mono text-sm min-h-[220px] bg-gradient-to-b from-surface to-background">
          {codeLines.map((line, i) => renderLine(line, i))}
        </div>
      </div>

      {/* Output files */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-zinc-500">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Output:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {outputFiles.map((file, i) => (
            <div
              key={file}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-300 ${
                visibleFiles.includes(i)
                  ? 'border-accent/30 bg-accent/10 text-accent scale-100'
                  : 'border-border bg-surface text-zinc-600 scale-95 opacity-50'
              }`}
            >
              {visibleFiles.includes(i) && (
                <Check className="h-3 w-3 text-emerald-400" />
              )}
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
