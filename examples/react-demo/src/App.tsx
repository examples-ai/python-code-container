import { NodeContainerProvider, PythonContainerProvider } from 'code-container';
import NodeContainerDemo from './components/NodeContainerDemo';
import PythonContainerDemo from './components/PythonContainerDemo';
import PerformanceDemo from './components/PerformanceDemo';
import ContainerStatus from './components/ContainerStatus';

function App() {
  return (
    <NodeContainerProvider>
      <PythonContainerProvider>
        <div className="App">
          <h1>🚀 Code Container React Demo</h1>
          <p>
            This demo showcases the simple React bindings for code-container.
          </p>

          <ContainerStatus />

          <div className="grid">
            <NodeContainerDemo />
            <PythonContainerDemo />
          </div>

          <PerformanceDemo />
        </div>
      </PythonContainerProvider>
    </NodeContainerProvider>
  );
}

export default App;
