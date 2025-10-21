import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadPyodide } from 'pyodide'

// Mock pyodide at module level
vi.mock('pyodide', () => ({
  loadPyodide: vi.fn(),
}))

import { PythonContainer } from '../src/index'

describe('Container API', () => {
  afterEach(() => {
    // Reset runtime after each test
    PythonContainer.teardown()
  })

  it('should export PythonContainer class', () => {
    expect(PythonContainer).toBeDefined()
    expect(PythonContainer.boot).toBeDefined()
    expect(PythonContainer.teardown).toBeDefined()
  })

  it('should fail in Node.js environment (requires browser)', async () => {
    // Mock loadPyodide to reject
    vi.mocked(loadPyodide).mockRejectedValueOnce(new Error('Node.js not supported'))

    // Pyodide requires a browser environment, so boot() should fail in Node.js
    await expect(PythonContainer.boot()).rejects.toThrow()
  })
})

describe('PythonContainer class', () => {
  let mockPyodide: any
  let container: PythonContainer

  beforeEach(async () => {
    // Reset runtime before each test
    PythonContainer.teardown()

    // Mock Pyodide interface
    mockPyodide = {
      runPythonAsync: vi.fn(),
      loadPackage: vi.fn(),
      loadPackagesFromImports: vi.fn(),
      FS: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        readdir: vi.fn(),
        unlink: vi.fn(),
      },
      globals: {},
      runPython: vi.fn(),
    }

    // Mock loadPyodide to return our mock
    vi.mocked(loadPyodide).mockResolvedValue(mockPyodide)

    // Boot container with mocked pyodide
    container = await PythonContainer.boot()
  })

  afterEach(() => {
    vi.clearAllMocks()
    PythonContainer.teardown()
  })

  describe('run()', () => {
    it('should execute Python code and capture output', async () => {
      // Mock successful execution with output
      mockPyodide.runPythonAsync.mockResolvedValue(['Hello from Python!\n', 'None'])
      mockPyodide.loadPackagesFromImports.mockResolvedValue(undefined)

      const result = await container.run('print("Hello from Python!")')

      expect(result).toBe('Hello from Python!\n')
      expect(mockPyodide.runPythonAsync).toHaveBeenCalled()
    })

    it('should install packages before execution', async () => {
      mockPyodide.runPythonAsync.mockResolvedValue(['', 'None'])
      mockPyodide.loadPackage.mockResolvedValue(undefined)
      mockPyodide.loadPackagesFromImports.mockResolvedValue(undefined)

      await container.run('import numpy as np', { packages: ['numpy'] })

      expect(mockPyodide.loadPackage).toHaveBeenCalledWith(['numpy'])
    })

    it('should handle execution errors', async () => {
      mockPyodide.runPythonAsync.mockResolvedValue(['', 'ZeroDivisionError: division by zero'])
      mockPyodide.loadPackagesFromImports.mockResolvedValue(undefined)

      await expect(container.run('1/0')).rejects.toThrow('ZeroDivisionError: division by zero')
    })

    it('should auto-install packages from imports', async () => {
      mockPyodide.runPythonAsync.mockResolvedValue(['', 'None'])
      mockPyodide.loadPackagesFromImports.mockResolvedValue(undefined)

      await container.run('import pandas as pd')

      expect(mockPyodide.loadPackagesFromImports).toHaveBeenCalled()
    })
  })

  describe('file operations', () => {
    it('should write files', () => {
      mockPyodide.FS.writeFile.mockReturnValue(undefined)

      container.writeFile('/test.txt', 'Hello World')

      expect(mockPyodide.FS.writeFile).toHaveBeenCalledWith('/test.txt', 'Hello World')
    })

    it('should read files', () => {
      mockPyodide.FS.readFile.mockReturnValue('Hello World')

      const content = container.readFile('/test.txt', 'utf8')

      expect(content).toBe('Hello World')
      expect(mockPyodide.FS.readFile).toHaveBeenCalledWith('/test.txt', { encoding: 'utf8' })
    })

    it('should read directory contents', () => {
      mockPyodide.FS.readdir.mockReturnValue(['.', '..', 'file1.txt', 'file2.txt'])

      const files = container.readdir('/mydir')

      expect(files).toEqual(['.', '..', 'file1.txt', 'file2.txt'])
      expect(mockPyodide.FS.readdir).toHaveBeenCalledWith('/mydir')
    })

    it('should remove files', () => {
      mockPyodide.FS.unlink.mockReturnValue(undefined)

      container.rm('/test.txt')

      expect(mockPyodide.FS.unlink).toHaveBeenCalledWith('/test.txt')
    })

    it('should create directories', () => {
      mockPyodide.FS.mkdir.mockReturnValue(undefined)

      container.mkdir('/newdir')

      expect(mockPyodide.FS.mkdir).toHaveBeenCalledWith('/newdir')
    })
  })

  describe('package management', () => {
    it('should install packages', async () => {
      mockPyodide.loadPackage.mockResolvedValue(undefined)

      await container.installPackage('numpy')

      expect(mockPyodide.loadPackage).toHaveBeenCalledWith('numpy')
    })
  })
})