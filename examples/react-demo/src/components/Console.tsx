import { useEffect, useRef } from 'react';

export interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

interface ConsoleProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function Console({ logs, onClear }: ConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, []);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return '#ff6b6b';
      case 'info':
        return '#4dabf7';
      default:
        return '#e0e0e0';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderTop: '2px solid #333',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #333',
        }}
      >
        <span
          style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: '14px' }}
        >
          Console
        </span>
        <button
          onClick={onClear}
          style={{
            padding: '4px 12px',
            backgroundColor: '#333',
            color: '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Clear
        </button>
      </div>
      <div
        ref={consoleRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Console is empty. Run some code to see output here.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                marginBottom: '4px',
                color: getLogColor(log.type),
                display: 'flex',
                gap: '8px',
              }}
            >
              <span
                style={{ color: '#666', fontSize: '11px', minWidth: '60px' }}
              >
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span style={{ color: '#888' }}>[{log.type}]</span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
