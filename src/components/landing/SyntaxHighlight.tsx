interface SyntaxHighlightProps {
  code: string;
}

export function SyntaxHighlight({ code }: SyntaxHighlightProps) {
  const parts: { type: 'bracket' | 'tag' | 'attr' | 'string' | 'text'; value: string }[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    const openTagMatch = remaining.match(/^<(\/?)([\w]+)/);
    if (openTagMatch) {
      parts.push({ type: 'bracket', value: '<' + openTagMatch[1] });
      parts.push({ type: 'tag', value: openTagMatch[2] });
      remaining = remaining.slice(openTagMatch[0].length);
      continue;
    }

    const closeBracketMatch = remaining.match(/^(\/?>)/);
    if (closeBracketMatch) {
      parts.push({ type: 'bracket', value: closeBracketMatch[1] });
      remaining = remaining.slice(closeBracketMatch[0].length);
      continue;
    }

    const attrMatch = remaining.match(/^(\s+)([\w]+)(=)/);
    if (attrMatch) {
      parts.push({ type: 'text', value: attrMatch[1] });
      parts.push({ type: 'attr', value: attrMatch[2] });
      parts.push({ type: 'text', value: attrMatch[3] });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    const stringMatch = remaining.match(/^"([^"]*)"/);
    if (stringMatch) {
      parts.push({ type: 'string', value: `"${stringMatch[1]}"` });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    parts.push({ type: 'text', value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return (
    <code className="block overflow-x-auto font-mono text-sm leading-relaxed">
      {parts.map((part, i) => {
        const className = {
          bracket: 'text-zinc-500',
          tag: 'text-accent font-medium',
          attr: 'text-purple-400',
          string: 'text-emerald-400',
          text: 'text-zinc-500',
        }[part.type];

        return (
          <span key={i} className={className}>
            {part.value}
          </span>
        );
      })}
    </code>
  );
}
