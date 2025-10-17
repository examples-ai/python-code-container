import { useState } from 'react';
import {
  NodeContainerProvider,
  PythonContainerProvider,
  useNodeContainer,
  usePythonContainer,
} from '@examples-ai/code-container';
import CodeEditor from './components/CodeEditor';
import Console, { type LogEntry } from './components/Console';

function CodeEditorApp() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logIdCounter, setLogIdCounter] = useState(0);
  const {
    webContainer,
    isLoading: nodeLoading,
    error: nodeError,
  } = useNodeContainer();
  const {
    pyodide,
    isLoading: pythonLoading,
    error: pythonError,
  } = usePythonContainer();

  const stripAnsi = (str: string) => {
    // Remove ANSI escape codes
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  };

  const addLog = (message: string, type: LogEntry['type'] = 'log') => {
    setLogs((prev) => [
      ...prev,
      {
        id: logIdCounter,
        type,
        message: stripAnsi(message),
        timestamp: new Date(),
      },
    ]);
    setLogIdCounter((prev) => prev + 1);
  };

  const handleRunCode = async (
    code: string,
    language: 'javascript' | 'python'
  ) => {
    addLog(`Running ${language} code...`, 'info');

    try {
      if (language === 'javascript') {
        if (!webContainer || nodeLoading || nodeError) {
          addLog('Node container is not ready. Please wait...', 'error');
          return;
        }

        const result = await webContainer.run(code);
        if (result) {
          result.split('\n').forEach((line) => {
            if (line.trim()) addLog(line, 'log');
          });
        }
      } else if (language === 'python') {
        if (!pyodide || pythonLoading || pythonError) {
          addLog('Python container is not ready. Please wait...', 'error');
          return;
        }

        const result = await pyodide.run(code);
        if (result) {
          result.split('\n').forEach((line) => {
            if (line.trim()) addLog(line, 'log');
          });
        }
      }

      addLog(`Execution completed`, 'info');
    } catch (error) {
      addLog(`Execution failed: ${error}`, 'error');
    }
  };

  const handleClearConsole = () => {
    setLogs([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: '1 1 70%', minHeight: 0 }}>
        <CodeEditor onRunCode={handleRunCode} />
      </div>
      <div style={{ flex: '0 0 30%', minHeight: '200px' }}>
        <Console logs={logs} onClear={handleClearConsole} />
      </div>
    </div>
  );
}

function App() {
  return (
    <NodeContainerProvider>
      <PythonContainerProvider>
        <CodeEditorApp />
      </PythonContainerProvider>
    </NodeContainerProvider>
  );
}

export default App;
