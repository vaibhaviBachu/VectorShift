# VectorShift — Visual AI Pipeline Builder

Build AI workflows by **dragging nodes onto a canvas and connecting them** — then
analyze or run the pipeline. A polished take on VectorShift's core product, built
with **React + ReactFlow** (frontend) and **FastAPI** (backend).

### 🔗 Live demo
**App:** https://vector-shift-sand.vercel.app/ · **API:** https://vectorshift-backend-iosz.onrender.com

> The API is on a free tier that sleeps when idle, so the **first** "Submit" after a
> while can take ~50 seconds to wake up. After that it's instant.

---

## What can it do?

- 🧩 **13 node types** — Input, Output, Text, LLM, Math, Condition, Filter,
  Knowledge Base, Data Loader, Trigger, API Request, Integration, Note.
- 🔌 **Drag & connect** nodes to design a data flow (left → right).
- ✍️ **Smart Text node** — type `{{ variable }}` and it grows a matching input handle automatically.
- ▶️ **Run** — simulates execution and shows what each node outputs, in order.
- ✅ **Submit** — sends the graph to the backend, which returns node/edge counts and
  checks whether it's a valid **DAG** (no cycles).
- 💾 **Save / Import / Export** pipelines, 🌙 **dark mode**, and one-click **delete** per node.

---

## Run it locally

You have two options. **Docker is the easiest** (one command, nothing else to install).

### Option A — Docker (recommended, one command) 🐳

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

Then open **http://localhost:8095**. That's it — frontend and backend both start.
Press `Ctrl+C` to stop. (On older Docker, use `docker-compose up --build`.)

### Option B — Run manually (Node + Python)

Requires **Node 18+** and **Python 3.11+**. Use two terminals.

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend-20260626T023302Z-3-001/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --port 8001
```
Backend runs at **http://localhost:8001** (open it → you should see `{"Ping":"Pong"}`).

**Terminal 2 — Frontend (React):**
```bash
cd frontend-20260626T023322Z-3-001/frontend
npm install
npm start
```
Frontend opens at **http://localhost:8002** and talks to the backend on 8001.

---

## How to use it

1. Click **➕ Add Node** (top bar) and **drag** a node onto the canvas.
2. Connect nodes: drag from a node's **right-side dot** to the next node's **left-side dot**.
   Data flows left → right.
3. In a **Text** node, type something like `Hello {{ name }}` — a `name` input handle appears.
4. Click **▶ Run** to see a per-node execution trace, or **Submit Pipeline** to get
   node/edge counts + the DAG check.
5. Delete a node: hover it and click the 🗑️ icon, or select it and press `Delete`.

---

## Project structure

```
VectorShift/
├─ docker-compose.yml                 # one-command run (frontend + backend)
├─ render.yaml                        # backend cloud deploy (Render)
├─ DEPLOY.md                          # cloud deployment guide
├─ backend-…/backend/
│  ├─ main.py                         # FastAPI app + endpoints
│  ├─ graph.py                        # DAG algorithms (Kahn's, cycle detection)
│  ├─ tests/                          # pytest suite (19 tests)
│  └─ Dockerfile
└─ frontend-…/frontend/
   ├─ src/
   │  ├─ components/BaseNode.js       # the reusable node abstraction
   │  ├─ components/NodeField.js      # declarative form fields
   │  ├─ nodes/nodeRegistry.js        # single source of truth for all nodes
   │  ├─ lib/pipelineRunner.js        # client-side run simulation
   │  ├─ store.js                     # global state (Zustand)
   │  └─ theme.css                    # design tokens (light + dark)
   └─ Dockerfile
```

---

## How it's built (the interesting parts)

**One reusable node, many node types.** Every node is a tiny config rendered by a
shared `BaseNode` — handles, fields, styling, and the delete button are all defined
once. Adding a new node is ~20 lines + one line in `nodeRegistry.js`:

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

**The DAG check is real.** `graph.py` uses **Kahn's algorithm** (`O(V + E)`) to detect
cycles, plus DFS to extract the actual cycle path, and reports entry/exit/orphan nodes
and the longest chain. It's covered by 19 `pytest` tests.

**Backend API:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | Health check |
| `POST` | `/pipelines/parse` | `{ num_nodes, num_edges, is_dag, analysis }` |
| `POST` | `/pipelines/save` | Save a pipeline |
| `GET` | `/pipelines` | List saved pipelines |
| `GET` | `/pipelines/{id}` | Get one |
| `DELETE` | `/pipelines/{id}` | Delete one |

Run the tests:
```bash
cd backend-20260626T023302Z-3-001/backend
pip install -r requirements-dev.txt
python -m pytest
```

---

## Tech stack

**Frontend:** React 18 · ReactFlow · Zustand · react-icons · Create React App
**Backend:** FastAPI · Pydantic v2 · Uvicorn · pytest
**Infra:** Docker / Docker Compose · Vercel (frontend) · Render (backend)

---

## Deploying to the cloud

See **[DEPLOY.md](DEPLOY.md)** for step-by-step Vercel (frontend) + Render (backend)
instructions.
