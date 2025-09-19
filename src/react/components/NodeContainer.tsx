import type React from 'react';
import { createContext, useContext } from 'react';
import useSWR from 'swr';
import type { NodeContainer as NodeContainerClass } from '../../node-container.js';
import { bootWebContainer } from '../../node-container.js';

interface NodeContainerContextValue {
  webContainer: NodeContainerClass | null;
  isLoading: boolean;
  error: Error | null;
}

interface NodeContainerProviderProps {
  children: React.ReactNode;
}

const NodeContainerContext = createContext<NodeContainerContextValue | null>(
  null
);

export const useNodeContainer = (): NodeContainerContextValue => {
  const context = useContext(NodeContainerContext);
  if (!context) {
    throw new Error(
      'useNodeContainer must be used within a NodeContainerProvider'
    );
  }
  return context;
};

export const NodeContainerProvider: React.FC<NodeContainerProviderProps> = ({
  children,
}) => {
  const {
    data: webContainer,
    error,
    isLoading,
  } = useSWR('node-runtime', bootWebContainer, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const contextValue: NodeContainerContextValue = {
    webContainer: webContainer || null,
    isLoading,
    error: error || null,
  };

  return (
    <NodeContainerContext.Provider value={contextValue}>
      {children}
    </NodeContainerContext.Provider>
  );
};
