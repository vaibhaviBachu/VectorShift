// pipelineIO.js — import / export / server-save helpers for pipelines.

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8001';

/** Download the current pipeline as a JSON file. */
export function exportPipeline(nodes, edges, name = 'pipeline') {
  const payload = JSON.stringify({ name, nodes, edges }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Parse a user-selected JSON file into { nodes, edges }. */
export function importPipelineFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('File is missing nodes/edges arrays.');
        }
        resolve({ nodes: data.nodes, edges: data.edges });
      } catch (err) {
        reject(new Error('Invalid pipeline file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}

/** Persist a named pipeline to the FastAPI backend. */
export async function savePipelineToServer(name, nodes, edges) {
  const res = await fetch(`${API_BASE}/pipelines/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, nodes, edges }),
  });
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  return res.json();
}
