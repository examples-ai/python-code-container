export interface PythonGlobalsInterface {
  globals: {
    get(name: string): any;
    set(name: string, value: any): void;
  };
  toPy(obj: any): any;
  runPython(code: string): any;
}

export interface GlobalVariable {
  name: string;
  type: string;
  value: any;
}

export class PythonGlobalsExtension {
  constructor(private runtime: PythonGlobalsInterface) {}

  getGlobal(name: string): any {
    return this.runtime.globals.get(name);
  }

  setGlobal(name: string, value: any): void {
    this.runtime.globals.set(name, value);
  }

  toPython(obj: any): any {
    return this.runtime.toPy(obj);
  }

  listGlobals(): string[] {
    try {
      const globals = this.runtime.runPython(`
import builtins
[name for name in dir() if not name.startswith('_') and name not in dir(builtins)]
`);
      return globals.toJs ? globals.toJs() : globals;
    } catch {
      return [];
    }
  }

  getGlobalDetails(name: string): GlobalVariable | null {
    try {
      const value = this.getGlobal(name);
      if (value === undefined) return null;
      
      const typeInfo = this.runtime.runPython(`
import sys
value = globals().get('${name}')
if value is not None:
    type(value).__name__
else:
    'undefined'
`);
      
      return {
        name,
        type: typeInfo.toString(),
        value: value
      };
    } catch {
      return null;
    }
  }

  getAllGlobalDetails(): GlobalVariable[] {
    const names = this.listGlobals();
    return names
      .map(name => this.getGlobalDetails(name))
      .filter((detail): detail is GlobalVariable => detail !== null);
  }

  deleteGlobal(name: string): boolean {
    try {
      this.runtime.runPython(`
if '${name}' in globals():
    del globals()['${name}']
`);
      return true;
    } catch {
      return false;
    }
  }

  hasGlobal(name: string): boolean {
    try {
      const value = this.getGlobal(name);
      return value !== undefined;
    } catch {
      return false;
    }
  }

  copyGlobal(sourceName: string, destName: string): boolean {
    try {
      const value = this.getGlobal(sourceName);
      if (value !== undefined) {
        this.setGlobal(destName, value);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  setGlobals(variables: Record<string, any>): void {
    for (const [name, value] of Object.entries(variables)) {
      this.setGlobal(name, value);
    }
  }

  getGlobals(names: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const name of names) {
      const value = this.getGlobal(name);
      if (value !== undefined) {
        result[name] = value;
      }
    }
    return result;
  }
}

