// RunPanel.js — slide-in panel showing the result of a simulated run.

import { FiX, FiAlertTriangle, FiArrowRight, FiPlay } from 'react-icons/fi';
import { NODE_REGISTRY } from '../nodes/nodeRegistry';
import './RunPanel.css';

const META = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.type, { label: n.label, category: n.category }])
);

export const RunPanel = ({ run, onClose }) => {
  if (!run) return null;

  return (
    <aside className="vs-run">
      <header className="vs-run__header">
        <div className="vs-run__title">
          <FiPlay />
          <span>Pipeline run</span>
        </div>
        <button className="vs-run__close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
      </header>

      {run.ok ? (
        <>
          <p className="vs-run__subtitle">
            Executed {run.steps.length} node(s) in topological order.
          </p>
          <ol className="vs-run__steps">
            {run.steps.map((step, i) => {
              const meta = META[step.type] || { label: step.type, category: 'integration' };
              return (
                <li className="vs-run__step" key={step.nodeId}>
                  <div
                    className="vs-run__badge"
                    style={{ '--vs-accent': `var(--vs-cat-${meta.category})` }}
                  >
                    {i + 1}
                  </div>
                  <div className="vs-run__step-body">
                    <div className="vs-run__step-head">
                      <strong>{meta.label}</strong>
                      <code className="vs-run__id">{step.nodeId}</code>
                    </div>
                    {step.inputs.length > 0 && (
                      <div className="vs-run__inputs">
                        {step.inputs.map((inp, idx) => (
                          <span className="vs-run__chip" key={idx}>
                            {inp.port || 'in'}: {String(inp.value)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="vs-run__output">
                      <FiArrowRight />
                      <span>{step.output}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className="vs-run__error">
          <FiAlertTriangle />
          <p>{run.error}</p>
        </div>
      )}
    </aside>
  );
};
