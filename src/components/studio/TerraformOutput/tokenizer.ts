export type TokenType = 'comment' | 'string' | 'keyword' | 'resource' | 'number' | 'boolean' | 'property' | 'text';

export interface Token {
  type: TokenType;
  value: string;
}

export const tokenColors: Record<TokenType, string> = {
  comment: '#64748b',
  string: '#4ade80',
  keyword: '#c084fc',
  resource: '#fb923c',
  number: '#fbbf24',
  boolean: '#60a5fa',
  property: '#38bdf8',
  text: '#e2e8f0',
};

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    if (remaining.startsWith('#')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }

    const stringMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const keywordMatch = remaining.match(/^(resource|provider|data|variable|output|module|terraform|locals|required_providers)\b/);
    if (keywordMatch) {
      tokens.push({ type: 'keyword', value: keywordMatch[0] });
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    const resourceMatch = remaining.match(/^aws_[a-z_]+/);
    if (resourceMatch) {
      tokens.push({ type: 'resource', value: resourceMatch[0] });
      remaining = remaining.slice(resourceMatch[0].length);
      continue;
    }

    const boolMatch = remaining.match(/^(true|false)\b/);
    if (boolMatch) {
      tokens.push({ type: 'boolean', value: boolMatch[0] });
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }

    const numMatch = remaining.match(/^\d+/);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    const propMatch = remaining.match(/^([a-z_][a-z_0-9]*)(\s*=)/);
    if (propMatch) {
      tokens.push({ type: 'property', value: propMatch[1] });
      tokens.push({ type: 'text', value: propMatch[2] });
      remaining = remaining.slice(propMatch[0].length);
      continue;
    }

    const textMatch = remaining.match(/^(\s+|[^\s"#]+)/);
    if (textMatch) {
      tokens.push({ type: 'text', value: textMatch[0] });
      remaining = remaining.slice(textMatch[0].length);
      continue;
    }

    tokens.push({ type: 'text', value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}
