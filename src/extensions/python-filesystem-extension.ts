export interface PythonFileSystemInterface {
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, options?: { encoding?: string }): string | Uint8Array;
    mkdir(path: string): void;
    rmdir(path: string): void;
    unlink(path: string): void;
    readdir(path: string): string[];
  };
}

export interface FileStats {
  exists: boolean;
  isDirectory: boolean;
  isFile: boolean;
  size?: number;
}

export class PythonFileSystemExtension {
  constructor(private runtime: PythonFileSystemInterface) {}

  mkdir(path: string): void {
    this.runtime.FS.mkdir(path);
  }

  listDir(path: string = '.'): string[] {
    return this.runtime.FS.readdir(path);
  }

  removeFile(path: string): void {
    this.runtime.FS.unlink(path);
  }

  removeDir(path: string): void {
    this.runtime.FS.rmdir(path);
  }

  exists(path: string): boolean {
    try {
      this.runtime.FS.readdir(path);
      return true;
    } catch {
      try {
        this.runtime.FS.readFile(path);
        return true;
      } catch {
        return false;
      }
    }
  }

  readFile(path: string, encoding: string = 'utf8'): string | Uint8Array {
    return this.runtime.FS.readFile(path, { 
      encoding: encoding === 'binary' ? undefined : encoding 
    });
  }

  writeFile(path: string, content: string | Uint8Array): void {
    this.runtime.FS.writeFile(path, content);
  }

  getStats(path: string): FileStats {
    try {
      // Try to read as directory
      this.runtime.FS.readdir(path);
      return {
        exists: true,
        isDirectory: true,
        isFile: false
      };
    } catch {
      try {
        // Try to read as file
        const content = this.runtime.FS.readFile(path);
        return {
          exists: true,
          isDirectory: false,
          isFile: true,
          size: content instanceof Uint8Array ? content.length : content.length
        };
      } catch {
        return {
          exists: false,
          isDirectory: false,
          isFile: false
        };
      }
    }
  }

  createPath(path: string): void {
    const parts = path.split('/');
    let currentPath = '';
    
    for (const part of parts) {
      if (!part) continue;
      currentPath += '/' + part;
      
      if (!this.exists(currentPath)) {
        this.mkdir(currentPath);
      }
    }
  }

  copyFile(sourcePath: string, destPath: string): void {
    const content = this.readFile(sourcePath, 'binary');
    this.writeFile(destPath, content);
  }

  moveFile(sourcePath: string, destPath: string): void {
    this.copyFile(sourcePath, destPath);
    this.removeFile(sourcePath);
  }
}

