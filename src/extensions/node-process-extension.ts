import { WebContainer } from '@webcontainer/api';

export interface ProcessResult {
  stdout: string;
  exitCode: number;
}

export interface NodeProcessInterface {
  spawn(command: string, args: string[]): Promise<{
    output: ReadableStream;
    exit: Promise<number>;
  }>;
}

export class NodeProcessExtension {
  constructor(private runtime: NodeProcessInterface) {}

  async runScript(script: string): Promise<string> {
    const process = await this.runtime.spawn('npm', ['run', script]);
    
    let stdout = '';
    process.output.pipeTo(new WritableStream({
      write(data) { stdout += data; }
    }));

    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(`Script '${script}' exited with code ${exitCode}`);
    }
    
    return stdout;
  }

  async spawn(command: string, args: string[]): Promise<ProcessResult> {
    const process = await this.runtime.spawn(command, args);
    
    let stdout = '';
    process.output.pipeTo(new WritableStream({
      write(data) { stdout += data; }
    }));

    const exitCode = await process.exit;
    return { stdout, exitCode };
  }

  async installPackage(packageName: string): Promise<void> {
    const result = await this.spawn('npm', ['install', packageName]);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to install package: ${packageName}\n${result.stdout}`);
    }
  }

  async runCommand(command: string, args: string[] = []): Promise<ProcessResult> {
    return await this.spawn(command, args);
  }

  async checkPackageInstalled(packageName: string): Promise<boolean> {
    try {
      const result = await this.spawn('npm', ['list', packageName]);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
}

