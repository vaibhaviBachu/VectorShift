// ui.js
// Displays the drag-and-drop pipeline canvas.
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, NODE_REGISTRY } from './nodes/nodeRegistry';

import 'reactflow/dist/style.css';
import './ui.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

// Category accent hexes (mirrors theme.css) for the minimap.
const CATEGORY_HEX = {
  input: '#10b981',
  output: '#f43f5e',
  llm: '#8b5cf6',
  text: '#f59e0b',
  logic: '#0ea5e9',
  data: '#14b8a6',
  integration: '#6366f1',
  knowledge: '#db2777',
  trigger: '#ea580c',
};
const TYPE_TO_HEX = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.type, CATEGORY_HEX[n.category] || '#6366f1'])
);
const minimapColor = (node) => TYPE_TO_HEX[node.type] || '#6366f1';

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: `${type}` });

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(
          event.dataTransfer.getData('application/reactflow')
        );
        const type = appData?.nodeType;

        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, addNode, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Reject invalid connections: no self-loops, no duplicate edges.
  const isValidConnection = useCallback(
    (connection) => {
      if (connection.source === connection.target) return false;
      const duplicate = edges.some(
        (e) =>
          e.source === connection.source &&
          e.target === connection.target &&
          e.sourceHandle === connection.sourceHandle &&
          e.targetHandle === connection.targetHandle
      );
      return !duplicate;
    },
    [edges]
  );

  return (
    <div ref={reactFlowWrapper} className="vs-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        fitView
      >
        <Background color="var(--vs-bg-grid)" gap={gridSize} variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap nodeColor={minimapColor} nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="vs-canvas__empty">
          <div className="vs-canvas__empty-card">
            <strong>Build your pipeline</strong>
            <span>Drag nodes from the toolbar onto the canvas and connect them.</span>
          </div>
        </div>
      )}
    </div>
  );
};
