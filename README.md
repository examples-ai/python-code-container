# Code Container

A TypeScript library for running Node.js and Python code in isolated browser environments.

## Features

- 🌐 **Browser-based**: Run Node.js and Python code directly in the browser
- 🏗️ **WebContainer Integration**: Full Node.js runtime powered by StackBlitz WebContainer
- 🐍 **Pyodide Integration**: Complete Python environment with scientific packages
- 🔒 **Isolated**: Secure isolated execution environments
- 📦 **Package Support**: Install and use npm/pip packages
- 📁 **File System**: Virtual file system operations
- 🔄 **Singleton Pattern**: Efficient resource sharing across instances
- 🎯 **TypeScript**: Full TypeScript support with type definitions

## Installation

```bash
npm install code-container
# or
pnpm add code-container
```

## Quick Start

### Node.js Container

```typescript
import { NodeContainer } from 'code-container';

const container = new NodeContainer();
await container.create();

// Run Node.js code
const result = await container.run(`
console.log("Hello from Node.js!");
const sum = 2 + 3;
return sum * 2;
`);

console.log('Result:', result); // 10

// Install and use packages
await container.installPackage('lodash');
const lodashResult = await container.run(`
const _ = require('lodash');
return _.chunk([1, 2, 3, 4, 5, 6], 2);
`);

console.log('Lodash result:', lodashResult); // [[1, 2], [3, 4], [5, 6]]

await container.destroy();
```

### Python Container

```typescript
import { PythonContainer } from 'code-container';

const container = new PythonContainer();
await container.create();

// Run Python code
const result = await container.run(`
print("Hello from Python!")
import math
result = math.sqrt(16) + math.pi
print(f"Result: {result}")
result
`);

console.log('Result:', result); // ~7.14

// Install and use packages
await container.installPackage('numpy');
const numpyResult = await container.run(`
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
np.mean(arr)
`);

console.log('NumPy mean:', numpyResult); // 3

await container.destroy();
```

## API Reference

### NodeContainer

```typescript
class NodeContainer {
  constructor(options?: NodeContainerOptions)
  
  // Lifecycle
  async create(): Promise<void>
  async destroy(): Promise<void>
  
  // Code execution
  async run(code: string, filename?: string): Promise<any>
  
  // Package management
  async installPackage(packageName: string): Promise<void>
  
  // File operations
  async readFile(path: string): Promise<string>
  async writeFile(path: string, content: string | Uint8Array): Promise<void>
  
  // Utilities
  getLastError(): Error | null
  getRuntime(): WebContainer // Access underlying WebContainer
}

interface NodeContainerOptions {
  packageJson?: Record<string, any>  // Custom package.json content
  files?: Record<string, string>     // Initial files to create
}
```

### PythonContainer

```typescript
class PythonContainer {
  constructor(options?: PythonContainerOptions)
  
  // Lifecycle
  async create(): Promise<void>
  async destroy(): Promise<void>
  
  // Code execution
  async run(code: string, filename?: string): Promise<any>
  runSync(code: string): any // Synchronous execution
  
  // Package management
  async installPackage(packageName: string): Promise<void>
  
  // File operations
  readFile(path: string, encoding?: string): string | Uint8Array
  writeFile(path: string, content: string | Uint8Array): void
  
  // JavaScript interop
  registerJsModule(name: string, module: any): void
  unregisterJsModule(name: string): void
  
  // Utilities
  getLastError(): Error | null
  getRuntime(): PyodideInterface // Access underlying Pyodide
}

interface PythonContainerOptions {
  pyodidePath?: string                // Custom Pyodide CDN URL
  packages?: string[]                 // Packages to pre-install
  homedir?: string                    // Working directory
  enablePackageAutoInstall?: boolean // Auto-install from imports (default: true)
}
```

## Extensions

The library includes several extensions for advanced functionality:

```typescript
import { 
  NodeProcessExtension,
  PythonFileSystemExtension, 
  PythonGlobalsExtension,
  PythonInteropExtension 
} from 'code-container';

// Node.js process management
const nodeExt = new NodeProcessExtension(container.getRuntime());
await nodeExt.runScript('build');

// Python file system operations
const fsExt = new PythonFileSystemExtension(container.getRuntime());
await fsExt.createProject('/workspace', 'my-project');

// Python global variable management
const globalsExt = new PythonGlobalsExtension(container.getRuntime());
globalsExt.setGlobal('my_var', 42);

// Python-JavaScript interoperability
const interopExt = new PythonInteropExtension(container.getRuntime());
interopExt.exposeFunction('jsAlert', alert);
```

## Browser Requirements

- **Node.js Container**: Requires modern browsers with SharedArrayBuffer support
- **Python Container**: Works in all modern browsers
- **HTTPS**: Required for WebContainer in production environments

## Testing

Run the Node.js tests:
```bash
pnpm test
```

Test full browser functionality:
```bash
pnpm run build
# Then open tests/browser-test.html and tests/python-test.html in your browser
```

## Architecture

Both containers use a singleton pattern to efficiently share resources:

- **Single Runtime**: Multiple container instances share one WebContainer/Pyodide runtime
- **Reference Counting**: Automatic cleanup when no instances remain
- **Resource Sharing**: Files and packages are shared across instances
- **Isolation**: Each container maintains separate error state and configuration

## Examples

See the `/tests` directory for comprehensive examples:
- `tests/browser-test.html` - Node.js WebContainer examples
- `tests/python-test.html` - Python Pyodide examples
- `tests/extensions-test.js` - Extension usage examples

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request