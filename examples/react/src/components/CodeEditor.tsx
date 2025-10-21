import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  onRunCode: (code: string) => void;
}

const defaultCode = `# Python Example
print('Hello from Python!')
print('Result:', 2 + 2)

# Try some code
for i in range(3):
    print('Iteration:', i)`;

export default function CodeEditor({ onRunCode }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: defaultCode,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  const handleRun = () => {
    if (viewRef.current) {
      const code = viewRef.current.state.doc.toString();
      onRunCode(code);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid #333',
        }}
      >
        <span style={{ color: '#e0e0e0', fontWeight: 'bold', padding: '8px 16px' }}>
          Python Editor
        </span>
        <button
          type="button"
          onClick={handleRun}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Run Code
        </button>
      </div>
      <div
        ref={editorRef}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      />
    </div>
  );
}
