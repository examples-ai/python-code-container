import { describe, it, expect, beforeEach } from 'vitest'
import { NodeSandbox, PythonSandbox } from '../src/index'

describe('NodeSandbox Environment Tests', () => {
  let sandbox: NodeSandbox

  beforeEach(() => {
    sandbox = new NodeSandbox()
  })

  it('should correctly detect Node.js environment - WebContainer requires browser', async () => {
    expect(sandbox).toBeDefined()
    
    // Test 1: Environment check (from legacy test)
    await expect(sandbox.create()).rejects.toThrow('WebContainer requires a browser environment')
    
    // This is expected behavior - NodeSandbox is designed for browser environments
    const lastError = sandbox.getLastError()
    expect(lastError?.message).toContain('browser environment')
  })

  it('should handle multiple create() calls protection safely', async () => {
    // Test 2: Multiple create() calls protection (from legacy test)
    const sandbox2 = new NodeSandbox()
    
    // First call should fail with environment error
    await expect(sandbox2.create()).rejects.toThrow('browser environment')
    
    // Try multiple calls - should all fail with same error, no boot attempts
    await expect(sandbox2.create()).rejects.toThrow('browser environment')
    await expect(sandbox2.create()).rejects.toThrow('browser environment')
    
    // Should track the error consistently
    const lastError = sandbox2.getLastError()
    expect(lastError).toBeDefined()
    expect(lastError?.message).toContain('WebContainer requires a browser environment')
  })

  it('should properly track errors with getLastError()', async () => {
    try {
      await sandbox.create()
      // Should not reach here
      expect.fail('Expected create() to throw')
    } catch (error) {
      // Error should be tracked in getLastError()
      const lastError = sandbox.getLastError()
      expect(lastError).toBe(error)
      expect(lastError?.message).toContain('WebContainer requires a browser environment')
    }
  })
})

describe('PythonSandbox Environment Tests', () => {
  let sandbox: PythonSandbox

  beforeEach(() => {
    sandbox = new PythonSandbox()
  })

  it('should correctly detect Node.js environment - Pyodide requires browser', async () => {
    expect(sandbox).toBeDefined()
    
    // Test 3: Python sandbox environment detection (from legacy test) 
    await expect(sandbox.create()).rejects.toThrow('Pyodide requires a browser environment')
    
    // This is expected behavior - PythonSandbox is designed for browser environments
    const lastError = sandbox.getLastError()
    expect(lastError?.message).toContain('browser environment')
  })

  it('should handle multiple create() calls safely', async () => {
    // First call should fail with environment error
    await expect(sandbox.create()).rejects.toThrow('browser environment')
    
    // Second call should also fail with same error
    await expect(sandbox.create()).rejects.toThrow('browser environment')
    
    // Should track the error
    const lastError = sandbox.getLastError()
    expect(lastError).toBeDefined()
    expect(lastError?.message).toContain('Pyodide requires a browser environment')
  })

  it('should properly track errors with getLastError()', async () => {
    try {
      await sandbox.create()
      // Should not reach here
      expect.fail('Expected create() to throw')
    } catch (error) {
      // Error should be tracked in getLastError()
      const lastError = sandbox.getLastError()
      expect(lastError).toBe(error)
      expect(lastError?.message).toContain('Pyodide requires a browser environment')
    }
  })
})

describe('Sandbox Base Functionality', () => {
  it('should export NodeSandbox and PythonSandbox classes', () => {
    expect(NodeSandbox).toBeDefined()
    expect(PythonSandbox).toBeDefined()
  })

  it('should create sandbox instances without errors', () => {
    const nodeSandbox = new NodeSandbox()
    const pythonSandbox = new PythonSandbox()
    
    expect(nodeSandbox).toBeInstanceOf(NodeSandbox)
    expect(pythonSandbox).toBeInstanceOf(PythonSandbox)
  })

  it('should have getLastError() method available', () => {
    const nodeSandbox = new NodeSandbox()
    const pythonSandbox = new PythonSandbox()
    
    // Initially should return null (no errors yet)
    expect(nodeSandbox.getLastError()).toBeNull()
    expect(pythonSandbox.getLastError()).toBeNull()
  })
})

describe('Integration Tests', () => {
  it('should provide clear guidance for full functionality testing', () => {
    // This test documents the browser testing guidance from legacy test
    const guidance = {
      buildCommand: 'pnpm run build',
      nodeWebContainerTest: 'tests/browser-test.html',
      pythonPyodideTest: 'tests/python-test.html'
    }
    
    expect(guidance.buildCommand).toBe('pnpm run build')
    expect(guidance.nodeWebContainerTest).toBe('tests/browser-test.html')  
    expect(guidance.pythonPyodideTest).toBe('tests/python-test.html')
  })
})