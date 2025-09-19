# Code Container Monorepo

A monorepo containing packages for browser-based code execution environments with TypeScript, Python, and Node.js support, plus simple React bindings.

## Packages

### [@code-container/core](./packages/code-container)
Core container functionality for running Node.js and Python code in isolated browser environments.

**Features:**
- 🌐 **Browser-based**: Run Node.js and Python code directly in the browser
- 🏗️ **WebContainer Integration**: Full Node.js runtime powered by StackBlitz WebContainer
- 🐍 **Pyodide Integration**: Complete Python environment with scientific packages
- 🔒 **Isolated**: Secure isolated execution environments
- 📦 **Package Support**: Install and use npm/pip packages
- 📁 **File System**: Virtual file system operations
- 🔄 **Singleton Pattern**: Efficient resource sharing across instances
- 🎯 **TypeScript**: Full TypeScript support with type definitions

### [@code-container/react](./packages/react-code-container)
Simple React bindings with provider and hooks.

**Features:**
- ⚛️ **React Integration**: Hooks and providers for React applications
- 🎯 **Type-Safe**: Full TypeScript support with smart type inference
- 🔄 **Lifecycle Management**: Simple container creation and management
- 🛡️ **Error Handling**: Basic error handling and retry mechanisms

## Quick Start

### Using Core Package

```typescript
import { NodeContainer, PythonContainer } from '@code-container/core';

// Node.js container
const nodeContainer = new NodeContainer();
await nodeContainer.create();
const result = await nodeContainer.run('console.log("Hello World!"); return 42;');

// Python container
const pythonContainer = new PythonContainer();
await pythonContainer.create();
const pyResult = await pythonContainer.run('print("Hello from Python!"); 2 + 3');
```

### Using React Package

```typescript
import { CodeContainerProvider, useContainer } from '@code-container/react';

function App() {
  return (
    <CodeContainerProvider containers={['node', 'python']}>
      <CodeRunner />
    </CodeContainerProvider>
  );
}

function CodeRunner() {
  const { container, isLoading, isReady, error, execute } = useContainer({ type: 'node' });

  const runCode = async () => {
    try {
      const result = await execute('console.log("Hello from Node.js!"); return 42;');
      console.log(result);
    } catch (err) {
      console.error('Execution failed:', err);
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={runCode} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Run Code'}
      </button>
    </div>
  );
}
```

## Development

### Setup
```bash
pnpm install
```

### Build
```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:react
```

### Test
```bash
# Test all packages
pnpm test

# Test specific package
pnpm test:core
pnpm test:react
```

## Package Scripts

- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages
- `pnpm clean` - Clean all build artifacts
- `pnpm dev` - Start development mode (watch builds)

## Architecture

The monorepo uses PNPM workspaces for efficient dependency management:

- **@code-container/core**: Core container functionality
- **@code-container/react**: React bindings that depend on core package
- Shared TypeScript configuration
- Independent versioning for each package
- Cross-package dependency management

## Features (React Package)

### Simple Container Management
Containers are initialized on-demand when accessed through hooks.

### Shared Instances
Container instances are shared across components and reused efficiently.

### Error Handling
Basic error handling with retry capabilities for failed container operations.

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