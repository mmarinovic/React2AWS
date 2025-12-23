'use client';

import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { react2awsAutocomplete } from '@/lib/autocomplete';
import { darkTheme } from './theme';
import { jsxHighlightStyle } from './highlighting';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  return (
    <div className="h-full w-full overflow-hidden bg-background" data-testid="code-editor">
      <CodeMirror
        value={value}
        height="100%"
        theme="none"
        extensions={[
          javascript({ jsx: true }),
          darkTheme,
          syntaxHighlighting(jsxHighlightStyle),
          EditorView.lineWrapping,
          react2awsAutocomplete,
          keymap.of([
            { key: 'Mod-s', run: () => true },
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
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
        }}
        style={{ height: '100%', fontSize: '14px' }}
        data-enable-grammarly="false"
        spellCheck={false}
      />
    </div>
  );
}
