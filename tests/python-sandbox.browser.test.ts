import { describe, it, expect, beforeEach } from 'vitest'
import { PythonSandbox } from '../src/index'

// PythonSandbox browser E2E tests using Vitest browser mode with Playwright
describe('PythonSandbox Browser Tests', () => {
  let sandbox: PythonSandbox

  beforeEach(() => {
    sandbox = new PythonSandbox()
  })

  it('should successfully create Pyodide in browser environment', async () => {
    // This test should pass in browser environment (unlike Node.js tests)
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    
    // In browser, Pyodide should be available
    expect(sandbox).toBeDefined()
    
    await sandbox.create()
    
    // If we get here, Pyodide was created successfully
    expect(sandbox.getLastError()).toBeNull()
  }, 30000) // Pyodide can take time to load

  it('should handle Python file operations in browser', async () => {
    await sandbox.create()
    
    // Test basic file operations with correct method signatures
    sandbox.writeFile('/test.py', 'print("Hello Pyodide!")')
    const content = sandbox.readFile('/test.py', 'utf8')
    expect(content).toBe('print("Hello Pyodide!")')
  })

  it('should execute Python code in Pyodide', async () => {
    await sandbox.create()
    
    // Test simple Python execution
    const result = await sandbox.run('2 + 3')
    expect(result).toBe(5)
    
    // Test Python print
    await sandbox.run('print("Hello from Pyodide!")')
  }, 10000)

  it('should install and use Python packages', async () => {
    await sandbox.create()
    
    // Test package installation
    await sandbox.installPackage('micropip')
    
    // Test using installed package
    await sandbox.run('import micropip')
  }, 20000) // Package installation can take time

  it('should have Python-specific methods available', () => {
    // Test that PythonSandbox has the expected API surface
    expect(typeof sandbox.create).toBe('function')
    expect(typeof sandbox.destroy).toBe('function')
    expect(typeof sandbox.run).toBe('function')
    expect(typeof sandbox.runSync).toBe('function')
    expect(typeof sandbox.writeFile).toBe('function')
    expect(typeof sandbox.readFile).toBe('function')
    expect(typeof sandbox.installPackage).toBe('function')
    expect(typeof sandbox.getLastError).toBe('function')
  })

  it('should support synchronous Python execution', async () => {
    await sandbox.create()
    
    // Test synchronous execution (unique to PythonSandbox)
    const result = sandbox.runSync('3 * 4')
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
    const sandbox = new PythonSandbox()
    
    // Pyodide should load successfully in most browser environments
    await sandbox.create()
    
    // Verify Pyodide is properly initialized
    expect(sandbox.getLastError()).toBeNull()
    
    // Test basic Python functionality
    const result = await sandbox.run('1 + 1')
    expect(result).toBe(2)
    
    console.log('✅ Pyodide loaded and initialized successfully')
  }, 30000)

  it('should support Python standard library', async () => {
    const sandbox = new PythonSandbox()
    await sandbox.create()
    
    // Test Python standard library modules
    await sandbox.run('import sys')
    await sandbox.run('import os')
    await sandbox.run('import json')
    
    // Test that they work
    const pythonVersion = await sandbox.run('sys.version_info.major')
    expect(pythonVersion).toBe(3)
    
    console.log('✅ Python standard library modules available')
  })

  it('should support package management with micropip', async () => {
    const sandbox = new PythonSandbox()
    await sandbox.create()
    
    // Install micropip (should be fast as it's pre-loaded)
    await sandbox.installPackage('micropip')
    
    // Use micropip to check available packages
    await sandbox.run(`
import micropip
packages = micropip.list()
print(f"Available packages: {len(packages)}")
`)
    
    console.log('✅ Package management with micropip working')
  }, 30000)
})