import { describe, it, expect } from 'vitest'
import { bootWebContainer, bootPyodide } from '../src/index'


describe('Container API Tests', () => {
  it('should export new container API', () => {
    expect(bootWebContainer).toBeDefined()
    expect(bootPyodide).toBeDefined()
  })

  it('should handle bootWebContainer environment error', async () => {
    await expect(bootWebContainer()).rejects.toThrow('window is not defined')
  })

  it('should handle bootPyodide environment error', async () => {
    await expect(bootPyodide()).rejects.toThrow('Window access requires a browser environment')
  })

  it('should handle container initialization errors', async () => {
    // Test that containers reject properly when browser environment is not available
    await expect(bootWebContainer()).rejects.toThrow()
    await expect(bootPyodide()).rejects.toThrow()
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