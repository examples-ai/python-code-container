import type { PyodideInterface } from './types.js';
import { runtime } from './utils.js';

export async function bootPyodide(): Promise<PythonContainer> {
  if (runtime.__PYTHON_CODE_CONTAINER) {
    return new PythonContainer(runtime.__PYTHON_CODE_CONTAINER);
  }

  try {
    runtime.__PYTHON_CODE_CONTAINER = await initializePythonRuntime();
    return new PythonContainer(runtime.__PYTHON_CODE_CONTAINER);
  } catch (error) {
    console.log('Error booting Pyodide:', error);
    throw error;
  }
}

async function initializePythonRuntime(): Promise<PyodideInterface> {
  const pyodidePath = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/';

  if (!runtime.loadPyodide) {
    throw new Error(
      'Pyodide script not loaded. Ensure PythonContainer component is rendered first.'
    );
  }

  const pyodide = await runtime.loadPyodide({
    indexURL: pyodidePath,
  });

  return pyodide;
}

export function resetPythonRuntime(): void {
  delete runtime.__PYTHON_CODE_CONTAINER;
  delete runtime.__PYTHON_CODE_CONTAINER_PROMISE;
}

// PythonContainer class
export class PythonContainer {
  private pyodide: PyodideInterface;

  constructor(pyodide: PyodideInterface) {
    this.pyodide = pyodide;
  }

  async run(
    code: string,
    options: {
      packages?: string[];
      homedir?: string;
      enablePackageAutoInstall?: boolean;
      filename?: string;
    } = {}
  ): Promise<any> {
    // Set up environment if needed
    if (options.homedir || options.packages) {
      await this.setupPythonEnvironment(options);
    }

    // Auto-install packages if enabled (default: true)
    const enableAutoInstall = options.enablePackageAutoInstall !== false;
    if (enableAutoInstall) {
      try {
        await this.pyodide.loadPackagesFromImports(code);
      } catch (_error) {
        // Package auto-installation failed, continue execution
      }
    }

    // Capture stdout for print statements
    const captureCode = `
import sys
import io
_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
${code
  .split('\n')
  .map((line) => '    ' + line)
  .join('\n')}
    _result = None
except Exception as e:
    _result = str(e)
    sys.stdout.write(f"Error: {e}")
finally:
    _output = sys.stdout.getvalue()
    sys.stdout = _stdout

# Return both output and result
(_output, _result)
`;

    const result = await this.pyodide.runPythonAsync(captureCode);
    const [output, error] = result;

    if (error && error !== 'None') {
      throw new Error(error);
    }

    return output || '';
  }

  async installPackage(
    packageName: string,
    options: {
      homedir?: string;
    } = {}
  ): Promise<void> {
    // Set up environment if needed
    if (options.homedir) {
      await this.setupPythonEnvironment({ homedir: options.homedir });
    }

    await this.pyodide.loadPackage(packageName);
  }

  readFile(
    path: string,
    encoding: string = 'utf8',
    options: {
      homedir?: string;
    } = {}
  ): string | Uint8Array {
    // Set up homedir if specified
    if (options.homedir) {
      try {
        this.pyodide.FS.mkdir(options.homedir);
        this.pyodide.runPython(`
import os
os.chdir('${options.homedir}')
`);
      } catch (_error) {
        // Directory may already exist or be set
      }
    }

    return this.pyodide.FS.readFile(path, {
      encoding: encoding === 'binary' ? undefined : encoding,
    });
  }

  writeFile(
    path: string,
    content: string | Uint8Array,
    options: {
      homedir?: string;
    } = {}
  ): void {
    // Set up homedir if specified
    if (options.homedir) {
      try {
        this.pyodide.FS.mkdir(options.homedir);
        this.pyodide.runPython(`
import os
os.chdir('${options.homedir}')
`);
      } catch (_error) {
        // Directory may already exist or be set
      }
    }

    this.pyodide.FS.writeFile(path, content);
  }

  // Register JavaScript module in Python
  registerJsModule(name: string, module: any): void {
    this.pyodide.registerJsModule(name, module);
  }

  // Unregister JavaScript module from Python
  unregisterJsModule(name: string): void {
    this.pyodide.unregisterJsModule(name);
  }

  // Convert JavaScript object to Python
  toPython(obj: any): any {
    return this.pyodide.toPy(obj);
  }

  // Get/Set Python globals
  getPythonGlobal(name: string): any {
    return this.pyodide.globals.get(name);
  }

  setPythonGlobal(name: string, value: any): void {
    this.pyodide.globals.set(name, value);
  }

  // Setup Python environment with working directory and packages
  private async setupPythonEnvironment(options: {
    homedir?: string;
    packages?: string[];
  }): Promise<void> {
    // Set up working directory
    if (options.homedir) {
      try {
        this.pyodide.FS.mkdir(options.homedir);
        await this.pyodide.runPythonAsync(`
import os
os.chdir('${options.homedir}')
`);
      } catch (_error) {
        // Directory may already exist
      }
    }

    // Load initial packages
    if (options.packages && options.packages.length > 0) {
      await this.pyodide.loadPackage(options.packages);
    }
  }
}
