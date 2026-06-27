// store.js
// Central pipeline state (zustand). Persisted to localStorage so a
// work-in-progress pipeline survives a page refresh.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

const edgeDefaults = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
};

export const useStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},

      getNodeID: (type) => {
        const newIDs = { ...get().nodeIDs };
        if (newIDs[type] === undefined) {
          newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({ nodeIDs: newIDs });
        return `${type}-${newIDs[type]}`;
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        set({ edges: addEdge({ ...connection, ...edgeDefaults }, get().edges) });
      },

      updateNodeField: (nodeId, fieldName, fieldValue) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
              : node
          ),
        });
      },

      // Remove a single node and any edges connected to it.
      removeNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      },

      // Replace the whole graph (used by import / load-from-server).
      setGraph: (nodes = [], edges = []) => {
        // Rebuild the per-type id counters so new nodes keep unique ids.
        const nodeIDs = {};
        for (const node of nodes) {
          const n = parseInt(String(node.id).split('-').pop(), 10);
          if (node.type && !Number.isNaN(n)) {
            nodeIDs[node.type] = Math.max(nodeIDs[node.type] || 0, n);
          }
        }
        set({ nodes, edges, nodeIDs });
      },

      // Clear the canvas for a brand-new pipeline.
      reset: () => set({ nodes: [], edges: [], nodeIDs: {} }),
    }),
    {
      name: 'vectorshift-pipeline',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      }),
    }
  )
);
