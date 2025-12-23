'use client';

import { tokenizeLine, tokenColors } from './tokenizer';

interface HighlightedLineProps {
  line: string;
}

export function HighlightedLine({ line }: HighlightedLineProps) {
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
