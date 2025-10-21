# python-code-container

Python Code Container, wrapping of pyodide for running Python code in the browser.

## Features

- Run Python code in the browser without a server
- Full Python runtime with package support
- TypeScript support with type definitions
- React integration with hooks
- Virtual file system for file operations
- Singleton pattern for efficient resource usage

## Installation

```bash
npm install @examples-ai/python-code-container
# or
yarn add @examples-ai/python-code-container
# or
pnpm add @examples-ai/python-code-container
```

## Quick Start

```typescript
import { PythonContainer } from '@examples-ai/python-code-container';

// Initialize the container
const container = await PythonContainer.boot();

// Execute Python code
const result = await container.run(`
print('Hello from Python!')

import math
result = math.sqrt(16)
print(f'Square root of 16 is {result}')

result
`);

console.log(result); // Output from Python
```

## Using with React

```bash
npm install @examples-ai/python-code-container react react-dom swr
```

```typescript
import {
  PythonContainerProvider,
  usePythonContainer,
} from '@examples-ai/python-code-container/react';

function App() {
  return (
    <PythonContainerProvider>
      <PythonEditor />
    </PythonContainerProvider>
  );
}

function PythonEditor() {
  const { pyodide, isLoading, error } = usePythonContainer();
  const [output, setOutput] = useState('');

  const runCode = async (code: string) => {
    if (!pyodide) return;
    const result = await pyodide.run(code);
    setOutput(result);
  };

  if (isLoading) return <div>Loading Python...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => runCode('print("Hello!")')}>Run Code</button>
      <pre>{output}</pre>
    </div>
  );
}
```

### React API

#### `PythonContainerProvider`

Provides Python container context to child components. Must wrap any components using `usePythonContainer`.

**Props:**

- `children: ReactNode` - Child components

#### `usePythonContainer()`

React hook to access the Python container.

**Returns:**

```typescript
{
  pyodide: PythonContainer | null; // Container instance
  isLoading: boolean; // Loading state
  error: Error | null; // Error state
}
```

## API Reference

- **`PythonContainer.boot(): Promise<PythonContainer>`** - Initialize the Python container and return a singleton instance
- **`run(code: string, options?: RunOptions): Promise<string>`** - Execute Python code and return the captured output
- **`installPackage(packageName: string): Promise<void>`** - Install a Python package from PyPI
- **`readFile(path: string, encoding?: string): string | Uint8Array`** - Read a file from the virtual file system
- **`writeFile(path: string, content: string | Uint8Array): void`** - Write a file to the virtual file system
- **`readdir(path: string): string[]`** - List the contents of a directory
- **`rm(path: string): void`** - Remove a file from the virtual file system
- **`mkdir(path: string): void`** - Create a directory in the virtual file system
- **`globals`** - Access to Python global namespace for getting and setting variables
- **`PythonContainer.teardown(): void`** - Reset the singleton instance for complete reinitialization

```typescript
interface RunOptions {
  packages?: string[]; // Packages to install before execution
  homedir?: string; // Working directory path
  enablePackageAutoInstall?: boolean; // Auto-install from imports (default: true)
  filename?: string; // Filename for the code
}
```

## Examples

### File Operations

```typescript
const container = await PythonContainer.boot();

// Create directories
container.mkdir('/data');

// Write files
container.writeFile('/data/input.csv', 'name,age\nAlice,30\nBob,25');

// List files
const files = container.readdir('/data');

// Read files
const content = container.readFile('/data/input.csv', 'utf8');

// Use in Python
await container.run(`
import pandas as pd
df = pd.read_csv('/data/input.csv')
print(df)
`);

// Remove files
container.rm('/data/input.csv');
```

### Error Handling

```typescript
try {
  await container.run(`
import numpy as np
np.divide(1, 0)
  `);
} catch (error) {
  console.error('Python error:', error.message);
}
```

## License

MIT @ Jimmy Moon <ragingwind@gmail.com>
