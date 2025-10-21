import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { PythonContainer } from '@examples-ai/python-code-container';

const defaultCode = `# Python Example
print('Hello from Python!')
print('Result:', 2 + 2)

# Try some code
for i in range(3):
    print('Iteration:', i)`;

let editorView: EditorView | null = null;
let pyodide: any = null;

// Strip ANSI escape codes
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// Add log to console
function addLog(message: string, type: 'log' | 'error' | 'info' = 'log') {
  const consoleOutput = document.getElementById('console-output')!;

  // Remove empty message if present
  const emptyMsg = consoleOutput.querySelector('.empty-console');
  if (emptyMsg) {
    emptyMsg.remove();
  }

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;

  const time = new Date().toLocaleTimeString();
  logEntry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-type">[${type}]</span>
    <span class="log-message">${stripAnsi(message)}</span>
  `;

  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Clear console
function clearConsole() {
  const consoleOutput = document.getElementById('console-output')!;
  consoleOutput.innerHTML =
    '<div class="empty-console">Console is empty. Run some code to see output here.</div>';
}

// Initialize editor
function initEditor() {
  const editorContainer = document.getElementById('editor-container')!;

  // Destroy existing editor
  if (editorView) {
    editorView.destroy();
  }

  const state = EditorState.create({
    doc: defaultCode,
    extensions: [basicSetup, python(), oneDark, EditorView.lineWrapping],
  });

  editorView = new EditorView({
    state,
    parent: editorContainer,
  });
}

// Run code
async function runCode() {
  if (!editorView) return;

  const code = editorView.state.doc.toString();
  addLog('Running Python code...', 'info');

  try {
    if (!pyodide) {
      addLog('Container is not ready. Please wait...', 'error');
      return;
    }

    const result = await pyodide.run(code);
    if (result) {
      result.split('\n').forEach((line: string) => {
        if (line.trim()) addLog(line, 'log');
      });
    }

    addLog('Execution completed', 'info');
  } catch (error: any) {
    addLog(`Execution failed: ${error.message || error}`, 'error');
  }
}

// Initialize containers
async function initContainers() {
  addLog('Initializing Python container...', 'info');
  try {
    const container = await PythonContainer.boot();
    pyodide = container;
    addLog('Python container ready!', 'info');
  } catch (error: any) {
    addLog(`Failed to initialize container: ${error.message}`, 'error');
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  initContainers();

  // Event listeners
  document.getElementById('run-btn')!.addEventListener('click', runCode);
  document.getElementById('clear-btn')!.addEventListener('click', clearConsole);
});
