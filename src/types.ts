export interface Middleware<TRuntime> {
  process(
    context: ExecutionContext<TRuntime>
  ): Promise<ExecutionContext<TRuntime>>;
}

export interface ExecutionContext<TRuntime> {
  code: string;
  filename: string;
  runtime: TRuntime;
  metadata: Record<string, any>;
}

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

export interface PyodideModule {
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
