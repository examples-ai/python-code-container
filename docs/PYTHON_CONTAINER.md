# Python Container with Pyodide

This document describes the Python container implementation using Pyodide for in-browser Python execution.

## Features

### 🐍 PythonContainer Class
- **Pyodide Integration**: Uses Pyodide for running Python code in the browser
- **Singleton Pattern**: Shared Pyodide instance across multiple container instances
- **Dynamic Loading**: Configurable Pyodide CDN path with automatic script loading
- **Package Management**: Install and use Python packages (NumPy, Matplotlib, etc.)
- **File System**: Virtual file system operations (read, write, mkdir, etc.)
- **JavaScript Interop**: Bidirectional communication between Python and JavaScript
- **Error Handling**: Comprehensive error catching and reporting

### 🔧 Key Components

#### 1. Singleton Pattern
- **Global Instance Management**: Ensures single Pyodide instance across all PythonContainer instances
- **Reference Counting**: Tracks active container instances  
- **Dynamic Loading**: Loads Pyodide script from configurable CDN path
- **Browser Detection**: Ensures browser-only execution

#### 2. PythonContainer
- **Async/Sync Execution**: Supports both `run()` and `runSync()` methods
- **Package Auto-Installation**: Automatically installs packages from import statements
- **File Operations**: Full file system API support
- **Global Variables**: Get/set Python global variables from JavaScript
- **Module Registration**: Register JavaScript modules for Python access

## Usage Examples

### Basic Python Execution

```typescript
import { PythonContainer } from 'code-container';

const container = new PythonContainer();
await container.create();

const result = await container.run(`
print("Hello from Python!")
x = 2 + 3
print(f"2 + 3 = {x}")
x * 2
`);

console.log('Result:', result); // 10
await container.destroy();
```

### Custom Pyodide Path

```typescript
const container = new PythonContainer({
  pyodidePath: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
  packages: ['numpy', 'matplotlib'],
  timeout: 60000 // 1 minute timeout
});

await container.create();
```

### Package Installation and Usage

```typescript
const container = new PythonContainer();
await container.create();

// Install packages
await container.installPackage('numpy');
await container.installPackages(['matplotlib', 'pandas']);

// Use packages
const result = await container.run(`
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
np.mean(arr)
`);

console.log('Mean:', result); // 3
```

### File System Operations

```typescript
const container = new PythonContainer();
await container.create();

// Write files
await container.writeFile('data.txt', 'Hello World!');

// Read files
const content = await container.readFile('data.txt');
console.log(content); // "Hello World!"


// Python file operations
await container.run(`
with open('script.py', 'w') as f:
    f.write('print("Hello from Python file!")')

exec(open('script.py').read())
`);
```

### JavaScript-Python Interoperability

```typescript
const container = new PythonContainer();
await container.create();

// Register JavaScript module for Python
const jsModule = {
  greet: (name) => `Hello ${name}!`,
  multiply: (a, b) => a * b,
  getData: () => ({ x: 10, y: 20 })
};

container.registerJsModule('jstools', jsModule);

const result = await container.run(`
from js import jstools

# Call JavaScript functions
greeting = jstools.greet("Python")
product = jstools.multiply(5, 7)
data = jstools.getData()

print(greeting)  # "Hello Python!"
print(f"5 * 7 = {product}")  # "5 * 7 = 35"
print(f"Data: x={data.x}, y={data.y}")  # "Data: x=10, y=20"

product
`);

console.log('Result:', result); // 35
```

### Global Variable Access

```typescript
const container = new PythonContainer();
await container.create();

// Set Python global from JavaScript
container.setGlobal('js_data', { message: 'Hello from JS!', numbers: [1, 2, 3] });

await container.run(`
print(js_data['message'])  # "Hello from JS!"
print(js_data['numbers'])  # [1, 2, 3]

# Create Python global
result = sum(js_data['numbers'])
`);

// Get Python global in JavaScript
const result = container.getGlobal('result');
console.log('Sum:', result.toJs()); // 6
```

### Error Handling

```typescript
const container = new PythonContainer();
await container.create();

try {
  await container.run('raise ValueError("Something went wrong!")');
} catch (error) {
  console.error('Python error:', error.message);
  
  // Get detailed error info
  const lastError = container.getLastError();
  console.error('Last error:', lastError?.message);
}
```

## Configuration Options

```typescript
interface PythonContainerOptions {
  pyodidePath?: string;                // CDN path for Pyodide (default: jsdelivr)
  packages?: string[];                 // Packages to install on creation
  homedir?: string;                    // Working directory
  enablePackageAutoInstall?: boolean; // Auto-install from imports (default: true)
}
```

## Singleton Behavior

Multiple PythonContainer instances share the same underlying Pyodide runtime:

```typescript
const container1 = new PythonContainer();
const container2 = new PythonContainer();
const container3 = new PythonContainer();

await container1.create(); // Loads Pyodide
await container2.create(); // Reuses existing Pyodide
await container3.create(); // Reuses existing Pyodide

// Multiple instances share the same Pyodide runtime

await container1.destroy(); // Decrements count
await container2.destroy(); // Decrements count  
await container3.destroy(); // Pyodide kept alive for reuse
```

## Available Packages

Pyodide includes many popular Python packages:

- **Scientific Computing**: NumPy, SciPy, Pandas, Matplotlib
- **Machine Learning**: scikit-learn, statsmodels  
- **Data Processing**: Pillow, lxml, beautifulsoup4
- **And many more**: See [Pyodide packages](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)

## Testing

### Node.js Environment Test
```bash
pnpm test  # Tests environment detection
```

### Browser Tests
```bash
pnpm run build
# Open tests/python-test.html in browser
```

The browser test covers:
- Singleton behavior verification
- Basic Python execution
- File system operations  
- Package installation (NumPy)
- JavaScript-Python interoperability
- Error handling
- Custom Pyodide path configuration

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (with some limitations on older versions)
- **Mobile browsers**: Limited support due to memory requirements

## Performance Notes

- **Initial Load**: Pyodide is ~10MB and takes 10-30 seconds to load initially
- **Memory Usage**: Python runtime requires significant memory (~50-100MB)
- **Execution Speed**: ~10-50x slower than native Python due to WebAssembly overhead
- **Package Loading**: Large packages (matplotlib, scipy) add significant load time

## Limitations

- **Browser Only**: Pyodide requires browser APIs (DOM, fetch, etc.)
- **Package Limitations**: Not all Python packages are available in Pyodide
- **File System**: Virtual file system only, no access to local files
- **Threading**: Limited threading support due to WebAssembly constraints
- **Memory**: Large datasets may hit browser memory limits

## Security

- **Isolated**: Python code runs in isolated WebAssembly environment
- **No File System Access**: Cannot access local file system
- **No Network (by default)**: Limited network access unless explicitly enabled
- **JavaScript Interop**: Controlled communication via registered modules