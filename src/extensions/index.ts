// Extension classes
export { NodeProcessExtension } from './node-process-extension.js';
export { PythonFileSystemExtension } from './python-filesystem-extension.js';
export { PythonGlobalsExtension } from './python-globals-extension.js';
export { PythonInteropExtension } from './python-interop-extension.js';

// Extension interfaces
export type { 
  NodeProcessInterface,
  ProcessResult 
} from './node-process-extension.js';

export type { 
  PythonFileSystemInterface,
  FileStats 
} from './python-filesystem-extension.js';

export type { 
  PythonGlobalsInterface,
  GlobalVariable 
} from './python-globals-extension.js';

export type { 
  PythonInteropInterface,
  ModuleInfo 
} from './python-interop-extension.js';