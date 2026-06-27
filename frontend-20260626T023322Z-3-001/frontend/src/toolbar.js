// toolbar.js — slim top app bar: brand, an "Add Node" dropdown palette,
// and the pipeline file/theme actions.

import { NodePalette } from './components/NodePalette';
import { ToolbarActions } from './components/ToolbarActions';
import { ThemeToggle } from './components/ThemeToggle';
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

      <NodePalette />

      <div className="vs-toolbar__right">
        <ThemeToggle />
        <ToolbarActions />
      </div>
    </header>
  );
};
