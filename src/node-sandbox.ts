import { WebContainer } from '@webcontainer/api';
import { Sandbox, Environment, ExecutionContext } from './utils/index.js';

export interface NodeSandboxOptions {
  packageJson?: Record<string, any>;
  files?: Record<string, string>;
}

type NodeSandboxDefaults = Required<NodeSandboxOptions>;

export class NodeSandbox extends Sandbox<NodeSandboxOptions, WebContainer> {
  constructor(options: NodeSandboxOptions = {}) {
    const defaults: NodeSandboxDefaults = {
      packageJson: {},
      files: {},
    };
    super(options, defaults);
  }

  protected validateEnvironment(): void {
    Environment.requireBrowser('WebContainer');
  }

  protected async createInstance(): Promise<WebContainer> {
    return await WebContainer.boot();
  }

  protected async destroyInstance(instance: WebContainer): Promise<void> {
    await instance.teardown();
  }

  protected async initializeRuntime(): Promise<void> {
    const webcontainer = this.getRuntime();

    const files: Record<string, any> = {
      'package.json': {
        file: {
          contents: JSON.stringify(
            {
              name: 'sandbox-project',
              type: 'module',
              dependencies: {},
              ...this.options.packageJson,
            },
            null,
            2
          ),
        },
      },
    };

    Object.entries(this.options.files).forEach(([path, content]) => {
      files[path] = {
        file: { contents: content },
      };
    });

    await webcontainer.mount(files);
  }

  async run(code: string, filename = 'main.js'): Promise<any> {
    return this.runWithMiddlewares(code, filename);
  }

  protected async executeCode(context: ExecutionContext<WebContainer>): Promise<any> {
    const { code, filename, runtime } = context;

    await runtime.fs.writeFile(filename, code);
    const process = await runtime.spawn('node', [filename]);

    let output = '';

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(
        `Node process exited with code ${exitCode}\nOutput: ${output}`
      );
    }

    return output;
  }

  async installPackage(packageName: string): Promise<void> {
    const webcontainer = this.getRuntime();
    const process = await webcontainer.spawn('npm', ['install', packageName]);
    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(`Failed to install package: ${packageName}`);
    }
  }

  async readFile(path: string): Promise<string> {
    const webcontainer = this.getRuntime();
    return await webcontainer.fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    const webcontainer = this.getRuntime();
    await webcontainer.fs.writeFile(path, content);
  }

}

export default NodeSandbox;
