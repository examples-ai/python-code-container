# Code Container Monorepo

A monorepo containing packages for browser-based code execution environments with TypeScript, Python, and Node.js support, plus React bindings with performance optimizations.

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
React bindings with performance-optimized provider and hooks.

**Features:**
- ⚛️ **React Integration**: Hooks and providers for React applications
- 🚀 **Performance Optimized**: Lazy loading, preloading, and intelligent caching
- 🎯 **Type-Safe**: Full TypeScript support with smart type inference
- 📊 **Monitoring**: Built-in performance metrics and debugging tools
- 🔄 **Lifecycle Management**: Automatic container creation and cleanup
- ⚡ **Concurrent Loading**: Manages multiple container initializations
- 🛡️ **Error Handling**: Comprehensive error boundaries and retry mechanisms

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
    <CodeContainerProvider
      containers={['node', 'python']}
      preload={['node']}  // Preload Node.js container
      lazy={true}         // Enable lazy loading
    >
      <CodeRunner />
    </CodeContainerProvider>
  );
}

function CodeRunner() {
  const { container, isLoading, isReady, error } = useContainer({ type: 'node' });

  if (isLoading) return <div>Loading container...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Container not ready</div>;

  return <div>Container ready! {container && 'Available'}</div>;
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

## Performance Features (React Package)

### Lazy Loading
Containers are only initialized when first requested, reducing initial load time.

### Preloading
Specify containers to preload immediately for faster subsequent access.

### Intelligent Caching
Container instances are shared across components and reused efficiently.

### Concurrent Management
Multiple containers can be initialized concurrently with configurable limits.

### Performance Monitoring
Built-in metrics for initialization times, memory usage, and usage patterns.

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