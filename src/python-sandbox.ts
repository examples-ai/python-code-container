import { Sandbox, Environment, ExecutionContext } from './utils/index.js';

// Type definitions for Pyodide
export interface PyodideInterface {
  runPython(code: string): any;
  runPythonAsync(code: string): Promise<any>;
  loadPackage(packages: string | string[]): Promise<void>;
  loadPackagesFromImports(code: string): Promise<void>;
  registerJsModule(name: string, module: any): void;
  unregisterJsModule(name: string): void;
  toPy(obj: any): any;
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(
      path: string,
      options?: { encoding?: string }
    ): string | Uint8Array;
    mkdir(path: string): void;
    rmdir(path: string): void;
    unlink(path: string): void;
    readdir(path: string): string[];
  };
  globals: {
    get(name: string): any;
    set(name: string, value: any): void;
  };
}

interface PyodideModule {
  loadPyodide(config?: {
    indexURL?: string;
    packageCacheDir?: string;
    lockFileURL?: string;
    homedir?: string;
    stdin?: () => string;
    stdout?: (text: string) => void;
    stderr?: (text: string) => void;
  }): Promise<PyodideInterface>;
}

declare global {
  interface Window {
    loadPyodide?: PyodideModule['loadPyodide'];
  }
}

export interface PythonSandboxOptions {
  pyodidePath?: string;
  packages?: string[];
  homedir?: string;
  enablePackageAutoInstall?: boolean;
}

type PythonSandboxDefaults = Required<PythonSandboxOptions>;

export class PythonSandbox extends Sandbox<
  PythonSandboxOptions,
  PyodideInterface
> {
  constructor(options: PythonSandboxOptions = {}) {
    const defaults: PythonSandboxDefaults = {
      pyodidePath: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      packages: [],
      homedir: '',
      enablePackageAutoInstall: true,
    };
    super(options, defaults);
  }

  protected validateEnvironment(): void {
    Environment.requireBrowser('Pyodide');
  }

  protected async createInstance(): Promise<PyodideInterface> {
    if (!Environment.getWindow().loadPyodide) {
      await this.loadPyodideScript();
    }

    const pyodidePath = this.options.pyodidePath.endsWith('/')
      ? this.options.pyodidePath
      : this.options.pyodidePath + '/';

    return await Environment.getWindow().loadPyodide({
      indexURL: pyodidePath,
      // stdout and stderr are handled by Python internally
    });
  }

  protected async destroyInstance(_instance: PyodideInterface): Promise<void> {
    // Pyodide doesn't have a cleanup method - keep for reuse
  }

  private async loadPyodideScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pyodidePath = this.options.pyodidePath.endsWith('/')
        ? this.options.pyodidePath
        : this.options.pyodidePath + '/';

      const script = Environment.getDocument().createElement('script');
      script.src = `${pyodidePath}pyodide.js`;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error: any) => {
        const err = new Error(
          `Failed to load Pyodide from ${pyodidePath}pyodide.js`
        );
        // Pyodide script load failed
        reject(err);
      };
      Environment.getDocument().head.appendChild(script);
    });
  }

  protected async initializeRuntime(): Promise<void> {
    const pyodide = this.getRuntime();

    // Set up working directory
    if (this.options.homedir) {
      try {
        pyodide.FS.mkdir(this.options.homedir);
        await pyodide.runPythonAsync(`
import os
os.chdir('${this.options.homedir}')
`);
      } catch (error) {
        // Directory may already exist
      }
    }

    // Load initial packages
    if (this.options.packages.length > 0) {
      await pyodide.loadPackage(this.options.packages);
    }
  }

  async run(code: string, filename?: string): Promise<any> {
    return this.runWithMiddlewares(code, filename || 'main.py');
  }

  protected async executeCode(context: ExecutionContext<PyodideInterface>): Promise<any> {
    const pyodide = context.runtime;

    // Auto-install packages if enabled
    if (this.options.enablePackageAutoInstall) {
      try {
        await pyodide.loadPackagesFromImports(context.code);
      } catch (error) {
        // Package auto-installation failed, continue execution
      }
    }

    // Execute code
    if (context.filename && context.filename !== 'main.py') {
      pyodide.FS.writeFile(context.filename, context.code);
      return await pyodide.runPythonAsync(`exec(open('${context.filename}').read())`);
    } else {
      return await pyodide.runPythonAsync(context.code);
    }
  }

  runSync(code: string): any {
    const pyodide = this.getRuntime();
    return pyodide.runPython(code);
  }

  async installPackage(packageName: string): Promise<void> {
    const pyodide = this.getRuntime();
    await pyodide.loadPackage(packageName);
  }

  readFile(path: string, encoding: string = 'utf8'): string | Uint8Array {
    const pyodide = this.getRuntime();
    return pyodide.FS.readFile(path, {
      encoding: encoding === 'binary' ? undefined : encoding,
    });
  }

  writeFile(path: string, content: string | Uint8Array): void {
    const pyodide = this.getRuntime();
    pyodide.FS.writeFile(path, content);
  }
}

export default PythonSandbox;
