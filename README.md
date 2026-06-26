# VectorShift — Pipeline Builder

A visual, node-based **AI pipeline builder** — a polished take on VectorShift's
core product. Drag nodes onto a canvas, wire them together, validate the graph,
and run it. Built with **React + ReactFlow** on the frontend and **FastAPI** on
the backend.

This was built for the VectorShift frontend technical assessment, then extended
well past the four required parts into a product-grade slice of the real thing.

---

## Quick start

Two terminals. **Backend on `8001`, frontend on `8002`.**

### Backend (FastAPI)
```bash
cd backend-20260626T023302Z-3-001/backend
python -m venv venv
venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install fastapi "uvicorn[standard]" python-multipart pytest httpx
python -m uvicorn main:app --port 8001
```

### Frontend (React)
```bash
cd frontend-20260626T023322Z-3-001/frontend
npm install
npm start                        # opens http://localhost:8002 (set via .env)
```

> The frontend `.env` pins `PORT=8002` and `REACT_APP_API_BASE=http://localhost:8001`.

### Tests
```bash
cd backend-20260626T023302Z-3-001/backend
python -m pytest                 # 19 tests: graph algorithms + API endpoints
```

---

## The four assessment parts

| Part | Requirement | Where |
|------|-------------|-------|
| **1 — Node abstraction** | Reusable abstraction; 5+ new nodes | [`components/BaseNode.js`](frontend-20260626T023322Z-3-001/frontend/src/components/BaseNode.js), [`components/NodeField.js`](frontend-20260626T023322Z-3-001/frontend/src/components/NodeField.js), [`nodes/nodeRegistry.js`](frontend-20260626T023322Z-3-001/frontend/src/nodes/nodeRegistry.js) |
| **2 — Styling** | Cohesive, appealing design | Design-token system in [`theme.css`](frontend-20260626T023322Z-3-001/frontend/src/theme.css) + per-component CSS |
| **3 — Text node logic** | Auto-resize + `{{variable}}` handles | [`nodes/textNode.js`](frontend-20260626T023322Z-3-001/frontend/src/nodes/textNode.js) |
| **4 — Backend integration** | Submit → `{num_nodes, num_edges, is_dag}` + alert | [`submit.js`](frontend-20260626T023322Z-3-001/frontend/src/submit.js), [`backend/main.py`](backend-20260626T023302Z-3-001/backend/main.py), [`backend/graph.py`](backend-20260626T023302Z-3-001/backend/graph.py) |

---

## Architecture: the node abstraction (Part 1)

Instead of one hand-written component per node (lots of duplicated handles,
state, and markup), every node is a **small declarative config** rendered by a
single `BaseNode`:

```jsx
export const LLMNode = ({ id, data }) => (
  <BaseNode
    id={id} data={data}
    title="LLM" icon={<FiCpu />} category="llm"
    handles={[
      { id: `${id}-system`,   type: 'target', position: Position.Left,  label: 'system' },
      { id: `${id}-prompt`,   type: 'target', position: Position.Left,  label: 'prompt' },
      { id: `${id}-response`, type: 'source', position: Position.Right, label: 'response' },
    ]}
    fields={[
      { name: 'model', label: 'Model', type: 'select', default: 'gpt-4o',
        options: ['gpt-4o', 'claude-3.5-sonnet', 'llama-3.1-70b'] },
    ]}
  />
);
```

- **`BaseNode`** handles layout, the accent-colored header, automatic handle
  distribution + labels, and the body.
- **`NodeField`** declaratively renders `text` / `select` / `textarea` /
  `number` / `checkbox` controls and wires them to the store.
- **`nodeRegistry.js`** is the single source of truth — the canvas (`nodeTypes`)
  and the toolbar palette (`NODE_GROUPS`) both derive from it. **Adding a node
  is one import + one registry line.**

A new node like this is the entire file:

```jsx
export const FilterNode = ({ id, data }) => (
  <BaseNode id={id} data={data} title="Filter" icon={<FiFilter />} category="data"
    handles={[
      { id: `${id}-input`,  type: 'target', position: Position.Left,  label: 'in' },
      { id: `${id}-output`, type: 'source', position: Position.Right, label: 'out' },
    ]}
    fields={[{ name: 'condition', label: 'Condition', type: 'text', default: 'item.value > 0' }]}
  />
);
```

### Nodes included (13)
General: **Input, Output, Text** · AI: **LLM** · Logic: **Math, Condition,
Filter** · Data: **Knowledge Base, Data Loader** · Triggers: **Trigger** ·
Integrations: **API Request, Integration, Note**

The Knowledge Base / Data Loader / Trigger / Integration nodes mirror
VectorShift's real building blocks (RAG, ingestion, scheduling, app connectors).

---

## Text node logic (Part 3)

- **Auto-resize:** width tracks the longest line; height grows with the content
  (`useLayoutEffect` + `scrollHeight`).
- **Dynamic handles:** a regex (`/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g`)
  extracts valid identifiers from `{{ variable }}` tokens and renders a labeled
  input handle per variable, calling `useUpdateNodeInternals` so edges re-anchor.

---

## Backend (Part 4)

`POST /pipelines/parse` returns the required shape **plus** a richer analysis:

```jsonc
{
  "num_nodes": 9,
  "num_edges": 10,
  "is_dag": true,
  "analysis": {
    "cycle": null,                 // the offending path when not a DAG
    "entry_nodes": ["customInput-1"],
    "exit_nodes": ["customOutput-1"],
    "orphan_nodes": [],
    "longest_chain": 6,
    "node_type_counts": { "llm": 1, "text": 1, ... }
  }
}
```

- **DAG check** uses **Kahn's algorithm** — `O(V + E)`.
- **Cycle extraction** uses iterative DFS with a recursion stack.
- Algorithms live in [`graph.py`](backend-20260626T023302Z-3-001/backend/graph.py),
  fully unit-tested, independent of the web layer.
- Extra endpoints: `POST /pipelines/save`, `GET /pipelines`,
  `GET /pipelines/{id}`, `DELETE /pipelines/{id}`.

The frontend posts the graph and shows the result in a styled modal with the
node/edge counts and DAG verdict.

---

## Beyond the brief

- **Run simulation** — topologically executes the pipeline client-side and
  shows a per-node trace (text-variable substitution, math, branching, mock
  LLM/RAG/API). See [`lib/pipelineRunner.js`](frontend-20260626T023322Z-3-001/frontend/src/lib/pipelineRunner.js).
- **Save / Load** — pipelines persist to `localStorage` (survive refresh), can
  be **exported/imported** as JSON, and **saved to the backend**.
- **Connection validation** — rejects self-loops and duplicate edges.
- **Tests** — 19 `pytest` tests covering the graph algorithms and the API.
- **Polish** — design-token theming, animated edges, minimap, empty state,
  keyboard delete, grouped draggable palette.

---

## Tech stack

**Frontend:** React 18, ReactFlow, Zustand (+ `persist`), react-icons, CRA.
**Backend:** FastAPI, Pydantic v2, Uvicorn, pytest.
