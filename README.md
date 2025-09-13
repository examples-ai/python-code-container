# Code Container

A TypeScript library for running Node.js and Python code in isolated browser environments.

## Features

- 🌐 **Browser-based**: Run Node.js and Python code directly in the browser
- 🏗️ **WebContainer Integration**: Full Node.js runtime powered by StackBlitz WebContainer
- 🐍 **Pyodide Integration**: Complete Python environment with scientific packages
- 🔒 **Sandboxed**: Secure isolated execution environments
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

### Node.js Sandbox

```typescript
import { NodeSandbox } from 'code-container';

const sandbox = new NodeSandbox();
await sandbox.create();

// Run Node.js code
const result = await sandbox.run(`
console.log("Hello from Node.js!");
const sum = 2 + 3;
return sum * 2;
`);

console.log('Result:', result); // 10

// Install and use packages
await sandbox.installPackage('lodash');
const lodashResult = await sandbox.run(`
const _ = require('lodash');
return _.chunk([1, 2, 3, 4, 5, 6], 2);
`);

console.log('Lodash result:', lodashResult); // [[1, 2], [3, 4], [5, 6]]

await sandbox.destroy();
```

### Python Sandbox

```typescript
import { PythonSandbox } from 'code-container';

const sandbox = new PythonSandbox();
await sandbox.create();

// Run Python code
const result = await sandbox.run(`
print("Hello from Python!")
import math
result = math.sqrt(16) + math.pi
print(f"Result: {result}")
result
`);

console.log('Result:', result); // ~7.14

// Install and use packages
await sandbox.installPackage('numpy');
const numpyResult = await sandbox.run(`
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
np.mean(arr)
`);

console.log('NumPy mean:', numpyResult); // 3

await sandbox.destroy();
```

## API Reference

### NodeSandbox

```typescript
class NodeSandbox {
  constructor(options?: NodeSandboxOptions)
  
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

interface NodeSandboxOptions {
  packageJson?: Record<string, any>  // Custom package.json content
  files?: Record<string, string>     // Initial files to create
}
```

### PythonSandbox

```typescript
class PythonSandbox {
  constructor(options?: PythonSandboxOptions)
  
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

interface PythonSandboxOptions {
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
const nodeExt = new NodeProcessExtension(sandbox.getRuntime());
await nodeExt.runScript('build');

// Python file system operations
const fsExt = new PythonFileSystemExtension(sandbox.getRuntime());
await fsExt.createProject('/workspace', 'my-project');

// Python global variable management
const globalsExt = new PythonGlobalsExtension(sandbox.getRuntime());
globalsExt.setGlobal('my_var', 42);

// Python-JavaScript interoperability
const interopExt = new PythonInteropExtension(sandbox.getRuntime());
interopExt.exposeFunction('jsAlert', alert);
```

## Browser Requirements

- **Node.js Sandbox**: Requires modern browsers with SharedArrayBuffer support
- **Python Sandbox**: Works in all modern browsers
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

Both sandboxes use a singleton pattern to efficiently share resources:

- **Single Runtime**: Multiple sandbox instances share one WebContainer/Pyodide runtime
- **Reference Counting**: Automatic cleanup when no instances remain
- **Resource Sharing**: Files and packages are shared across instances
- **Isolation**: Each sandbox maintains separate error state and configuration

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