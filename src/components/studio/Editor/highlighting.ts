import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const jsxHighlightStyle = HighlightStyle.define([
  { tag: tags.tagName, color: '#ff9900', fontWeight: '600' },
  { tag: tags.attributeName, color: '#a855f7' },
  { tag: tags.string, color: '#22c55e' },
  { tag: tags.keyword, color: '#ec4899' },
  { tag: tags.number, color: '#f59e0b' },
  { tag: tags.comment, color: '#71717a', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#fafafa' },
  { tag: tags.propertyName, color: '#3b82f6' },
  { tag: tags.typeName, color: '#f87171' },
  { tag: tags.bracket, color: '#71717a' },
  { tag: tags.paren, color: '#71717a' },
  { tag: tags.squareBracket, color: '#71717a' },
  { tag: tags.brace, color: '#71717a' },
  { tag: tags.operator, color: '#71717a' },
  { tag: tags.bool, color: '#3b82f6' },
  { tag: tags.null, color: '#71717a' },
  { tag: tags.function(tags.variableName), color: '#a855f7' },
  { tag: tags.definition(tags.variableName), color: '#fafafa', fontWeight: '500' },
]);
