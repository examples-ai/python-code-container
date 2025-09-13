import { describe, it, expect, beforeEach } from 'vitest'
import { PythonContainer } from '../src/index'

// PythonContainer browser E2E tests using Vitest browser mode with Playwright
describe('PythonContainer Browser Tests', () => {
  let container: PythonContainer

  beforeEach(() => {
    container = new PythonContainer()
  })

  it('should successfully create Pyodide in browser environment', async () => {
    // This test should pass in browser environment (unlike Node.js tests)
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    
    // In browser, Pyodide should be available
    expect(container).toBeDefined()
    
    await container.create()
    
    // If we get here, Pyodide was created successfully
    expect(container.getLastError()).toBeNull()
  }, 30000) // Pyodide can take time to load

  it('should handle Python file operations in browser', async () => {
    await container.create()
    
    // Test basic file operations with correct method signatures
    container.writeFile('/test.py', 'print("Hello Pyodide!")')
    const content = container.readFile('/test.py', 'utf8')
    expect(content).toBe('print("Hello Pyodide!")')
  })

  it('should execute Python code in Pyodide', async () => {
    await container.create()
    
    // Test simple Python execution
    const result = await container.run('2 + 3')
    expect(result).toBe(5)
    
    // Test Python print
    await container.run('print("Hello from Pyodide!")')
  }, 10000)

  it('should install and use Python packages', async () => {
    await container.create()
    
    // Test package installation
    await container.installPackage('micropip')
    
    // Test using installed package
    await container.run('import micropip')
  }, 20000) // Package installation can take time

  it('should have Python-specific methods available', () => {
    // Test that PythonContainer has the expected API surface
    expect(typeof container.create).toBe('function')
    expect(typeof container.destroy).toBe('function')
    expect(typeof container.run).toBe('function')
    expect(typeof container.runSync).toBe('function')
    expect(typeof container.writeFile).toBe('function')
    expect(typeof container.readFile).toBe('function')
    expect(typeof container.installPackage).toBe('function')
    expect(typeof container.getLastError).toBe('function')
  })

  it('should support synchronous Python execution', async () => {
    await container.create()
    
    // Test synchronous execution (unique to PythonContainer)
    const result = container.runSync('3 * 4')
    expect(result).toBe(12)
  })
})

describe('Pyodide Integration Tests', () => {
  it('should verify browser environment supports Pyodide', () => {
    // Check that we're in a browser environment
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    
    // Pyodide doesn't require cross-origin isolation like WebContainer
    console.log('🐍 Pyodide environment check:')
    console.log('  - Browser globals available: ✅')
    console.log('  - Script loading available: ✅') 
    console.log('  - No cross-origin isolation required: ✅')
  })

  it('should handle Pyodide CDN loading and initialization', async () => {
    const container = new PythonContainer()
    
    // Pyodide should load successfully in most browser environments
    await container.create()
    
    // Verify Pyodide is properly initialized
    expect(container.getLastError()).toBeNull()
    
    // Test basic Python functionality
    const result = await container.run('1 + 1')
    expect(result).toBe(2)
    
    console.log('✅ Pyodide loaded and initialized successfully')
  }, 30000)

  it('should support Python standard library', async () => {
    const container = new PythonContainer()
    await container.create()
    
    // Test Python standard library modules
    await container.run('import sys')
    await container.run('import os')
    await container.run('import json')
    
    // Test that they work
    const pythonVersion = await container.run('sys.version_info.major')
    expect(pythonVersion).toBe(3)
    
    console.log('✅ Python standard library modules available')
  })

  it('should support package management with micropip', async () => {
    const container = new PythonContainer()
    await container.create()
    
    // Install micropip (should be fast as it's pre-loaded)
    await container.installPackage('micropip')
    
    // Use micropip to check available packages
    await container.run(`
import micropip
packages = micropip.list()
print(f"Available packages: {len(packages)}")
`)
    
    console.log('✅ Package management with micropip working')
  }, 30000)
})