// pipelineRunner.js
// A lightweight client-side "execution" of a pipeline. It topologically
// orders the graph (Kahn's algorithm) and flows data through per-type
// evaluators, producing a human-readable trace for each node. This mirrors
// how VectorShift actually runs pipelines — here the heavy steps (LLM, RAG,
// API) are simulated so the whole thing runs instantly and offline.

const portOf = (handleId, nodeId) =>
  handleId && handleId.startsWith(`${nodeId}-`)
    ? handleId.slice(nodeId.length + 1)
    : handleId;

const asNumber = (value) => {
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
};

// Each evaluator receives (node.data, inputsByPort, inputList) and returns
// a short string describing the node's output value.
const evaluators = {
  trigger: (d) => `▶ fired via ${d.triggerType || 'Manual'}`,

  customInput: (d) => {
    const name = d.inputName || 'input';
    return d.inputType === 'File' ? `📎 file: ${name}` : `"${name} value"`;
  },

  dataLoader: (d) =>
    `loaded from ${d.source || 'File'}${d.location ? ` (${d.location})` : ''}`,

  knowledgeBase: (d, _byPort, inputs) =>
    `top ${d.topK || 5} chunks from "${d.knowledgeBase || 'kb'}" for ${
      inputs[0]?.value ? `query ${inputs[0].value}` : 'query'
    }`,

  text: (d, byPort) => {
    // Resolve {{ variable }} tokens from connected inputs.
    const text = d.text ?? '';
    return text.replace(/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g, (_m, name) => {
      const val = byPort[`var-${name}`];
      return val !== undefined ? String(val) : `{{${name}}}`;
    });
  },

  llm: (d, _byPort, inputs) => {
    const ctx = inputs.map((i) => i.value).filter(Boolean).join(' | ');
    return `🤖 ${d.model || 'gpt-4o'} response${ctx ? ` to: ${ctx}` : ''}`;
  },

  math: (d, byPort, inputs) => {
    const a = asNumber(byPort.a ?? inputs[0]?.value);
    const b = asNumber(byPort.b ?? inputs[1]?.value);
    if (a === null || b === null) return `compute ${d.operation || 'add'}(a, b)`;
    const ops = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b !== 0 ? a / b : 'NaN (÷0)',
    };
    return `${a} ${d.operation || 'add'} ${b} = ${ops[d.operation ?? 'add']}`;
  },

  condition: (d, _byPort, inputs) =>
    `if (${inputs[0]?.value ?? 'value'} ${d.operator || '=='} ${
      d.compareTo || '?'
    }) → routes true/false`,

  filter: (d, _byPort, inputs) =>
    `kept items where ${d.condition || 'condition'} (from ${
      inputs[0]?.value ?? 'in'
    })`,

  api: (d) => `${d.method || 'GET'} ${d.url || ''} → 200 OK`,

  integration: (d, _byPort, inputs) =>
    `→ ${d.service || 'Slack'}: ${d.action || 'send'}${
      inputs[0]?.value ? ` (${inputs[0].value})` : ''
    }`,

  customOutput: (_d, _byPort, inputs) =>
    inputs[0]?.value !== undefined ? String(inputs[0].value) : '(no input)',

  note: () => null,
};

/**
 * Execute the pipeline.
 * @returns {{ ok: boolean, error?: string, order?: string[], steps?: object[] }}
 */
export function runPipeline(nodes, edges) {
  if (nodes.length === 0) {
    return { ok: false, error: 'Add some nodes before running the pipeline.' };
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adjacency = new Map(nodes.map((n) => [n.id, []]));
  const inEdges = new Map(nodes.map((n) => [n.id, []]));
  const inDegree = new Map(nodes.map((n) => [n.id, 0]));

  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    adjacency.get(edge.source).push(edge.target);
    inEdges.get(edge.target).push(edge);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  }

  // Kahn's algorithm for topological order.
  const queue = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const next of adjacency.get(id)) {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) {
    return {
      ok: false,
      error: 'Pipeline contains a cycle — it must be a DAG to run.',
    };
  }

  const outputs = new Map(); // nodeId -> output value
  const steps = [];

  for (const id of order) {
    const node = byId.get(id);
    const type = node.type;
    if (type === 'note') continue; // documentation only

    // Collect inputs flowing into this node.
    const inputList = [];
    const byPort = {};
    for (const edge of inEdges.get(id)) {
      const value = outputs.get(edge.source);
      const port = portOf(edge.targetHandle, id);
      const fromLabel = byId.get(edge.source)?.data?.nodeType || edge.source;
      inputList.push({ port, value, fromLabel });
      if (port) byPort[port] = value;
    }

    const evaluate = evaluators[type] || (() => `${type} executed`);
    const output = evaluate(node.data || {}, byPort, inputList);
    outputs.set(id, output);

    steps.push({
      nodeId: id,
      type,
      label: node.data?.nodeType || type,
      inputs: inputList,
      output,
    });
  }

  return { ok: true, order, steps };
}
