export interface PythonInteropInterface {
  registerJsModule(name: string, module: any): void;
  unregisterJsModule(name: string): void;
  runPython(code: string): any;
  globals: {
    get(name: string): any;
    set(name: string, value: any): void;
  };
}

export interface ModuleInfo {
  name: string;
  functions: string[];
  properties: string[];
}

export class PythonInteropExtension {
  constructor(private runtime: PythonInteropInterface) {}

  registerJsModule(name: string, module: any): void {
    this.runtime.registerJsModule(name, module);
  }

  unregisterJsModule(name: string): void {
    this.runtime.unregisterJsModule(name);
  }

  callPythonFunction(functionName: string, ...args: any[]): any {
    const func = this.runtime.globals.get(functionName);
    if (!func) {
      throw new Error(`Python function '${functionName}' not found`);
    }
    return func(...args);
  }

  evaluateExpression(expression: string): any {
    return this.runtime.runPython(expression);
  }

  createProxy(pythonObject: any): any {
    return pythonObject.toJs ? pythonObject.toJs() : pythonObject;
  }

  registerJsFunction(name: string, func: Function): void {
    this.registerJsModule(name, { [name]: func });
  }

  registerJsObject(name: string, obj: any): void {
    this.registerJsModule(name, obj);
  }

  getRegisteredModules(): string[] {
    try {
      const result = this.runtime.runPython(`
import js
[name for name in dir(js) if not name.startswith('_')]
`);
      return result.toJs ? result.toJs() : result;
    } catch {
      return [];
    }
  }

  testModuleAccess(moduleName: string): boolean {
    try {
      this.runtime.runPython(`
from js import ${moduleName}
`);
      return true;
    } catch {
      return false;
    }
  }

  createJsBridge(bridgeName: string, functions: Record<string, Function>): void {
    const bridge = {
      ...functions,
      __info: {
        name: bridgeName,
        functions: Object.keys(functions),
        created: new Date().toISOString()
      }
    };
    
    this.registerJsModule(bridgeName, bridge);
  }

  executePythonWithJsContext(code: string, context: Record<string, any>): any {
    // Temporarily register context
    const tempModuleName = `__temp_${Date.now()}`;
    this.registerJsModule(tempModuleName, context);
    
    try {
      const wrappedCode = `
from js import ${tempModuleName} as ctx
${code}
`;
      return this.runtime.runPython(wrappedCode);
    } finally {
      // Clean up temporary module
      this.unregisterJsModule(tempModuleName);
    }
  }

  createAsyncBridge(name: string, asyncFunc: (...args: any[]) => Promise<any>): void {
    const bridge = {
      call: async (...args: any[]) => {
        try {
          return await asyncFunc(...args);
        } catch (error) {
          throw new Error(`Async bridge ${name} error: ${error}`);
        }
      },
      isAsync: true,
      name
    };
    
    this.registerJsModule(name, bridge);
  }

  getModuleInfo(moduleName: string): ModuleInfo | null {
    try {
      const info = this.runtime.runPython(`
import js
module = getattr(js, '${moduleName}', None)
if module:
    info = {
        'name': '${moduleName}',
        'functions': [attr for attr in dir(module) if callable(getattr(module, attr)) and not attr.startswith('_')],
        'properties': [attr for attr in dir(module) if not callable(getattr(module, attr)) and not attr.startswith('_')]
    }
    info
else:
    None
`);
      
      return info ? this.createProxy(info) : null;
    } catch {
      return null;
    }
  }

  inspectPythonFunction(functionName: string): any {
    try {
      return this.runtime.runPython(`
import inspect
func = globals().get('${functionName}')
if func and callable(func):
    {
        'name': '${functionName}',
        'signature': str(inspect.signature(func)),
        'doc': func.__doc__ or 'No documentation available',
        'args': list(inspect.signature(func).parameters.keys())
    }
else:
    None
`);
    } catch {
      return null;
    }
  }
}

