import { EditorView } from '@codemirror/view';

export const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0a0a0b',
    color: '#fafafa',
    height: '100%',
  },
  '&.cm-editor': {
    backgroundColor: '#0a0a0b',
  },
  '.cm-scroller': {
    backgroundColor: '#0a0a0b',
    fontFamily: 'var(--font-geist-mono), monospace',
    overflow: 'auto',
  },
  '.cm-content': {
    backgroundColor: '#0a0a0b',
    caretColor: '#ff9900',
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-cursor': {
    borderLeftColor: '#ff9900',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
  },
  '.cm-selectionMatch': {
    backgroundColor: '#27272a',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-focused .cm-line ::selection, .cm-line ::selection': {
    backgroundColor: 'rgba(255, 153, 0, 0.2) !important',
  },
  '.cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'rgba(255, 153, 0, 0.2) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#0a0a0b',
    color: '#71717a',
    border: 'none',
    borderRight: '1px solid #27272a',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
    color: '#fafafa',
  },
  '.cm-tooltip': {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#18181b',
  },
  '.cm-tooltip-autocomplete ul': {
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '6px 10px',
    color: '#fafafa',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#ff9900',
    color: '#0a0a0b',
  },
  '.cm-completionLabel': {
    color: '#fafafa',
  },
  '.cm-completionDetail': {
    color: '#71717a',
    fontStyle: 'italic',
    marginLeft: '8px',
  },
  '.cm-completionMatchedText': {
    color: '#ff9900',
    fontWeight: '600',
    textDecoration: 'none',
  },
});
