import { WebContainer } from '@webcontainer/api';
import { Middleware, ExecutionContext } from '../utils/index.js';

export class TypeScriptMiddleware implements Middleware<WebContainer> {
  async process(context: ExecutionContext<WebContainer>): Promise<ExecutionContext<WebContainer>> {
    if (!this.isTypeScript(context.filename)) {
      return context;
    }
    
    // Install TypeScript if not already installed
    await this.ensureTypeScriptInstalled(context.runtime);
    
    // Create tsconfig if not exists
    await this.createTsConfigIfNeeded(context.runtime);
    
    // Compile TypeScript
    const compiledCode = await this.compileTypeScript(context);
    
    // Return transformed context for JavaScript execution
    return {
      ...context,
      code: compiledCode,
      filename: context.filename.replace(/\.tsx?$/, '.js'),
      metadata: {
        ...context.metadata,
        originalFilename: context.filename,
        wasTypeScript: true,
        approach: 'compilation'
      }
    };
  }

  private isTypeScript(filename: string): boolean {
    return filename.endsWith('.ts') || filename.endsWith('.tsx');
  }

  private async compileTypeScript(context: ExecutionContext<WebContainer>): Promise<string> {
    const { code, filename, runtime } = context;
    
    await runtime.fs.writeFile(filename, code);
    
    // Try using node directly to run tsc instead of npx
    const compileProcess = await runtime.spawn('node', [
      './node_modules/typescript/bin/tsc',
      filename, 
      '--outDir', 
      'dist', 
      '--target', 
      'ES2020', 
      '--module', 
      'CommonJS'
    ], { output: false });
    
    const exitCode = await compileProcess.exit;
    
    if (exitCode !== 0) {
      throw new Error(`TypeScript compilation failed for ${filename}`);
    }
    
    // Handle nested paths correctly - the compiled JS file should have .js extension
    const baseFileName = filename.split('/').pop()!.replace(/\.tsx?$/, '.js');
    return await runtime.fs.readFile(`dist/${baseFileName}`, 'utf-8');
  }

  private async ensureTypeScriptInstalled(runtime: WebContainer): Promise<void> {
    try {
      // Check if TypeScript is available by checking if the binary exists
      await runtime.fs.readFile('./node_modules/typescript/bin/tsc');
      // If we get here, TypeScript is already installed
    } catch (error) {
      // File doesn't exist, TypeScript is not installed
      await this.installTypeScriptDeps(runtime);
    }
  }

  private async installTypeScriptDeps(runtime: WebContainer): Promise<void> {
    // Disable output to avoid hanging issues like the working installPackage method
    const installProcess = await runtime.spawn('npm', ['install', 'typescript', '@types/node'], { output: false });
    const exitCode = await installProcess.exit;
    
    if (exitCode !== 0) {
      throw new Error('Failed to install TypeScript dependencies');
    }
  }

  private async createTsConfigIfNeeded(runtime: WebContainer): Promise<void> {
    try {
      // Check if tsconfig.json already exists
      await runtime.fs.readFile('tsconfig.json');
      // If we get here, it exists, so don't create a new one
    } catch (error) {
      // File doesn't exist, create it
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

      await runtime.fs.writeFile(
        'tsconfig.json',
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }
}