import { useNodeContainer, usePythonContainer } from 'code-container';

const ContainerStatus: React.FC = () => {
  const {
    webContainer,
    isLoading: nodeLoading,
    error: nodeError,
  } = useNodeContainer();
  const {
    pyodide,
    isLoading: pythonLoading,
    error: pythonError,
  } = usePythonContainer();

  const nodeReady = webContainer !== null && !nodeLoading && !nodeError;
  const pythonReady = pyodide !== null && !pythonLoading && !pythonError;

  const containers = [
    {
      type: 'Node.js',
      isReady: nodeReady,
      isLoading: nodeLoading,
      error: nodeError,
    },
    {
      type: 'Python',
      isReady: pythonReady,
      isLoading: pythonLoading,
      error: pythonError,
    },
  ];

  return (
    <div className="card">
      <h3>📊 Container Status</h3>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {containers.map(({ type, isReady, isLoading, error }) => (
          <div key={type} className="container-status">
            <strong>{type}:</strong>
            <span
              style={{
                color: isReady
                  ? '#51cf66'
                  : isLoading
                  ? '#ffd43b'
                  : error
                  ? '#ff6b6b'
                  : '#868e96',
              }}
            >
              {isReady
                ? 'Ready'
                : isLoading
                ? 'Loading...'
                : error
                ? 'Error'
                : 'Not initialized'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContainerStatus;
