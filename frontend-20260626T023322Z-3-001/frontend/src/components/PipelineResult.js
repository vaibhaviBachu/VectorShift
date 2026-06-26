// PipelineResult.js
// User-friendly dialog summarizing the backend's pipeline analysis.

import { FiX, FiCheckCircle, FiAlertTriangle, FiBox, FiShare2 } from 'react-icons/fi';
import './PipelineResult.css';

export const PipelineResult = ({ result, onClose }) => {
  const isError = result.ok === false;

  return (
    <div className="vs-result__overlay" onClick={onClose}>
      <div
        className="vs-result"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="vs-result__close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        {isError ? (
          <div className="vs-result__error">
            <FiAlertTriangle className="vs-result__error-icon" />
            <h3>Submission failed</h3>
            <p>{result.message}</p>
          </div>
        ) : (
          <>
            <div className="vs-result__header">
              <h3>Pipeline analyzed</h3>
              <p>Here's a summary of your pipeline.</p>
            </div>

            <div className="vs-result__stats">
              <div className="vs-result__stat">
                <FiBox className="vs-result__stat-icon" />
                <span className="vs-result__stat-value">{result.num_nodes}</span>
                <span className="vs-result__stat-label">Nodes</span>
              </div>
              <div className="vs-result__stat">
                <FiShare2 className="vs-result__stat-icon" />
                <span className="vs-result__stat-value">{result.num_edges}</span>
                <span className="vs-result__stat-label">Edges</span>
              </div>
            </div>

            <div
              className={`vs-result__dag ${
                result.is_dag ? 'is-valid' : 'is-invalid'
              }`}
            >
              {result.is_dag ? <FiCheckCircle /> : <FiAlertTriangle />}
              <div>
                <strong>
                  {result.is_dag ? 'Valid DAG' : 'Not a DAG'}
                </strong>
                <span>
                  {result.is_dag
                    ? 'This pipeline is a directed acyclic graph — no cycles detected.'
                    : 'This pipeline contains a cycle, so it is not a directed acyclic graph.'}
                </span>
              </div>
            </div>

            {result.analysis && (
              <div className="vs-result__insights">
                {!result.is_dag && result.analysis.cycle?.length > 0 && (
                  <div className="vs-result__cycle">
                    <span className="vs-result__insight-label">Cycle</span>
                    <code>{result.analysis.cycle.join(' → ')} → …</code>
                  </div>
                )}
                <div className="vs-result__metrics">
                  <span>
                    <strong>{result.analysis.longest_chain}</strong> longest chain
                  </span>
                  <span>
                    <strong>{result.analysis.entry_nodes.length}</strong> entry
                  </span>
                  <span>
                    <strong>{result.analysis.exit_nodes.length}</strong> exit
                  </span>
                  {result.analysis.orphan_nodes.length > 0 && (
                    <span className="is-warn">
                      <strong>{result.analysis.orphan_nodes.length}</strong> orphan
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <button className="vs-result__ok" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};
