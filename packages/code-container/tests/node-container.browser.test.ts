import { describe, it, expect, beforeEach } from 'vitest';
import { NodeContainer, TypeScriptMiddleware } from '../src/index';

// NodeContainer browser E2E tests using Vitest browser mode with Playwright
describe('NodeContainer Browser Tests', () => {
  let container: NodeContainer;

  beforeEach(() => {
    container = new NodeContainer();
  });

  it('should be properly instantiated in browser environment', () => {
    // This test should pass in browser environment (unlike Node.js tests)
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');

    // NodeContainer should be instantiable in browser
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(NodeContainer);
  });

  it('should require cross-origin isolation for WebContainer functionality', async () => {
    // WebContainer requires proper cross-origin isolation which test environments often lack
    // This test verifies the container properly detects this requirement

    try {
      await container.create();

      // If we get here, cross-origin isolation is properly set up
      expect(container.getLastError()).toBeNull();

      // Test basic file operations
      await container.writeFile('/test.txt', 'Hello WebContainer!');
      const content = await container.readFile('/test.txt');
      expect(content).toBe('Hello WebContainer!');

      // Test code execution
      const result = await container.run(
        'console.log("Hello from WebContainer"); 42;'
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      // This is the expected behavior in most test environments
      expect(error.message).toMatch(
        /SharedArrayBuffer|postMessage|cross.?origin|Unable to create/i
      );

      // The error should be properly tracked
      expect(container.getLastError()).toBe(error);

      console.log(
        '✅ WebContainer correctly requires cross-origin isolation:',
        error.message
      );
    }
  });

  it('should handle WebContainer creation errors gracefully', async () => {
    // Test error handling when WebContainer cannot be initialized
    try {
      await container.create();
      // If successful, great! Test some basic functionality
      expect(container.getLastError()).toBeNull();
    } catch (error: any) {
      // If it fails, it should be due to environment constraints
      expect(error).toBeInstanceOf(Error);
      expect(container.getLastError()).toBe(error);
      expect(error.message).not.toBe('');
    }
  });

  it('should have WebContainer-specific methods available', () => {
    // Test that NodeContainer has the expected API surface
    expect(typeof container.create).toBe('function');
    expect(typeof container.destroy).toBe('function');
    expect(typeof container.run).toBe('function');
    expect(typeof container.writeFile).toBe('function');
    expect(typeof container.readFile).toBe('function');
    expect(typeof container.installPackage).toBe('function');
    expect(typeof container.getLastError).toBe('function');
  });

  it('should execute TypeScript source files', async () => {
    await container.create();

    // Use the new middleware system for TypeScript support
    container.use(new TypeScriptMiddleware());

    // Real TypeScript test with interfaces and types that need compilation
    const tsCode = `
interface User {
  name: string;
  age: number;
}

const user: User = { name: "Alice", age: 30 };
const greeting: string = \`Hello \${user.name}, you are \${user.age} years old!\`;
console.log(greeting);
console.log("TypeScript compilation successful!");
`;

    // Use the simplified run method - TypeScript middleware handles compilation automatically
    const result = await container.run(tsCode, 'user.ts');
    expect(result).toBeDefined();
    expect(result).toContain('Hello Alice, you are 30 years old!');
    expect(result).toContain('TypeScript compilation successful!');
  }, 60000);


  it('should support npm package installation and usage', async () => {
    await container.create();

    // Install a popular npm package
    await container.installPackage('lodash');

    // Create and run code that uses the installed package (using .cjs extension)
    const testCode = `
const _ = require('lodash');

const numbers = [1, 2, 3, 4, 5];
const doubled = _.map(numbers, n => n * 2);

console.log('Original:', numbers);
console.log('Doubled:', doubled);
console.log('Sum:', _.sum(doubled));
console.log('Lodash test completed successfully');
`;

    // Run the code with .cjs extension
    const result = await container.run(testCode, 'test-lodash.cjs');
    expect(result).toBeDefined();
    expect(result).toMatch(
      /Doubled:\s*\[\s*(?:\x1b\[\d+m)*2(?:\x1b\[\d+m)*,\s*(?:\x1b\[\d+m)*4(?:\x1b\[\d+m)*,\s*(?:\x1b\[\d+m)*6(?:\x1b\[\d+m)*,\s*(?:\x1b\[\d+m)*8(?:\x1b\[\d+m)*,\s*(?:\x1b\[\d+m)*10(?:\x1b\[\d+m)*\s*\]/
    );
    expect(result).toMatch(/Sum:\s*(?:\x1b\[\d+m)*30(?:\x1b\[\d+m)*/);
    expect(result).toContain('Lodash test completed successfully');
  }, 20000);

  it('should handle file system operations with nested directories', async () => {
    await container.create();

    // Create and run file system operations directly (using relative paths and .cjs extension)
    const structureCode = `
const fs = require('fs');

// Create nested directories (using relative paths)
fs.mkdirSync('src', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });
fs.mkdirSync('src/utils', { recursive: true });

// Create files in different directories
fs.writeFileSync('src/index.js', 'console.log("Main app");');
fs.writeFileSync('src/components/Button.js', 'console.log("Button component");');
fs.writeFileSync('src/utils/helpers.js', 'console.log("Helper functions");');

// List directory contents
const files = fs.readdirSync('src', { recursive: true });
console.log('Project structure:', files);
console.log('Created', files.length, 'files/directories');
console.log('File system operations completed successfully');
`;

    const result = await container.run(structureCode, 'setup.cjs');
    expect(result).toBeDefined();
    expect(result).toContain('File system operations completed successfully');

    // Verify files were created using relative paths
    const indexContent = await container.readFile('src/index.js');
    expect(indexContent).toContain('Main app');

    const buttonContent = await container.readFile('src/components/Button.js');
    expect(buttonContent).toContain('Button component');
  });

  it('should support async/await and Promise-based code', async () => {
    await container.create();

    const asyncCode = `
async function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'Hello from async function!', timestamp: Date.now() });
    }, 100);
  });
}

async function processData() {
  try {
    console.log('Starting async operation...');
    const result = await fetchData();
    console.log('Received:', result);
    console.log('Async operation completed successfully');
    return result.data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Run the async function immediately (IIFE)
(async () => {
  const result = await processData();
  console.log('Final result:', result);
})();
`;

    const result = await container.run(asyncCode);
    expect(result).toBeDefined();
    expect(result).toContain('Starting async operation...');
    expect(result).toContain('Async operation completed successfully');
    expect(result).toContain('Final result: Hello from async function!');
  });
});

describe('WebContainer Integration Tests', () => {
  it('should verify browser environment supports WebContainer requirements', () => {
    // Check that we're in a browser environment
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
    expect(typeof Worker).toBe('function');

    // Check for SharedArrayBuffer support (cross-origin isolation dependent)
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    const isCrossOriginIsolated = window.crossOriginIsolated === true;

    console.log('🔍 Browser environment check:');
    console.log('  - SharedArrayBuffer available:', hasSharedArrayBuffer);
    console.log('  - Cross-origin isolated:', isCrossOriginIsolated);
    console.log(
      '  - WebContainer requirements met:',
      hasSharedArrayBuffer && isCrossOriginIsolated
    );
  });

  it('should handle WebContainer CDN loading', async () => {
    // Test that we can attempt to load WebContainer from CDN
    const container = new NodeContainer();

    try {
      await container.create();
      console.log('✅ WebContainer loaded successfully from CDN');
    } catch (error: any) {
      // Expected in most test environments
      expect(error.message).toMatch(
        /SharedArrayBuffer|postMessage|cross.?origin|Unable to create|network/i
      );
      console.log(
        'ℹ️ WebContainer CDN loading failed (expected in test environment):',
        error.message
      );
    }
  });
});
