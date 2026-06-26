// NodeField.js
// Declarative form-control renderer used inside every node.
// A node simply describes its fields as data; NodeField turns that
// description into a controlled input wired to the global store, so
// field values live in the pipeline state and are available at submit.

import { useEffect } from 'react';
import { useStore } from '../store';
import './NodeField.css';

/**
 * Resolve a field's default value. Defaults may be a plain value or a
 * function of (id, data) so that nodes can derive things like names.
 */
export const resolveDefault = (field, id, data) => {
  const { default: def } = field;
  return typeof def === 'function' ? def(id, data) : def ?? '';
};

const normalizeOptions = (options = []) =>
  options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

export const NodeField = ({ nodeId, field, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const value = data?.[field.name];

  // Seed the store with the field's default on mount so downstream
  // consumers (e.g. the backend submit) always see a value.
  useEffect(() => {
    if (value === undefined) {
      updateNodeField(nodeId, field.name, resolveDefault(field, nodeId, data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = value ?? resolveDefault(field, nodeId, data);

  const onChange = (next) => updateNodeField(nodeId, field.name, next);

  const controlId = `${nodeId}-${field.name}`;

  const renderControl = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            id={controlId}
            className="vs-field__control"
            value={current}
            onChange={(e) => onChange(e.target.value)}
          >
            {normalizeOptions(field.options).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            id={controlId}
            className="vs-field__control vs-field__control--area"
            value={current}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            id={controlId}
            type="number"
            className="vs-field__control"
            value={current}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'checkbox':
        return (
          <label className="vs-field__switch">
            <input
              id={controlId}
              type="checkbox"
              checked={Boolean(current)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="vs-field__switch-track" />
          </label>
        );
      case 'text':
      default:
        return (
          <input
            id={controlId}
            type="text"
            className="vs-field__control"
            value={current}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div
      className={`vs-field ${
        field.type === 'checkbox' ? 'vs-field--inline' : ''
      }`}
    >
      {field.label && (
        <label className="vs-field__label" htmlFor={controlId}>
          {field.label}
        </label>
      )}
      {renderControl()}
    </div>
  );
};
