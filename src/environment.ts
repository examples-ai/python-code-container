function isBrowser(): boolean {
  return typeof (globalThis as any).window !== 'undefined';
}

function requireBrowser(context: string): void {
  if (!isBrowser()) {
    throw new Error(
      `${context} requires a browser environment. This API only works in browsers.`
    );
  }
}

function getWindow(): any {
  requireBrowser('Window access');
  return (globalThis as any).window;
}

function getDocument(): any {
  requireBrowser('Document access');
  return (globalThis as any).document;
}

// Legacy class-based API for backward compatibility
const Environment = {
  isBrowser,
  requireBrowser,
  getWindow,
  getDocument,
};

export { Environment };
