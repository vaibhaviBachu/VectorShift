"""Pure graph algorithms for pipeline analysis.

Kept free of FastAPI/Pydantic so the logic is easy to unit-test in isolation.
All functions operate on a list of node ids and a list of (source, target)
edge tuples, and every traversal runs in O(V + E).
"""

from collections import defaultdict, deque
from typing import Dict, List, Optional, Sequence, Tuple

Edge = Tuple[str, str]


def build_adjacency(
    node_ids: Sequence[str], edges: Sequence[Edge]
) -> Tuple[Dict[str, List[str]], Dict[str, int]]:
    """Return adjacency list and in-degree map.

    Edges referencing unknown nodes are ignored so malformed payloads cannot
    crash the analysis.
    """
    ids = set(node_ids)
    adjacency: Dict[str, List[str]] = {node_id: [] for node_id in ids}
    in_degree: Dict[str, int] = {node_id: 0 for node_id in ids}

    for source, target in edges:
        if source not in ids or target not in ids:
            continue
        adjacency[source].append(target)
        in_degree[target] += 1

    return adjacency, in_degree


def topological_order(
    node_ids: Sequence[str], edges: Sequence[Edge]
) -> Tuple[List[str], bool]:
    """Kahn's algorithm. Returns (order, is_dag).

    If the graph has a cycle, `order` contains only the nodes that could be
    sorted and the boolean is False.
    """
    adjacency, in_degree = build_adjacency(node_ids, edges)
    queue = deque(node for node, deg in in_degree.items() if deg == 0)
    order: List[str] = []

    while queue:
        current = queue.popleft()
        order.append(current)
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order, len(order) == len(set(node_ids))


def is_dag(node_ids: Sequence[str], edges: Sequence[Edge]) -> bool:
    """True when the directed graph has no cycles."""
    _, acyclic = topological_order(node_ids, edges)
    return acyclic


def find_cycle(
    node_ids: Sequence[str], edges: Sequence[Edge]
) -> Optional[List[str]]:
    """Return one cycle as an ordered list of node ids, or None if acyclic.

    Iterative DFS with a recursion stack so we can reconstruct the offending
    path for user-friendly error reporting.
    """
    adjacency, _ = build_adjacency(node_ids, edges)

    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {node_id: WHITE for node_id in set(node_ids)}
    parent: Dict[str, Optional[str]] = {}

    for start in color:
        if color[start] != WHITE:
            continue
        stack: List[Tuple[str, int]] = [(start, 0)]
        parent[start] = None

        while stack:
            node, index = stack[-1]
            if index == 0:
                color[node] = GRAY
            if index < len(adjacency[node]):
                stack[-1] = (node, index + 1)
                neighbor = adjacency[node][index]
                if color[neighbor] == GRAY:
                    # Self-loop is its own minimal cycle.
                    if neighbor == node:
                        return [node]
                    # Found a back edge — rebuild the cycle from node→neighbor.
                    cycle = [neighbor, node]
                    walker = parent.get(node)
                    while walker is not None and walker != neighbor:
                        cycle.append(walker)
                        walker = parent.get(walker)
                    cycle.reverse()
                    return cycle
                if color[neighbor] == WHITE:
                    parent[neighbor] = node
                    stack.append((neighbor, 0))
            else:
                color[node] = BLACK
                stack.pop()

    return None


def longest_chain_length(node_ids: Sequence[str], edges: Sequence[Edge]) -> int:
    """Number of nodes in the longest path of a DAG (its depth).

    Returns 0 for a graph that contains a cycle.
    """
    order, acyclic = topological_order(node_ids, edges)
    if not acyclic:
        return 0

    adjacency, _ = build_adjacency(node_ids, edges)
    depth: Dict[str, int] = {node_id: 1 for node_id in set(node_ids)}
    best = 0
    for node in order:
        for neighbor in adjacency[node]:
            depth[neighbor] = max(depth[neighbor], depth[node] + 1)
        best = max(best, depth[node])
    return best


def analyze(
    node_ids: Sequence[str],
    edges: Sequence[Edge],
    node_types: Optional[Dict[str, str]] = None,
) -> dict:
    """Produce a rich, user-facing analysis of the pipeline graph."""
    ids = list(node_ids)
    adjacency, in_degree = build_adjacency(ids, edges)
    out_degree = {node_id: len(adjacency[node_id]) for node_id in adjacency}

    cycle = find_cycle(ids, edges)
    acyclic = cycle is None

    entry_nodes = [n for n in ids if in_degree[n] == 0 and out_degree[n] > 0]
    exit_nodes = [n for n in ids if out_degree[n] == 0 and in_degree[n] > 0]
    orphan_nodes = [n for n in ids if in_degree[n] == 0 and out_degree[n] == 0]

    type_counts: Dict[str, int] = defaultdict(int)
    if node_types:
        for node_id in ids:
            type_counts[node_types.get(node_id, "unknown")] += 1

    return {
        "is_dag": acyclic,
        "cycle": cycle,
        "entry_nodes": entry_nodes,
        "exit_nodes": exit_nodes,
        "orphan_nodes": orphan_nodes,
        "longest_chain": longest_chain_length(ids, edges) if acyclic else 0,
        "node_type_counts": dict(type_counts),
    }
