'use client';

import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { react2awsAutocomplete } from '@/lib/autocomplete';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Dark theme for CodeMirror (VS Code style)
const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
  },
  '.cm-content': {
    caretColor: '#f8fafc',
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-cursor': {
    borderLeftColor: '#f8fafc',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  '.cm-selectionMatch': {
    backgroundColor: '#475569',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-focused .cm-line ::selection, .cm-line ::selection': {
    backgroundColor: 'rgba(59, 130, 246, 0.35) !important',
  },
  '.cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.35) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#0f172a',
    color: '#64748b',
    border: 'none',
    borderRight: '1px solid #334155',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  // Autocomplete dropdown styling
  '.cm-tooltip': {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '6px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#1e293b',
  },
  '.cm-tooltip-autocomplete ul': {
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '4px 8px',
    color: '#e2e8f0',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  '.cm-completionLabel': {
    color: '#e2e8f0',
  },
  '.cm-completionDetail': {
    color: '#94a3b8',
    fontStyle: 'italic',
    marginLeft: '8px',
  },
  '.cm-completionMatchedText': {
    color: '#f97316',
    fontWeight: '600',
    textDecoration: 'none',
  },
});

// Syntax highlighting with proper Lezer tags
const jsxHighlightStyle = HighlightStyle.define([
  // JSX tags (component names like <VPC>, <RDS>)
  { tag: tags.tagName, color: '#ea580c', fontWeight: '600' },
  // Attribute names (className, name)
  { tag: tags.attributeName, color: '#7c3aed' },
  // Strings and attribute values
  { tag: tags.string, color: '#059669' },
  // Keywords (const, return, function)
  { tag: tags.keyword, color: '#db2777' },
  // Numbers
  { tag: tags.number, color: '#d97706' },
  // Comments
  { tag: tags.comment, color: '#94a3b8', fontStyle: 'italic' },
  // Variables and identifiers
  { tag: tags.variableName, color: '#e2e8f0' },
  // Property names
  { tag: tags.propertyName, color: '#60a5fa' },
  // Type names
  { tag: tags.typeName, color: '#f87171' },
  // Brackets and punctuation
  { tag: tags.bracket, color: '#94a3b8' },
  { tag: tags.paren, color: '#94a3b8' },
  { tag: tags.squareBracket, color: '#94a3b8' },
  { tag: tags.brace, color: '#94a3b8' },
  // Operators
  { tag: tags.operator, color: '#94a3b8' },
  // Boolean
  { tag: tags.bool, color: '#fbbf24' },
  // Null/undefined
  { tag: tags.null, color: '#94a3b8' },
  // Function names
  { tag: tags.function(tags.variableName), color: '#a78bfa' },
  // Definition
  { tag: tags.definition(tags.variableName), color: '#e2e8f0', fontWeight: '500' },
]);

export function Editor({ value, onChange }: EditorProps) {
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div className="h-full w-full overflow-hidden">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[
          javascript({ jsx: true }),
          darkTheme,
          syntaxHighlighting(jsxHighlightStyle),
          EditorView.lineWrapping,
          react2awsAutocomplete,
          keymap.of([
            { key: 'Mod-s', run: () => true }, // Prevent browser save dialog
          ]),
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false, // Using custom React2AWS autocomplete
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
        style={{ height: '100%', fontSize: '14px' }}
      />
    </div>
  );
}

