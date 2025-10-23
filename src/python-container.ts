import { loadPyodide, type PyodideInterface } from 'pyodide';

export type BootOptions = Parameters<typeof loadPyodide>[0];

export interface RunOptions {
  packages?: string[];
  homedir?: string;
  enablePackageAutoInstall?: boolean;
  filename?: string;
}

export class PythonContainer {
  private static instance: PythonContainer | null = null;
  private static booting: Promise<PythonContainer> | null = null;
  private static pyodide: PyodideInterface | null = null;

  private constructor() {}

  static async boot(options: BootOptions = {}): Promise<PythonContainer> {
    if (PythonContainer.instance && PythonContainer.pyodide) {
      return PythonContainer.instance;
    }

    // Wait for existing boot promise
    if (PythonContainer.booting) {
      return PythonContainer.booting;
    }

    PythonContainer.booting = (async () => {
      try {
        PythonContainer.pyodide = await loadPyodide(options);
        PythonContainer.instance = new PythonContainer();
        PythonContainer.booting = null;
        return PythonContainer.instance;
      } catch (error) {
        console.log('Error booting Pyodide:', error);
        PythonContainer.booting = null;
        throw error;
      }
    })();

    return PythonContainer.booting;
  }

  static teardown(): void {
    PythonContainer.instance = null;
    PythonContainer.pyodide = null;
  }

  private getPyodide(): PyodideInterface {
    if (!PythonContainer.pyodide) {
      throw new Error(
        'Pyodide not initialized. Call PythonContainer.boot() first.'
      );
    }
    return PythonContainer.pyodide;
  }

  private setupHomedir(homedir: string): void {
    try {
      this.getPyodide().FS.mkdir(homedir);
      this.getPyodide().runPython(`
import os
os.chdir('${homedir}')
`);
    } catch (_error) {
      // Directory may already exist
    }
  }

  async run(code: string, options: RunOptions = {}): Promise<any> {
    if (options.homedir || options.packages) {
      await this.setupPythonEnvironment(options);
    }

    const enableAutoInstall = options.enablePackageAutoInstall !== false;
    if (enableAutoInstall) {
      try {
        await this.getPyodide().loadPackagesFromImports(code);
      } catch (_error) {}
    }

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

(_output, _result)
`;

    const result = await this.getPyodide().runPythonAsync(captureCode);
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
    if (options.homedir) {
      await this.setupPythonEnvironment({ homedir: options.homedir });
    }

    await this.getPyodide().loadPackage(packageName);
  }

  readFile(
    path: string,
    encoding: string = 'utf8',
    options: {
      homedir?: string;
    } = {}
  ): string | Uint8Array {
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    return this.getPyodide().FS.readFile(path, {
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
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    this.getPyodide().FS.writeFile(path, content);
  }

  readdir(
    path: string,
    options: {
      homedir?: string;
    } = {}
  ): string[] {
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    return this.getPyodide().FS.readdir(path);
  }

  rm(
    path: string,
    options: {
      homedir?: string;
    } = {}
  ): void {
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    this.getPyodide().FS.unlink(path);
  }

  mkdir(
    path: string,
    options: {
      homedir?: string;
    } = {}
  ): void {
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    this.getPyodide().FS.mkdir(path);
  }

  get globals(): any {
    return this.getPyodide().globals;
  }

  private async setupPythonEnvironment(options: {
    homedir?: string;
    packages?: string[];
  }): Promise<void> {
    if (options.homedir) {
      this.setupHomedir(options.homedir);
    }

    if (options.packages && options.packages.length > 0) {
      await this.getPyodide().loadPackage(options.packages);
    }
  }
}
