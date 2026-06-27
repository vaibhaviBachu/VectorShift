// NodePalette.js — compact "Add Node" dropdown holding the draggable
// node palette, so the toolbar stays a single slim row. Nodes are dragged
// straight from the open menu onto the canvas.

import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiChevronDown } from 'react-icons/fi';
import { DraggableNode } from '../draggableNode';
import { NODE_GROUPS } from '../nodes/nodeRegistry';
import './NodePalette.css';

export const NodePalette = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="vs-palette" ref={ref}>
      <button
        className={`vs-palette__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <FiPlus />
        <span>Add Node</span>
        <FiChevronDown className="vs-palette__chev" />
      </button>

      {open && (
        // Close once a node has been dragged out and dropped.
        <div className="vs-palette__menu" onDragEnd={() => setOpen(false)}>
          {Object.entries(NODE_GROUPS).map(([group, nodes]) => (
            <div className="vs-palette__group" key={group}>
              <span className="vs-palette__group-label">{group}</span>
              <div className="vs-palette__chips">
                {nodes.map((node) => (
                  <DraggableNode
                    key={node.type}
                    type={node.type}
                    label={node.label}
                    icon={node.icon}
                    category={node.category}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
