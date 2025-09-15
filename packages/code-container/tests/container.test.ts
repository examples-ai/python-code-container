import { describe, it, expect, beforeEach } from 'vitest'
import { NodeContainer, PythonContainer } from '../src/index'

describe('NodeContainer Environment Tests', () => {
  let container: NodeContainer

  beforeEach(() => {
    container = new NodeContainer()
  })

  it('should correctly detect Node.js environment - WebContainer requires browser', async () => {
    expect(container).toBeDefined()
    
    // Test 1: Environment check (from legacy test)
    await expect(container.create()).rejects.toThrow('WebContainer requires a browser environment')
    
    // This is expected behavior - NodeContainer is designed for browser environments
    const lastError = container.getLastError()
    expect(lastError?.message).toContain('browser environment')
  })

  it('should handle multiple create() calls protection safely', async () => {
    // Test 2: Multiple create() calls protection (from legacy test)
    const container2 = new NodeContainer()
    
    // First call should fail with environment error
    await expect(container2.create()).rejects.toThrow('browser environment')
    
    // Try multiple calls - should all fail with same error, no boot attempts
    await expect(container2.create()).rejects.toThrow('browser environment')
    await expect(container2.create()).rejects.toThrow('browser environment')
    
    // Should track the error consistently
    const lastError = container2.getLastError()
    expect(lastError).toBeDefined()
    expect(lastError?.message).toContain('WebContainer requires a browser environment')
  })

  it('should properly track errors with getLastError()', async () => {
    try {
      await container.create()
      // Should not reach here
      expect.fail('Expected create() to throw')
    } catch (error) {
      // Error should be tracked in getLastError()
      const lastError = container.getLastError()
      expect(lastError).toBe(error)
      expect(lastError?.message).toContain('WebContainer requires a browser environment')
    }
  })
})

describe('PythonContainer Environment Tests', () => {
  let container: PythonContainer

  beforeEach(() => {
    container = new PythonContainer()
  })

  it('should correctly detect Node.js environment - Pyodide requires browser', async () => {
    expect(container).toBeDefined()
    
    // Test 3: Python container environment detection (from legacy test) 
    await expect(container.create()).rejects.toThrow('Pyodide requires a browser environment')
    
    // This is expected behavior - PythonContainer is designed for browser environments
    const lastError = container.getLastError()
    expect(lastError?.message).toContain('browser environment')
  })

  it('should handle multiple create() calls safely', async () => {
    // First call should fail with environment error
    await expect(container.create()).rejects.toThrow('browser environment')
    
    // Second call should also fail with same error
    await expect(container.create()).rejects.toThrow('browser environment')
    
    // Should track the error
    const lastError = container.getLastError()
    expect(lastError).toBeDefined()
    expect(lastError?.message).toContain('Pyodide requires a browser environment')
  })

  it('should properly track errors with getLastError()', async () => {
    try {
      await container.create()
      // Should not reach here
      expect.fail('Expected create() to throw')
    } catch (error) {
      // Error should be tracked in getLastError()
      const lastError = container.getLastError()
      expect(lastError).toBe(error)
      expect(lastError?.message).toContain('Pyodide requires a browser environment')
    }
  })
})

describe('Container Base Functionality', () => {
  it('should export NodeContainer and PythonContainer classes', () => {
    expect(NodeContainer).toBeDefined()
    expect(PythonContainer).toBeDefined()
  })

  it('should create container instances without errors', () => {
    const nodeContainer = new NodeContainer()
    const pythonContainer = new PythonContainer()
    
    expect(nodeContainer).toBeInstanceOf(NodeContainer)
    expect(pythonContainer).toBeInstanceOf(PythonContainer)
  })

  it('should have getLastError() method available', () => {
    const nodeContainer = new NodeContainer()
    const pythonContainer = new PythonContainer()
    
    // Initially should return null (no errors yet)
    expect(nodeContainer.getLastError()).toBeNull()
    expect(pythonContainer.getLastError()).toBeNull()
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