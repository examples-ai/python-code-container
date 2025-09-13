class Environment {
  static isBrowser(): boolean {
    return typeof (globalThis as any).window !== 'undefined';
  }

  static requireBrowser(context: string): void {
    if (!Environment.isBrowser()) {
      throw new Error(`${context} requires a browser environment. This API only works in browsers.`);
    }
  }

  static getWindow(): any {
    Environment.requireBrowser('Window access');
    return (globalThis as any).window;
  }

  static getDocument(): any {
    Environment.requireBrowser('Document access');
    return (globalThis as any).document;
  }
}

export { Environment };