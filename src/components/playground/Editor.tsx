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

// Light theme for CodeMirror
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  '.cm-content': {
    caretColor: '#1e293b',
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-cursor': {
    borderLeftColor: '#1e293b',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8fafc',
  },
  '.cm-selectionMatch': {
    backgroundColor: '#dbeafe',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#3b82f6 !important',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#93c5fd !important',
  },
  '.cm-content ::selection': {
    backgroundColor: '#3b82f6 !important',
    color: '#ffffff !important',
  },
  '.cm-gutters': {
    backgroundColor: '#fafafa',
    color: '#94a3b8',
    border: 'none',
    borderRight: '1px solid #e2e8f0',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f1f5f9',
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
  { tag: tags.variableName, color: '#1e293b' },
  // Property names
  { tag: tags.propertyName, color: '#2563eb' },
  // Type names
  { tag: tags.typeName, color: '#dc2626' },
  // Brackets and punctuation
  { tag: tags.bracket, color: '#64748b' },
  { tag: tags.paren, color: '#64748b' },
  { tag: tags.squareBracket, color: '#64748b' },
  { tag: tags.brace, color: '#64748b' },
  // Operators
  { tag: tags.operator, color: '#64748b' },
  // Boolean
  { tag: tags.bool, color: '#d97706' },
  // Null/undefined
  { tag: tags.null, color: '#94a3b8' },
  // Function names
  { tag: tags.function(tags.variableName), color: '#7c3aed' },
  // Definition
  { tag: tags.definition(tags.variableName), color: '#1e293b', fontWeight: '500' },
]);

export function Editor({ value, onChange }: EditorProps) {
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-white">
      <CodeMirror
        value={value}
        height="100%"
        extensions={[
          javascript({ jsx: true }),
          lightTheme,
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

