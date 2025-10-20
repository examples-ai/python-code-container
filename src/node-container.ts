import { type BootOptions, WebContainer } from '@webcontainer/api';
import { runtime } from './utils';

export async function bootWebContainer(
  bootOption?: BootOptions
): Promise<NodeContainer> {
  if (runtime.__NODE_CODE_CONTAINER) {
    return new NodeContainer(runtime.__NODE_CODE_CONTAINER);
  }

  try {
    runtime.__NODE_CODE_CONTAINER = await WebContainer.boot(bootOption);
    return new NodeContainer(runtime.__NODE_CODE_CONTAINER);
  } catch (error) {
    console.log('Error booting WebContainer:', error);
    throw error;
  }
}

export function resetNodeRuntime(): void {
  delete runtime.__NODE_CODE_CONTAINER;
  delete runtime.__NODE_CODE_CONTAINER_PROMISE;
}

// NodeContainer class
export class NodeContainer {
  private webContainer: WebContainer;

  constructor(webContainer: WebContainer) {
    this.webContainer = webContainer;
  }

  async run(
    code: string,
    options: {
      packageJson?: Record<string, any>;
      files?: Record<string, string>;
      filename?: string;
    } = {}
  ): Promise<string> {
    // Set up environment if needed
    if (options.packageJson || options.files) {
      await this.setupNodeEnvironment(options);
    }

    let processedCode = code;
    let filename = options.filename || 'main.js';

    // Handle TypeScript files
    if (this.isTypeScript(filename)) {
      await this.ensureTypeScriptInstalled();
      await this.createTsConfigIfNeeded();
      processedCode = await this.compileTypeScript(code, filename);
      filename = filename.replace(/\\.tsx?$/, '.js');
    }

    // Write and execute the file
    await this.webContainer.fs.writeFile(filename, processedCode);
    const process = await this.webContainer.spawn('node', [filename]);

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
        `Node process exited with code ${exitCode}\\nOutput: ${output}`
      );
    }

    return output;
  }

  async installPackage(
    packageName: string,
    options: {
      packageJson?: Record<string, any>;
      files?: Record<string, string>;
    } = {}
  ): Promise<void> {
    // Set up environment if needed
    if (options.packageJson || options.files) {
      await this.setupNodeEnvironment(options);
    }

    const process = await this.webContainer.spawn('npm', [
      'install',
      packageName,
    ]);
    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(`Failed to install package: ${packageName}`);
    }
  }

  async readFile(
    path: string,
    options: {
      packageJson?: Record<string, any>;
      files?: Record<string, string>;
    } = {}
  ): Promise<string> {
    // Set up environment if needed
    if (options.packageJson || options.files) {
      await this.setupNodeEnvironment(options);
    }

    return await this.webContainer.fs.readFile(path, 'utf-8');
  }

  async writeFile(
    path: string,
    content: string | Uint8Array,
    options: {
      packageJson?: Record<string, any>;
      files?: Record<string, string>;
    } = {}
  ): Promise<void> {
    // Set up environment if needed
    if (options.packageJson || options.files) {
      await this.setupNodeEnvironment(options);
    }

    await this.webContainer.fs.writeFile(path, content);
  }

  // Private helper methods
  private async setupNodeEnvironment(options: {
    packageJson?: Record<string, any>;
    files?: Record<string, string>;
  }): Promise<void> {
    const files: Record<string, any> = {};

    // Setup package.json
    if (options.packageJson) {
      files['package.json'] = {
        file: {
          contents: JSON.stringify(
            {
              name: 'container-project',
              type: 'module',
              dependencies: {},
              ...options.packageJson,
            },
            null,
            2
          ),
        },
      };
    }

    // Setup additional files
    if (options.files) {
      Object.entries(options.files).forEach(([path, content]) => {
        files[path] = {
          file: { contents: content },
        };
      });
    }

    if (Object.keys(files).length > 0) {
      await this.webContainer.mount(files);
    }
  }

  private isTypeScript(filename: string): boolean {
    return filename.endsWith('.ts') || filename.endsWith('.tsx');
  }

  private async ensureTypeScriptInstalled(): Promise<void> {
    try {
      await this.webContainer.fs.readFile('./node_modules/typescript/bin/tsc');
    } catch (_error) {
      await this.installTypeScriptDeps();
    }
  }

  private async installTypeScriptDeps(): Promise<void> {
    const installProcess = await this.webContainer.spawn(
      'npm',
      ['install', 'typescript', '@types/node'],
      { output: false }
    );
    const exitCode = await installProcess.exit;

    if (exitCode !== 0) {
      throw new Error('Failed to install TypeScript dependencies');
    }
  }

  private async createTsConfigIfNeeded(): Promise<void> {
    try {
      await this.webContainer.fs.readFile('tsconfig.json');
    } catch (_error) {
      const defaultConfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'CommonJS',
          outDir: './dist',
          rootDir: './',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node',
        },
        include: ['*.ts'],
        exclude: ['node_modules', 'dist'],
      };

      await this.webContainer.fs.writeFile(
        'tsconfig.json',
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }

  private async compileTypeScript(
    code: string,
    filename: string
  ): Promise<string> {
    await this.webContainer.fs.writeFile(filename, code);

    const compileProcess = await this.webContainer.spawn(
      'node',
      [
        './node_modules/typescript/bin/tsc',
        filename,
        '--outDir',
        'dist',
        '--target',
        'ES2020',
        '--module',
        'CommonJS',
      ],
      { output: false }
    );

    const exitCode = await compileProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`TypeScript compilation failed for ${filename}`);
    }

    const baseFileName = filename
      .split('/')
      .pop()
      ?.replace(/\\.tsx?$/, '.js');
    return await this.webContainer.fs.readFile(`dist/${baseFileName}`, 'utf-8');
  }
}
