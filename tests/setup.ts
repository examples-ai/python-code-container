import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
  },
});

// Mock requestIdleCallback
Object.defineProperty(window, 'requestIdleCallback', {
  value: (callback: () => void) => setTimeout(callback, 0),
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: () => {},
  error: () => {},
};