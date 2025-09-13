# Node.js Sandbox with WebContainer

This document describes the Node.js sandbox implementation using WebContainer for in-browser Node.js execution.

## Features

### 🟢 NodeSandbox Class
- **WebContainer Integration**: Uses StackBlitz WebContainer for running Node.js code in the browser
- **Singleton Pattern**: Shared WebContainer instance across multiple sandbox instances
- **Full Node.js Runtime**: Complete Node.js environment with npm package support
- **File System**: Virtual file system operations (read, write, mkdir, etc.)
- **Package Management**: Install and use npm packages
- **Process Management**: Run scripts, commands, and Node.js applications
- **Terminal Interface**: Interactive shell access
- **Error Handling**: Comprehensive error catching and reporting

### 🔧 Key Components

#### 1. Singleton Pattern
- **Global Instance Management**: Ensures single WebContainer instance across all NodeSandbox instances
- **Reference Counting**: Tracks active sandbox instances
- **Boot Management**: Handles WebContainer initialization and lifecycle
- **Browser Detection**: Ensures browser-only execution

#### 2. NodeSandbox
- **Code Execution**: Run Node.js scripts and modules
- **File Operations**: Full file system API support
- **Package Installation**: Install npm packages on demand
- **Process Spawning**: Execute shell commands and scripts
- **Terminal Access**: Interactive terminal interface
- **Project Management**: Support for full Node.js projects

## Usage Examples

### Basic Node.js Execution

```typescript
import { NodeSandbox } from 'ai-code-sandbox';

const sandbox = new NodeSandbox();
await sandbox.create();

const result = await sandbox.run(`
console.log("Hello from Node.js!");
const sum = 2 + 3;
console.log(\`2 + 3 = \${sum}\`);
return sum * 2;
`);

console.log('Result:', result); // 10
await sandbox.destroy();
```

### File System Operations

```typescript
const sandbox = new NodeSandbox();
await sandbox.create();

// Write files
await sandbox.writeFile('package.json', JSON.stringify({
  name: "my-project",
  version: "1.0.0",
  main: "index.js"
}, null, 2));

await sandbox.writeFile('index.js', `
const fs = require('fs');
console.log('Hello from index.js!');
console.log('Package.json:', JSON.parse(fs.readFileSync('package.json', 'utf8')));
`);

// Read files
const packageJson = await sandbox.readFile('package.json');
console.log('Package.json:', packageJson);


// Run the script
const result = await sandbox.run('node index.js');
console.log('Output:', result);
```


### Package Installation

```typescript
const sandbox = new NodeSandbox();
await sandbox.create();

// Install packages
await sandbox.installPackage('lodash');

// Use packages in Node.js code
const result = await sandbox.run(`
const _ = require('lodash');
const data = [1, 2, 3, 4, 5];
const doubled = _.map(data, x => x * 2);
console.log('Doubled:', doubled);
return doubled;
`);

console.log('Result:', result);
```




### Error Handling

```typescript
const sandbox = new NodeSandbox();
await sandbox.create();

try {
  await sandbox.run(`
    const fs = require('fs');
    // This will throw an error
    fs.readFileSync('non-existent-file.txt');
  `);
} catch (error) {
  console.error('Node.js error:', error.message);
  
  // Get detailed error info
  const lastError = sandbox.getLastError();
  console.error('Last error:', lastError?.message);
}

try {
  // This will fail - package doesn't exist
  await sandbox.installPackage('this-package-definitely-does-not-exist');
} catch (error) {
  console.error('Package installation error:', error.message);
}
```

## Configuration Options

```typescript
interface NodeSandboxOptions {
  packageJson?: Record<string, any>;  // Custom package.json content
  files?: Record<string, string>;     // Initial files to create
}
```

## Singleton Behavior

Multiple NodeSandbox instances share the same underlying WebContainer runtime:

```typescript
const sandbox1 = new NodeSandbox();
const sandbox2 = new NodeSandbox();
const sandbox3 = new NodeSandbox();

await sandbox1.create(); // Boots WebContainer
await sandbox2.create(); // Reuses existing WebContainer
await sandbox3.create(); // Reuses existing WebContainer

// Multiple instances share the same WebContainer

await sandbox1.destroy(); // Decrements count
await sandbox2.destroy(); // Decrements count  
await sandbox3.destroy(); // WebContainer kept alive for reuse
```

## Available Node.js Ecosystem

WebContainer supports the full Node.js ecosystem:

- **Runtime**: Node.js with full API support
- **Package Manager**: npm with access to npmjs.com
- **Frameworks**: Express, Fastify, Koa, Next.js, React, Vue, Angular
- **Tools**: TypeScript, Babel, Webpack, Vite, ESLint, Prettier
- **Databases**: In-memory databases, SQLite via WASM
- **Testing**: Jest, Mocha, Vitest, Playwright
- **And much more**: Any package that works in Node.js

## Testing

### Node.js Environment Test
```bash
pnpm test  # Tests environment detection
```

### Browser Tests
```bash
pnpm run build
# Open tests/browser-test.html in browser
```

The browser test covers:
- Singleton behavior verification
- Basic Node.js execution
- File system operations  
- Package installation (lodash)
- Process spawning
- Error handling
- Terminal interface

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (latest versions)
- **Mobile browsers**: Limited support due to WebContainer requirements

## Performance Notes

- **Initial Boot**: WebContainer takes 5-15 seconds to boot initially
- **Memory Usage**: Node.js runtime requires significant memory (~100-200MB)
- **Execution Speed**: Near-native Node.js performance in browser
- **Package Installation**: npm install performance comparable to local development
- **File Operations**: Fast virtual file system operations

## Limitations

- **Browser Only**: WebContainer requires browser APIs and Service Worker support
- **Network Access**: Limited to fetch/XHR, no raw sockets
- **File System**: Virtual file system only, no access to local files
- **Process Limits**: Some Node.js process APIs may be limited
- **Binary Dependencies**: Native binaries may not work, WASM alternatives needed

## Security

- **Sandboxed**: Node.js code runs in isolated browser environment
- **No File System Access**: Cannot access local file system
- **Network Isolation**: Limited network access, same-origin policy applies
- **Memory Isolation**: Isolated memory space from main browser thread
- **Service Worker**: Uses Service Worker for enhanced isolation

## Advanced Usage

### Custom Configuration

```typescript
const sandbox = new NodeSandbox({
  packageJson: {
    name: 'my-app',
    version: '1.0.0',
    dependencies: {
      lodash: '^4.17.21'
    }
  },
  files: {
    'index.js': 'console.log("Hello World!");',
    'config.json': JSON.stringify({ env: 'development' })
  }
});
```

### Error Handling and Debugging

```typescript
const sandbox = new NodeSandbox();
await sandbox.create();

try {
  const result = await sandbox.run('throw new Error("Test error");');
} catch (error) {
  console.error('Execution error:', error.message);
  
  // Get last error details
  const lastError = sandbox.getLastError();
  console.error('Last error:', lastError?.message);
}
```