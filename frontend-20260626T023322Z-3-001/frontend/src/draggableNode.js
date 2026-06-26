// draggableNode.js — a palette chip the user drags onto the canvas.

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

export const DraggableNode = ({ type, label, icon: Icon, category = 'integration' }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`vs-chip ${type}`}
      style={{ '--vs-accent': ACCENTS[category] || ACCENTS.integration }}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      draggable
    >
      {Icon && (
        <span className="vs-chip__icon">
          <Icon />
        </span>
      )}
      <span className="vs-chip__label">{label}</span>
    </div>
  );
};
