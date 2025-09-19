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

```typescript
import { NodeContainerProvider, PythonContainerProvider, useNodeContainer, usePythonContainer } from 'code-container';

function App() {
  return (
    <NodeContainerProvider>
      <PythonContainerProvider>
        <NodeCodeRunner />
        <PythonCodeRunner />
      </PythonContainerProvider>
    </NodeContainerProvider>
  );
}

function NodeCodeRunner() {
  const { webContainer, isLoading, error } = useNodeContainer();
  const isReady = webContainer && !isLoading && !error;

  const runCode = async () => {
    if (!isReady) return;

    try {
      const result = await webContainer.run('console.log("Hello from Node.js!"); return 42;');
      console.log(result);
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={runCode} disabled={!isReady}>
        {isLoading ? 'Loading...' : 'Run Node.js Code'}
      </button>
    </div>
  );
}

function PythonCodeRunner() {
  const { pyodide, isLoading, error } = usePythonContainer();
  const isReady = pyodide && !isLoading && !error;

  const runCode = async () => {
    if (!isReady) return;

    try {
      const result = await pyodide.run('print("Hello from Python!"); 2 + 3');
      console.log(result);
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={runCode} disabled={!isReady}>
        {isLoading ? 'Loading...' : 'Run Python Code'}
      </button>
    </div>
  );
}
```

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