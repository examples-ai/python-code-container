
export interface Middleware<TRuntime> {
  process(context: ExecutionContext<TRuntime>): Promise<ExecutionContext<TRuntime>>;
}

export interface ExecutionContext<TRuntime> {
  code: string;
  filename: string;
  runtime: TRuntime;
  metadata: Record<string, any>;
}

export abstract class Container<TOptions, TRuntime> {
  protected options: Required<TOptions>;
  protected runtime: TRuntime | null = null;
  protected lastError: Error | null = null;
  protected isDestroyed = false;
  protected isCreated = false;
  protected middlewares: Middleware<TRuntime>[] = [];
  private static instances = new Map<string, any>();
  private static referenceCounts = new Map<string, number>();
  private static loadingStates = new Map<string, boolean>();
  private static loadPromises = new Map<string, Promise<any>>();

  constructor(options: TOptions, defaults: Required<TOptions>) {
    this.options = { ...defaults, ...options };
  }

  protected abstract validateEnvironment(): void;
  protected abstract createInstance(): Promise<TRuntime>;
  protected abstract destroyInstance(instance: TRuntime): Promise<void>;
  protected abstract initializeRuntime(): Promise<void>;

  // Get container name using constructor name
  protected getContainerName(): string {
    return this.constructor.name;
  }

  // Add middleware to the execution pipeline
  use(middleware: Middleware<TRuntime>): this {
    this.middlewares.push(middleware);
    return this;
  }

  // Execute code with middleware pipeline
  protected async runWithMiddlewares(code: string, filename: string): Promise<any> {
    let context: ExecutionContext<TRuntime> = {
      code,
      filename,
      runtime: this.getRuntime(),
      metadata: {}
    };

    // Run middlewares in order (no sorting)
    for (const middleware of this.middlewares) {
      context = await middleware.process(context);
    }

    // Execute main logic with transformed context
    return await this.executeCode(context);
  }

  // Abstract method for executing code - to be implemented by subclasses
  protected abstract executeCode(context: ExecutionContext<TRuntime>): Promise<any>;

  protected async acquireRuntime(): Promise<TRuntime> {
    this.validateEnvironment();
    const instanceKey = this.getContainerName();

    // Increment reference count
    const currentCount = Container.referenceCounts.get(instanceKey) || 0;
    Container.referenceCounts.set(instanceKey, currentCount + 1);

    // Return existing instance
    if (Container.instances.has(instanceKey)) {
      const instance = Container.instances.get(instanceKey);
      return instance;
    }

    // Wait for existing load
    if (
      Container.loadingStates.get(instanceKey) &&
      Container.loadPromises.has(instanceKey)
    ) {
      return await Container.loadPromises.get(instanceKey);
    }

    // Start loading
    Container.loadingStates.set(instanceKey, true);
    const loadPromise = this.createInstance();
    Container.loadPromises.set(instanceKey, loadPromise);

    try {
      const instance = await loadPromise;
      Container.instances.set(instanceKey, instance);
      Container.loadingStates.set(instanceKey, false);
      return instance;
    } catch (error) {
      Container.loadingStates.set(instanceKey, false);
      Container.loadPromises.delete(instanceKey);
      const currentCount = Container.referenceCounts.get(instanceKey) || 0;
      Container.referenceCounts.set(instanceKey, Math.max(0, currentCount - 1));
      throw error;
    }
  }

  protected async releaseRuntime(): Promise<void> {
    const instanceKey = this.getContainerName();
    const currentCount = Container.referenceCounts.get(instanceKey) || 0;

    if (currentCount <= 0) {
      return;
    }

    const newCount = currentCount - 1;
    Container.referenceCounts.set(instanceKey, newCount);

    // Destroy when no references remain
    if (newCount === 0 && Container.instances.has(instanceKey)) {
      const instance = Container.instances.get(instanceKey);
      try {
        await this.destroyInstance(instance);
        Container.instances.delete(instanceKey);
        Container.loadPromises.delete(instanceKey);
      } catch (error) {
        throw error;
      }
    }
  }

  // For testing - reset all static state
  protected async reset(): Promise<void> {
    const containerName = this.getContainerName();

    if (Container.instances.has(containerName)) {
      const instance = Container.instances.get(containerName);
      try {
        await this.destroyInstance(instance);
      } catch (error) {}
    }

    Container.instances.delete(containerName);
    Container.referenceCounts.set(containerName, 0);
    Container.loadingStates.set(containerName, false);
    Container.loadPromises.delete(containerName);

    this.runtime = null;
    this.isCreated = false;
    this.isDestroyed = false;
  }

  async create(): Promise<void> {
    try {
      if (this.isDestroyed) {
        throw new Error(`${this.getContainerName()} has been destroyed`);
      }

      if (this.isCreated) {
        return;
      }

      this.runtime = await this.acquireRuntime();
      await this.initializeRuntime();
      this.isCreated = true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      if (this.isCreated && this.runtime) {
        await this.releaseRuntime();
        this.runtime = null;
      }
      this.isDestroyed = true;
      this.isCreated = false;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  protected getRuntime(): TRuntime {
    if (!this.runtime) {
      throw new Error(
        `${this.getContainerName()} not created. Call create() first.`
      );
    }
    if (this.isDestroyed) {
      throw new Error(`${this.getContainerName()} has been destroyed`);
    }
    return this.runtime;
  }

  protected handleError(error: unknown): Error {
    const err = error instanceof Error ? error : new Error(String(error));
    this.lastError = err;
    return err;
  }
}
