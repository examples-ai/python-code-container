# Code Container

Browser-based code execution environments for Node.js and Python with TypeScript support and React bindings.

**Features:**
- 🌐 **Browser-based**: Run Node.js and Python code directly in the browser
- 🏗️ **WebContainer Integration**: Full Node.js runtime powered by StackBlitz WebContainer
- 🐍 **Pyodide Integration**: Complete Python environment with scientific packages
- 🔒 **Isolated**: Secure isolated execution environments
- 📦 **Package Support**: Install and use npm/pip packages
- 📁 **File System**: Virtual file system operations
- 🔄 **Singleton Pattern**: Efficient resource sharing across instances
- 🎯 **TypeScript**: Full TypeScript support with type definitions
- ⚛️ **React Integration**: Hooks and providers for React applications
- 🛡️ **Error Handling**: Comprehensive error handling and retry mechanisms

## Installation

```bash
npm install code-container
# or
yarn add code-container
# or
pnpm add code-container
```

## Quick Start

### Core API

```typescript
import { NodeContainer, PythonContainer, bootWebContainer, bootPyodide } from 'code-container';

// Node.js container
const nodeContainer = await bootWebContainer();
const result = await nodeContainer.run('console.log("Hello World!"); return 42;');

// Python container
const pythonContainer = await bootPyodide();
const pyResult = await pythonContainer.run('print("Hello from Python!"); 2 + 3');
```

### React Hooks

Code Container provides React hooks for easy integration with React applications.

#### Basic Setup

```typescript
import { NodeContainerProvider, PythonContainerProvider } from 'code-container';

function App() {
  return (
    <NodeContainerProvider>
      <PythonContainerProvider>
        <YourComponents />
      </PythonContainerProvider>
    </NodeContainerProvider>
  );
}
```

#### useNodeContainer Hook

```typescript
import { useNodeContainer } from 'code-container';

function NodeCodeRunner() {
  const { webContainer, isLoading, error } = useNodeContainer();

  const executeCode = async () => {
    if (!webContainer) return;

    const result = await webContainer.run(`
      console.log('Hello from Node.js!');
      return 'Node.js execution complete';
    `);

    console.log(result);
  };

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Loading Node.js environment...</div>;
  if (!webContainer) return <div>Initializing...</div>;

  return (
    <button onClick={executeCode}>
      Execute Node.js Code
    </button>
  );
}
```

#### usePythonContainer Hook

```typescript
import { usePythonContainer } from 'code-container';

function PythonCodeRunner() {
  const { pyodide, isLoading, error } = usePythonContainer();

  const executeCode = async () => {
    if (!pyodide) return;

    const result = await pyodide.run(`
print('Hello from Python!')
import math
result = math.sqrt(16)
print(f'Square root of 16 is {result}')
    `);

    console.log(result); // Captured print output
  };

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Loading Python environment...</div>;
  if (!pyodide) return <div>Initializing...</div>;

  return (
    <button onClick={executeCode}>
      Execute Python Code
    </button>
  );
}
```

#### Hook Return Values

**useNodeContainer()** returns:
- `webContainer: NodeContainer | null` - Container instance when ready
- `isLoading: boolean` - True while initializing
- `error: Error | null` - Any initialization errors

**usePythonContainer()** returns:
- `pyodide: PythonContainer | null` - Container instance when ready
- `isLoading: boolean` - True while loading Pyodide
- `error: Error | null` - Any initialization errors

#### Using Context Providers

The providers must wrap your components to make containers available through context:

```typescript
import React from 'react';
import { NodeContainerProvider, PythonContainerProvider, useNodeContainer, usePythonContainer } from 'code-container';

// Step 1: Wrap your app with providers
function App() {
  return (
    <NodeContainerProvider>
      <PythonContainerProvider>
        <CodeExecutor />
      </PythonContainerProvider>
    </NodeContainerProvider>
  );
}

// Step 2: Use hooks inside provider-wrapped components

function CodeExecutor() {
  // Access both containers through context
  const nodeHook = useNodeContainer();
  const pythonHook = usePythonContainer();

  const executeNodeCode = async () => {
    if (!nodeHook.webContainer) return;

    const result = await nodeHook.webContainer.run(`
      const fs = require('fs');
      fs.writeFileSync('/tmp/test.txt', 'Hello from Node.js!');
      const content = fs.readFileSync('/tmp/test.txt', 'utf8');
      console.log('File content:', content);
      return content;
    `);

    console.log('Node.js result:', result);
  };

  const executePythonCode = async () => {
    if (!pythonHook.pyodide) return;

    const result = await pythonHook.pyodide.run(`
import json
import sys

data = {
    "message": "Hello from Python!",
    "version": sys.version_info.major + sys.version_info.minor / 10
}

print(f"Python version: {data['version']}")
print(f"Message: {data['message']}")

json.dumps(data, indent=2)
    `);

    console.log('Python result:', result);
  };

  const bothReady = nodeHook.webContainer && pythonHook.pyodide;
  const anyLoading = nodeHook.isLoading || pythonHook.isLoading;
  const anyError = nodeHook.error || pythonHook.error;

  if (anyError) {
    return <div>Error: {(nodeHook.error || pythonHook.error)?.message}</div>;
  }

  if (anyLoading) {
    return <div>Loading environments...</div>;
  }

  return (
    <div>
      <h3>Code Execution Environment</h3>

      <div>
        <h4>Node.js Environment</h4>
        <p>Status: {nodeHook.webContainer ? '✅ Ready' : '⏳ Initializing'}</p>
        <button
          onClick={executeNodeCode}
          disabled={!nodeHook.webContainer}
        >
          Run Node.js Code
        </button>
      </div>

      <div>
        <h4>Python Environment</h4>
        <p>Status: {pythonHook.pyodide ? '✅ Ready' : '⏳ Initializing'}</p>
        <button
          onClick={executePythonCode}
          disabled={!pythonHook.pyodide}
        >
          Run Python Code
        </button>
      </div>

      <div>
        <h4>Combined Execution</h4>
        <button
          onClick={() => {
            executeNodeCode();
            executePythonCode();
          }}
          disabled={!bothReady}
        >
          Run Both Languages
        </button>
      </div>
    </div>
  );
}
```

#### Provider Configuration

**NodeContainerProvider** - No configuration needed, automatically initializes WebContainer.

**PythonContainerProvider** - Configurable Pyodide loading:

```typescript
<PythonContainerProvider
  src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"  // Custom CDN
  strategy="afterInteractive"  // Loading strategy
>
  {children}
</PythonContainerProvider>
```

**Loading Strategies:**
- `beforeInteractive` - Load during page parsing (default)
- `afterInteractive` - Load after page is interactive
- `lazyOnload` - Load when component mounts

## API Reference

### Core Functions

#### `bootWebContainer(): Promise<NodeContainer>`
Initializes a Node.js container with WebContainer runtime.

#### `bootPyodide(): Promise<PythonContainer>`
Initializes a Python container with Pyodide runtime.

#### `resetNodeRuntime(): void`
Resets the Node.js runtime singleton.

#### `resetPythonRuntime(): void`
Resets the Python runtime singleton.

### Container Classes

#### `NodeContainer`
- `run(code: string, options?: RunOptions): Promise<string>` - Execute Node.js code
- File system operations: `readFile()`, `writeFile()`, etc.
- Package management: Install npm packages

#### `PythonContainer`
- `run(code: string, options?: RunOptions): Promise<string>` - Execute Python code
- `installPackage(packageName: string): Promise<void>` - Install Python packages
- File system operations for Python environment

### React Hooks

#### `useNodeContainer(): NodeContainerHookResult`
Returns:
- `webContainer: NodeContainer | null` - The Node.js container instance
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error state

#### `usePythonContainer(): PythonContainerHookResult`
Returns:
- `pyodide: PythonContainer | null` - The Python container instance
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error state

### React Providers

#### `NodeContainerProvider`
Provides Node.js container context to child components. Automatically handles WebContainer initialization.

#### `PythonContainerProvider`
Provides Python container context to child components. Automatically loads Pyodide and handles initialization.

Props:
- `src?: string` - Custom Pyodide CDN URL (default: jsdelivr v0.25.1)
- `strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'` - Loading strategy

## Features

### Automatic Initialization
Containers are initialized automatically when providers mount, with singleton pattern ensuring efficient resource usage.

### Output Capture
Python containers automatically capture `print()` output and return it as execution results.

### Error Handling
Comprehensive error handling with proper error states exposed through hooks.

### TypeScript Support
Full TypeScript definitions with proper typing for all APIs and hooks.

## Development

### Setup
```bash
pnpm install
```

### Build
```bash
pnpm build
```

### Test
```bash
pnpm test
```

### Run Example
```bash
cd examples/react-demo
pnpm dev
```

## Browser Requirements

- **Node.js Container**: Requires modern browsers with SharedArrayBuffer support
- **Python Container**: Works in all modern browsers
- **HTTPS**: Required for WebContainer in production environments

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request