"""Tests for the pipeline graph algorithms and the FastAPI endpoints."""

from fastapi.testclient import TestClient

import graph
from main import app

client = TestClient(app)


# --- Graph algorithm unit tests -------------------------------------------------

class TestIsDag:
    def test_empty_graph_is_dag(self):
        assert graph.is_dag([], []) is True

    def test_simple_chain_is_dag(self):
        assert graph.is_dag(["a", "b", "c"], [("a", "b"), ("b", "c")]) is True

    def test_two_cycle_is_not_dag(self):
        assert graph.is_dag(["a", "b"], [("a", "b"), ("b", "a")]) is False

    def test_self_loop_is_not_dag(self):
        assert graph.is_dag(["a"], [("a", "a")]) is False

    def test_diamond_is_dag(self):
        edges = [("a", "b"), ("a", "c"), ("b", "d"), ("c", "d")]
        assert graph.is_dag(["a", "b", "c", "d"], edges) is True

    def test_disconnected_nodes_are_dag(self):
        assert graph.is_dag(["a", "b", "c"], []) is True

    def test_edges_to_unknown_nodes_are_ignored(self):
        assert graph.is_dag(["a"], [("a", "ghost")]) is True


class TestFindCycle:
    def test_no_cycle_returns_none(self):
        assert graph.find_cycle(["a", "b"], [("a", "b")]) is None

    def test_cycle_returns_path(self):
        cycle = graph.find_cycle(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
        assert cycle is not None
        assert set(cycle) == {"a", "b", "c"}

    def test_self_loop_detected(self):
        assert graph.find_cycle(["a"], [("a", "a")]) == ["a"]


class TestLongestChain:
    def test_chain_length(self):
        assert graph.longest_chain_length(["a", "b", "c"], [("a", "b"), ("b", "c")]) == 3

    def test_single_node(self):
        assert graph.longest_chain_length(["a"], []) == 1

    def test_cycle_returns_zero(self):
        assert graph.longest_chain_length(["a", "b"], [("a", "b"), ("b", "a")]) == 0


class TestAnalyze:
    def test_entry_exit_orphan_classification(self):
        nodes = ["in", "mid", "out", "lonely"]
        edges = [("in", "mid"), ("mid", "out")]
        result = graph.analyze(nodes, edges)
        assert result["entry_nodes"] == ["in"]
        assert result["exit_nodes"] == ["out"]
        assert result["orphan_nodes"] == ["lonely"]
        assert result["is_dag"] is True
        assert result["longest_chain"] == 3

    def test_type_counts(self):
        nodes = ["a", "b"]
        types = {"a": "llm", "b": "llm"}
        result = graph.analyze(nodes, [], types)
        assert result["node_type_counts"] == {"llm": 2}


# --- API endpoint tests ---------------------------------------------------------

class TestParseEndpoint:
    def test_parse_valid_dag(self):
        payload = {
            "nodes": [{"id": "a", "type": "customInput"}, {"id": "b", "type": "customOutput"}],
            "edges": [{"source": "a", "target": "b"}],
        }
        res = client.post("/pipelines/parse", json=payload)
        assert res.status_code == 200
        body = res.json()
        assert body["num_nodes"] == 2
        assert body["num_edges"] == 1
        assert body["is_dag"] is True
        assert body["analysis"]["node_type_counts"] == {"customInput": 1, "customOutput": 1}

    def test_parse_cycle_reports_not_dag(self):
        payload = {
            "nodes": [{"id": "a"}, {"id": "b"}],
            "edges": [{"source": "a", "target": "b"}, {"source": "b", "target": "a"}],
        }
        res = client.post("/pipelines/parse", json=payload)
        body = res.json()
        assert body["is_dag"] is False
        assert body["analysis"]["cycle"] is not None

    def test_parse_empty_pipeline(self):
        res = client.post("/pipelines/parse", json={"nodes": [], "edges": []})
        body = res.json()
        assert body["num_nodes"] == 0 and body["is_dag"] is True


class TestPersistence:
    def test_save_list_get_delete_roundtrip(self):
        payload = {
            "name": "Test pipeline",
            "nodes": [{"id": "a", "type": "text"}],
            "edges": [],
        }
        saved = client.post("/pipelines/save", json=payload).json()
        pid = saved["id"]
        assert saved["name"] == "Test pipeline"

        listing = client.get("/pipelines").json()
        assert any(p["id"] == pid for p in listing)

        fetched = client.get(f"/pipelines/{pid}").json()
        assert fetched["nodes"][0]["id"] == "a"

        deleted = client.delete(f"/pipelines/{pid}").json()
        assert deleted["deleted"] is True
        assert client.get(f"/pipelines/{pid}").status_code == 404
