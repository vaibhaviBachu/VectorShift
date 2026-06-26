// submit.js
// Footer bar with Run + Submit actions.
//  - Run: simulates execution locally and shows a per-node trace (RunPanel).
//  - Submit: sends nodes + edges to the backend's /pipelines/parse endpoint
//    and surfaces the analysis in a result dialog (Part 4).

import { useState } from 'react';
import { FiSend, FiLoader, FiPlay } from 'react-icons/fi';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { PipelineResult } from './components/PipelineResult';
import { RunPanel } from './components/RunPanel';
import { runPipeline } from './lib/pipelineRunner';
import './submit.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8001';

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [status, setStatus] = useState('idle'); // idle | loading
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(null);

  const handleRun = () => setRun(runPipeline(nodes, edges));

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setResult({ ok: true, ...data });
    } catch (error) {
      setResult({
        ok: false,
        message:
          'Could not reach the backend. Make sure it is running on ' +
          `${API_BASE}.`,
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <footer className="vs-submit">
      <div className="vs-submit__summary">
        <span>
          <strong>{nodes.length}</strong> node{nodes.length === 1 ? '' : 's'}
        </span>
        <span className="vs-submit__dot" />
        <span>
          <strong>{edges.length}</strong> edge{edges.length === 1 ? '' : 's'}
        </span>
      </div>

      <button
        type="button"
        className="vs-submit__button vs-submit__button--ghost"
        onClick={handleRun}
      >
        <FiPlay /> Run
      </button>

      <button
        type="submit"
        className="vs-submit__button"
        onClick={handleSubmit}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <FiLoader className="vs-spin" /> Analyzing…
          </>
        ) : (
          <>
            <FiSend /> Submit Pipeline
          </>
        )}
      </button>

      {result && (
        <PipelineResult result={result} onClose={() => setResult(null)} />
      )}
      {run && <RunPanel run={run} onClose={() => setRun(null)} />}
    </footer>
  );
};
