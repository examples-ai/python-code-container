import React, { useState } from 'react'
import { usePythonContainer } from 'code-container'

const PythonContainerDemo: React.FC = () => {
  const { pyodide, isLoading, error } = usePythonContainer()
  const isReady = pyodide !== null && !isLoading && !error
  const [code, setCode] = useState(`print("Hello from Python!")

# Try some Python features
import sys
import os
import json

print(f"Python version: {sys.version}")
print(f"Platform: {sys.platform}")

# Working with data
data = {"message": "Hello World", "numbers": [1, 2, 3, 4, 5]}
print(f"Data: {json.dumps(data, indent=2)}")

# Simple calculation
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
average = total / len(numbers)
print(f"Sum: {total}, Average: {average}")`)
  const [output, setOutput] = useState('')

  const handleExecute = async () => {
    if (!isReady || !pyodide) return;

    setOutput('Executing...')
    try {
      const result = await pyodide.run(code)
      setOutput(result)
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="card">
      <h3>🐍 Python Container</h3>

      <div className="container-status">
        <span>Status:</span>
        <span className={
          isReady ? 'success' :
          isLoading ? '' :
          error ? 'error' : ''
        }>
          {isReady ? 'Ready' : isLoading ? 'Loading...' : error ? 'Error' : 'Not initialized'}
        </span>
      </div>

      {error && (
        <div className="output error">
          {error.message}
        </div>
      )}

      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter Python code here..."
        rows={10}
      />

      <button
        onClick={handleExecute}
        disabled={!isReady}
      >
        Execute Python Code
      </button>

      {output && (
        <div className={`output ${output.startsWith('Error:') ? 'error' : ''}`}>
          {output}
        </div>
      )}
    </div>
  )
}

export default PythonContainerDemo