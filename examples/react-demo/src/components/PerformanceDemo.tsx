import React, { useState, useEffect } from 'react'
import { useNodeContainer, usePythonContainer } from 'code-container'

const PerformanceDemo: React.FC = () => {
  const [measurements, setMeasurements] = useState<{
    start: number
    end?: number
    duration?: number
  }>({} as any)

  const { webContainer, isLoading: nodeLoading, error: nodeError } = useNodeContainer()
  const { pyodide, isLoading: pythonLoading, error: pythonError } = usePythonContainer()
  const nodeReady = webContainer !== null && !nodeLoading && !nodeError
  const pythonReady = pyodide !== null && !pythonLoading && !pythonError

  const measureExecution = async (type: 'node' | 'python') => {
    const code = type === 'node'
      ? 'console.log("Performance test from Node.js")'
      : 'print("Performance test from Python")'

    const start = performance.now()
    setMeasurements({ start })

    try {
      if (type === 'node' && webContainer) {
        await webContainer.run(code)
      } else if (type === 'python' && pyodide) {
        await pyodide.run(code)
      }
      const end = performance.now()
      const duration = end - start
      setMeasurements({ start, end, duration })
    } catch (error) {
      const end = performance.now()
      const duration = end - start
      setMeasurements({ start, end, duration })
    }
  }

  return (
    <div className="card">
      <h3>⚡ Performance Metrics</h3>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div>
          <h4>Container Status</h4>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Node.js:</strong> {
              nodeReady ? 'Ready' : nodeLoading ? 'Initializing...' : 'Not initialized'
            }
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Python:</strong> {
              pythonReady ? 'Ready' : pythonLoading ? 'Initializing...' : 'Not initialized'
            }
          </div>
        </div>

        <div>
          <h4>Execution Performance</h4>
          <button
            onClick={() => measureExecution('node')}
            disabled={!nodeReady}
          >
            Test Node.js Execution
          </button>
          <button
            onClick={() => measureExecution('python')}
            disabled={!pythonReady}
          >
            Test Python Execution
          </button>

          {measurements.duration && (
            <div style={{ marginTop: '1rem' }}>
              <div>Last execution: {measurements.duration.toFixed(2)}ms</div>
              <div style={{ fontSize: '0.8em', color: '#868e96' }}>
                Started: {new Date(measurements.start).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        <div>
          <h4>Memory Usage</h4>
          <div style={{ fontSize: '0.9em' }}>
            {(performance as any).memory ? (
              <div>
                <div>Used: {((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                <div>Total: {((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                <div>Limit: {((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div>Memory info not available</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4>Container States</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.5rem',
              border: '1px solid #333',
              borderRadius: '4px',
              minWidth: '150px'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Node.js</div>
            <div style={{
              color: nodeReady ? '#51cf66' : nodeLoading ? '#ffd43b' : '#868e96'
            }}>
              {nodeReady ? 'Ready' : nodeLoading ? 'Loading...' : 'Not initialized'}
            </div>
          </div>
          <div
            style={{
              padding: '0.5rem',
              border: '1px solid #333',
              borderRadius: '4px',
              minWidth: '150px'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>Python</div>
            <div style={{
              color: pythonReady ? '#51cf66' : pythonLoading ? '#ffd43b' : '#868e96'
            }}>
              {pythonReady ? 'Ready' : pythonLoading ? 'Loading...' : 'Not initialized'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDemo