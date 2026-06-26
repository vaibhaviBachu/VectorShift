// ToolbarActions.js — New / Import / Export / Save controls for the toolbar.

import { useRef } from 'react';
import { FiFilePlus, FiUpload, FiDownload, FiSave } from 'react-icons/fi';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import {
  exportPipeline,
  importPipelineFile,
  savePipelineToServer,
} from '../lib/pipelineIO';
import './ToolbarActions.css';

const selector = (s) => ({
  nodes: s.nodes,
  edges: s.edges,
  setGraph: s.setGraph,
  reset: s.reset,
});

export const ToolbarActions = () => {
  const { nodes, edges, setGraph, reset } = useStore(selector, shallow);
  const fileRef = useRef(null);

  const onNew = () => {
    if (nodes.length === 0 || window.confirm('Clear the current pipeline?')) {
      reset();
    }
  };

  const onExport = () => exportPipeline(nodes, edges);

  const onImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const graph = await importPipelineFile(file);
      setGraph(graph.nodes, graph.edges);
    } catch (err) {
      window.alert(err.message);
    } finally {
      event.target.value = '';
    }
  };

  const onSave = async () => {
    const name = window.prompt('Name this pipeline:', 'My pipeline');
    if (!name) return;
    try {
      const saved = await savePipelineToServer(name, nodes, edges);
      window.alert(`Saved "${saved.name}" to the server (id: ${saved.id}).`);
    } catch (err) {
      window.alert('Save failed: ' + err.message);
    }
  };

  return (
    <div className="vs-actions">
      <button className="vs-action" onClick={onNew} title="New pipeline">
        <FiFilePlus />
        <span>New</span>
      </button>
      <button
        className="vs-action"
        onClick={() => fileRef.current?.click()}
        title="Import pipeline JSON"
      >
        <FiUpload />
        <span>Import</span>
      </button>
      <button className="vs-action" onClick={onExport} title="Export pipeline JSON">
        <FiDownload />
        <span>Export</span>
      </button>
      <button
        className="vs-action vs-action--primary"
        onClick={onSave}
        title="Save pipeline to the server"
      >
        <FiSave />
        <span>Save</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={onImport}
        hidden
      />
    </div>
  );
};
