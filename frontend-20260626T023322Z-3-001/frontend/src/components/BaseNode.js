// BaseNode.js
// The single node abstraction that every node type is built on.
//
// A node is described declaratively: a title, an icon, a category (for
// accent color), a list of handles, and a list of fields. BaseNode takes
// care of layout, styling, handle distribution + labels, and field
// rendering — so creating a brand-new node is just a small config object.
// Nodes that need bespoke behavior (e.g. the Text node) can also pass
// custom `children` and compute their handles dynamically.

import { Handle, Position } from 'reactflow';
import { NodeField } from './NodeField';
import './BaseNode.css';

// Which CSS variable holds the accent color for a given category.
const ACCENTS = {
  input: 'var(--vs-cat-input)',
  output: 'var(--vs-cat-output)',
  llm: 'var(--vs-cat-llm)',
  text: 'var(--vs-cat-text)',
  logic: 'var(--vs-cat-logic)',
  data: 'var(--vs-cat-data)',
  integration: 'var(--vs-cat-integration)',
  knowledge: 'var(--vs-cat-knowledge)',
  trigger: 'var(--vs-cat-trigger)',
};

const isVertical = (position) =>
  position === Position.Left || position === Position.Right;

/**
 * Evenly distribute handles that share the same side. A single handle
 * sits at 50%; N handles are spaced at (i+1)/(N+1).
 */
const computeOffset = (index, count) => `${((index + 1) / (count + 1)) * 100}%`;

export const BaseNode = ({
  id,
  data,
  title,
  subtitle,
  icon,
  category = 'integration',
  handles = [],
  fields = [],
  width,
  className = '',
  children,
}) => {
  const accent = ACCENTS[category] || ACCENTS.integration;

  // Group handles per side so we can lay each side out independently.
  const groups = handles.reduce((acc, handle) => {
    const key = handle.position;
    (acc[key] = acc[key] || []).push(handle);
    return acc;
  }, {});

  const style = { '--vs-accent': accent };
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className={`vs-node ${className}`} style={style}>
      {Object.entries(groups).flatMap(([position, group]) =>
        group.map((handle, index) => {
          const offset = handle.offset ?? computeOffset(index, group.length);
          const vertical = isVertical(position);
          const handleStyle = vertical ? { top: offset } : { left: offset };

          return (
            <div key={handle.id}>
              <Handle
                type={handle.type}
                position={position}
                id={handle.id}
                className="vs-handle"
                style={{ ...handleStyle, ...handle.style }}
              />
              {handle.label && vertical && (
                <span
                  className={`vs-handle__label vs-handle__label--${
                    position === Position.Left ? 'left' : 'right'
                  }`}
                  style={{ top: offset }}
                >
                  {handle.label}
                </span>
              )}
            </div>
          );
        })
      )}

      <header className="vs-node__header">
        {icon && <span className="vs-node__icon">{icon}</span>}
        <div className="vs-node__titles">
          <span className="vs-node__title">{title}</span>
          {subtitle && <span className="vs-node__subtitle">{subtitle}</span>}
        </div>
      </header>

      {(fields.length > 0 || children) && (
        <div className="vs-node__body">
          {fields.map((field) => (
            <NodeField
              key={field.name}
              nodeId={id}
              field={field}
              data={data}
            />
          ))}
          {children}
        </div>
      )}
    </div>
  );
};
