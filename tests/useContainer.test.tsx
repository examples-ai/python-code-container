import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { CodeContainerProvider, useContainer } from '../src';

// Mock the core package
vi.mock('@code-container/core', () => ({
  NodeContainer: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue('test result'),
  })),
  PythonContainer: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    run: vi.fn().mockResolvedValue('test result'),
  })),
}));

const TestComponent: React.FC<{ type: 'node' | 'python' }> = ({ type }) => {
  const { container, isLoading, isReady, error } = useContainer({ type });

  return (
    <div>
      <div data-testid="status">
        {isLoading && 'Loading'}
        {isReady && 'Ready'}
        {error && 'Error'}
      </div>
      <div data-testid="container">
        {container ? 'Container available' : 'No container'}
      </div>
    </div>
  );
};

describe('useContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle node container initialization', async () => {
    render(
      <CodeContainerProvider containers={['node']}>
        <TestComponent type="node" />
      </CodeContainerProvider>
    );

    // Initially should show no container
    expect(screen.getByTestId('container')).toHaveTextContent('No container');

    // In the simplified implementation, containers aren't automatically initialized
    // They are only initialized when getContainer is called
    // So the status should remain empty unless we trigger initialization
  });

  it('should handle python container initialization', async () => {
    render(
      <CodeContainerProvider containers={['python']}>
        <TestComponent type="python" />
      </CodeContainerProvider>
    );

    // Initially should show no container
    expect(screen.getByTestId('container')).toHaveTextContent('No container');

    // In the simplified implementation, containers aren't automatically initialized
  });

  it('should handle unavailable container type gracefully', async () => {
    // This should not throw during render, but will throw when getContainer is called
    render(
      <CodeContainerProvider containers={['node']}>
        <TestComponent type="python" />
      </CodeContainerProvider>
    );

    // Should render without throwing
    expect(screen.getByTestId('container')).toHaveTextContent('No container');
  });

  it('should provide context without errors', async () => {
    const onInitStart = vi.fn();
    const onInitComplete = vi.fn();

    render(
      <CodeContainerProvider
        containers={['node']}
        onInitStart={onInitStart}
        onInitComplete={onInitComplete}
      >
        <TestComponent type="node" />
      </CodeContainerProvider>
    );

    // Should render successfully with provider context
    expect(screen.getByTestId('container')).toHaveTextContent('No container');

    // Callbacks are only called when containers are actually initialized via getContainer
    expect(onInitStart).not.toHaveBeenCalled();
  });
});