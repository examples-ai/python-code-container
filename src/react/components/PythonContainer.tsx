import React, { createContext, useContext, useEffect } from 'react';
import useSWR from 'swr';
import { bootPyodide, type PythonContainer } from '../../python-container.js';

interface PythonContainerContextValue {
  pyodide: PythonContainer | null;
  isLoading: boolean;
  error: Error | null;
}

interface PythonContainerProviderProps {
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  children: React.ReactNode;
}

const PythonContainerContext =
  createContext<PythonContainerContextValue | null>(null);

export const usePythonContainer = (): PythonContainerContextValue => {
  const context = useContext(PythonContainerContext);
  if (!context) {
    throw new Error(
      'usePythonContainer must be used within a PythonContainerProvider'
    );
  }
  return context;
};

export const PythonContainerProvider: React.FC<
  PythonContainerProviderProps
> = ({
  src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js',
  strategy = 'beforeInteractive',
  children,
}) => {
  const {
    data: pythonContainer,
    error,
    isLoading,
    mutate,
  } = useSWR('python-runtime', null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const initializePyodide = React.useCallback(async () => {
    try {
      const runtime = await bootPyodide();
      mutate(runtime, false);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to initialize Python container');
      mutate(Promise.reject(error), false);
    }
  }, [mutate]);


  // Load Pyodide script and initialize
  useEffect(() => {
    // Check if Pyodide is already loaded
    if (typeof (globalThis as any).loadPyodide !== 'undefined') {
      initializePyodide();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      const onLoad = () => {
        initializePyodide();
        existingScript.removeEventListener('load', onLoad);
      };
      existingScript.addEventListener('load', onLoad);
      return () => existingScript.removeEventListener('load', onLoad);
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = src;
    script.async = strategy !== 'beforeInteractive';
    script.defer = strategy === 'beforeInteractive';
    script.crossOrigin = 'anonymous';

    const onLoad = () => {
      initializePyodide();
    };

    const onError = () => {
      const error = new Error(`Failed to load script from ${src}`);
      mutate(Promise.reject(error), false);
    };

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [src, strategy, initializePyodide, mutate]);

  const contextValue: PythonContainerContextValue = {
    pyodide: pythonContainer || null,
    isLoading,
    error: error || null,
  };

  return (
    <PythonContainerContext.Provider value={contextValue}>
      {children}
    </PythonContainerContext.Provider>
  );
};
