import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

type Language = 'javascript' | 'python';

interface CodeEditorProps {
  onRunCode: (code: string, language: Language) => void;
}

const defaultCode: Record<Language, string> = {
  javascript: `// JavaScript Example
console.log('Hello from JavaScript!');
console.log('Result:', 2 + 2);

// Try some code
for (let i = 0; i < 3; i++) {
  console.log('Iteration:', i);
}`,
  python: `# Python Example
print('Hello from Python!')
print('Result:', 2 + 2)

# Try some code
for i in range(3):
    print('Iteration:', i)`,
};

export default function CodeEditor({ onRunCode }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [language, setLanguage] = useState<Language>('javascript');

  useEffect(() => {
    if (!editorRef.current) return;

    const languageExtension =
      language === 'javascript' ? javascript() : python();

    const state = EditorState.create({
      doc: defaultCode[language],
      extensions: [
        basicSetup,
        languageExtension,
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
  }, [language]);

  const handleRun = () => {
    if (viewRef.current) {
      const code = viewRef.current.state.doc.toString();
      onRunCode(code, language);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
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
        {(['javascript', 'python'] as Language[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => handleLanguageChange(lang)}
            className={`language-btn ${language === lang ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              backgroundColor: language === lang ? '#007acc' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
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
