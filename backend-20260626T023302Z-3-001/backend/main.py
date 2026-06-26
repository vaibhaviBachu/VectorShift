"""VectorShift pipeline-parsing backend.

Endpoints
---------
GET  /                     health check
POST /pipelines/parse      analyze a pipeline: node/edge counts, DAG check,
                           and a richer breakdown (cycle path, entry/exit/
                           orphan nodes, longest chain, type counts)
POST /pipelines/save       persist a named pipeline
GET  /pipelines            list saved pipelines
GET  /pipelines/{id}       fetch a saved pipeline
DELETE /pipelines/{id}     delete a saved pipeline

The graph algorithms live in `graph.py` so they can be unit-tested without
spinning up the web layer.
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import graph

app = FastAPI(title="VectorShift Pipeline API", version="2.0.0")

# Local dev origins, plus any set via the ALLOWED_ORIGINS env var in production
# (comma-separated). The regex additionally allows Vercel preview deployments.
_default_origins = [
    "http://localhost:8002",
    "http://127.0.0.1:8002",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
_env_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _env_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Schemas --------------------------------------------------------------------

class Node(BaseModel):
    id: str
    type: Optional[str] = None
    # Nodes also carry position/data; ignore the rest gracefully.
    model_config = {"extra": "allow"}


class Edge(BaseModel):
    source: str
    target: str
    model_config = {"extra": "allow"}


class Pipeline(BaseModel):
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)


class Analysis(BaseModel):
    cycle: Optional[List[str]] = None
    entry_nodes: List[str] = Field(default_factory=list)
    exit_nodes: List[str] = Field(default_factory=list)
    orphan_nodes: List[str] = Field(default_factory=list)
    longest_chain: int = 0
    node_type_counts: Dict[str, int] = Field(default_factory=dict)


class PipelineStats(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    analysis: Analysis


class SavePipelineRequest(Pipeline):
    name: str = "Untitled pipeline"


class SavedPipelineSummary(BaseModel):
    id: str
    name: str
    num_nodes: int
    num_edges: int
    updated_at: str


# --- Lightweight JSON persistence -----------------------------------------------

STORE_PATH = Path(__file__).with_name("pipelines_store.json")


def _load_store() -> Dict[str, Any]:
    if STORE_PATH.exists():
        try:
            return json.loads(STORE_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def _write_store(store: Dict[str, Any]) -> None:
    STORE_PATH.write_text(json.dumps(store, indent=2), encoding="utf-8")


# --- Helpers --------------------------------------------------------------------

def _edge_tuples(pipeline: Pipeline) -> List[tuple[str, str]]:
    return [(edge.source, edge.target) for edge in pipeline.edges]


def _node_types(pipeline: Pipeline) -> Dict[str, str]:
    return {node.id: (node.type or "unknown") for node in pipeline.nodes}


# --- Routes ---------------------------------------------------------------------

@app.get("/")
def read_root() -> dict[str, str]:
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=PipelineStats)
def parse_pipeline(pipeline: Pipeline) -> PipelineStats:
    node_ids = [node.id for node in pipeline.nodes]
    edges = _edge_tuples(pipeline)

    result = graph.analyze(node_ids, edges, _node_types(pipeline))

    return PipelineStats(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=result["is_dag"],
        analysis=Analysis(
            cycle=result["cycle"],
            entry_nodes=result["entry_nodes"],
            exit_nodes=result["exit_nodes"],
            orphan_nodes=result["orphan_nodes"],
            longest_chain=result["longest_chain"],
            node_type_counts=result["node_type_counts"],
        ),
    )


@app.post("/pipelines/save", response_model=SavedPipelineSummary)
def save_pipeline(request: SavePipelineRequest) -> SavedPipelineSummary:
    store = _load_store()
    pipeline_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "id": pipeline_id,
        "name": request.name,
        "nodes": [node.model_dump() for node in request.nodes],
        "edges": [edge.model_dump() for edge in request.edges],
        "updated_at": now,
    }
    store[pipeline_id] = record
    _write_store(store)

    return SavedPipelineSummary(
        id=pipeline_id,
        name=request.name,
        num_nodes=len(request.nodes),
        num_edges=len(request.edges),
        updated_at=now,
    )


@app.get("/pipelines", response_model=List[SavedPipelineSummary])
def list_pipelines() -> List[SavedPipelineSummary]:
    store = _load_store()
    summaries = [
        SavedPipelineSummary(
            id=rec["id"],
            name=rec["name"],
            num_nodes=len(rec.get("nodes", [])),
            num_edges=len(rec.get("edges", [])),
            updated_at=rec["updated_at"],
        )
        for rec in store.values()
    ]
    return sorted(summaries, key=lambda s: s.updated_at, reverse=True)


@app.get("/pipelines/{pipeline_id}")
def get_pipeline(pipeline_id: str) -> dict[str, Any]:
    store = _load_store()
    if pipeline_id not in store:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return store[pipeline_id]


@app.delete("/pipelines/{pipeline_id}")
def delete_pipeline(pipeline_id: str) -> dict[str, bool]:
    store = _load_store()
    if pipeline_id not in store:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    del store[pipeline_id]
    _write_store(store)
    return {"deleted": True}
