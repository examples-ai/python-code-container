import { useState } from 'react';
import { useNodeContainer } from 'code-container';

const NodeContainerDemo: React.FC = () => {
  const { webContainer, isLoading, error } = useNodeContainer();
  const isReady = webContainer !== null && !isLoading && !error;
  const [code, setCode] = useState(`console.log('Hello from Node.js!');

// Try some Node.js APIs
const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);

// Create and read a file
fs.writeFileSync('/tmp/test.txt', 'Hello World!');
const content = fs.readFileSync('/tmp/test.txt', 'utf8');
console.log('File content:', content);`);
  const [output, setOutput] = useState('');

  const handleExecute = async () => {
    if (!isReady || !webContainer) return;

    setOutput('Executing...');
    try {
      const result = await webContainer.run(code);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="card">
      <h3>🟢 Node.js Container</h3>

      <div className="container-status">
        <span>Status:</span>
        <span
          className={
            isReady ? 'success' : isLoading ? '' : error ? 'error' : ''
          }
        >
          {isReady
            ? 'Ready'
            : isLoading
            ? 'Loading...'
            : error
            ? 'Error'
            : 'Not initialized'}
        </span>
      </div>

      {error && <div className="output error">{error.message}</div>}

      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter Node.js code here..."
        rows={10}
      />

      <button onClick={handleExecute} disabled={!isReady}>
        Execute Node.js Code
      </button>

      {output && (
        <div className={`output ${output.startsWith('Error:') ? 'error' : ''}`}>
          {output}
        </div>
      )}
    </div>
  );
};

export default NodeContainerDemo;
