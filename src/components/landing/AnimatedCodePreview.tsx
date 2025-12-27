'use client';

import { useState, useEffect, Fragment } from 'react';
import { Terminal, Check, Loader2 } from 'lucide-react';

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
    case 'bracket': return 'text-slate-500';
    case 'tag': return 'text-orange-400 font-semibold';
    case 'attr': return 'text-purple-400';
    case 'string': return 'text-green-400';
    default: return 'text-slate-500';
  }
}

// Convert tokens to a flat string for character counting
function tokensToString(tokens: CodeToken[]): string {
  return tokens.map(t => t.value).join('');
}

// Get visible tokens up to a character limit
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

  // Reset and restart animation
  useEffect(() => {
    if (phase === 'pause') {
      const timeout = setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setVisibleFiles([]);
        setPhase('typing');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  // Typing animation
  useEffect(() => {
    if (phase !== 'typing') return;

    const line = codeLines[currentLine];
    if (!line) {
      setPhase('generating');
      return;
    }

    const lineLength = tokensToString(line.tokens).length;

    if (currentChar < lineLength) {
      const timeout = setTimeout(() => {
        setCurrentChar((c) => c + 1);
      }, 15 + Math.random() * 15);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [phase, currentLine, currentChar]);

  // File generation animation
  useEffect(() => {
    if (phase !== 'generating') return;

    if (visibleFiles.length < outputFiles.length) {
      const timeout = setTimeout(() => {
        setVisibleFiles((f) => [...f, f.length]);
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setPhase('complete');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [phase, visibleFiles]);

  // Complete phase - wait then restart
  useEffect(() => {
    if (phase !== 'complete') return;
    const timeout = setTimeout(() => {
      setPhase('pause');
    }, 1000);
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
      <div key={lineIndex} className="flex">
        <span className="text-slate-600 select-none w-6 shrink-0">{lineIndex + 1}</span>
        <span style={{ marginLeft: `${line.indent * 12}px` }}>
          {visibleTokens.map((token, i) => (
            <span key={i} className={getTokenColor(token.type)}>
              {token.value}
            </span>
          ))}
          {showCursor && (
            <span className="animate-pulse text-orange-400">|</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
        {/* Window controls */}
        <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-sm text-slate-500">infrastructure.jsx</span>
          {phase === 'generating' && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-orange-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </span>
          )}
          {phase === 'complete' && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <Check className="h-3 w-3" />
              Ready to deploy
            </span>
          )}
        </div>

        {/* Code area */}
        <div className="p-6 text-left font-mono text-sm leading-relaxed min-h-[200px]">
          {codeLines.map((line, i) => renderLine(line, i))}
        </div>
      </div>

      {/* Output files */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Terminal className="h-4 w-4" />
          <span>Generates:</span>
        </div>
        {outputFiles.map((file, i) => (
          <span
            key={file}
            className={`rounded px-2 py-1 font-mono text-xs transition-all duration-300 ${
              visibleFiles.includes(i)
                ? 'bg-slate-800 text-purple-400 scale-100'
                : 'bg-slate-800/50 text-slate-600 scale-95'
            }`}
          >
            {visibleFiles.includes(i) && (
              <Check className="inline h-3 w-3 mr-1 text-green-400" />
            )}
            {file}
          </span>
        ))}
      </div>
    </div>
  );
}
