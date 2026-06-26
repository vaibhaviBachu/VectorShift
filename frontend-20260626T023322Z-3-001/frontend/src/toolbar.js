// toolbar.js — top app bar with a grouped, draggable node palette.

import { DraggableNode } from './draggableNode';
import { ToolbarActions } from './components/ToolbarActions';
import { ThemeToggle } from './components/ThemeToggle';
import { NODE_GROUPS } from './nodes/nodeRegistry';
import './toolbar.css';

export const PipelineToolbar = () => {
  return (
    <header className="vs-toolbar">
      <div className="vs-toolbar__brand">
        <div className="vs-toolbar__logo">VS</div>
        <div className="vs-toolbar__brand-text">
          <span className="vs-toolbar__title">VectorShift</span>
          <span className="vs-toolbar__subtitle">Pipeline Builder</span>
        </div>
      </div>

      <div className="vs-toolbar__palette">
        {Object.entries(NODE_GROUPS).map(([group, nodes]) => (
          <div className="vs-toolbar__group" key={group}>
            <span className="vs-toolbar__group-label">{group}</span>
            <div className="vs-toolbar__chips">
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

      <div className="vs-toolbar__right">
        <ThemeToggle />
        <ToolbarActions />
      </div>
    </header>
  );
};
