// llmNode.js
import { Position } from 'reactflow';
import { FiCpu } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const LLMNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="LLM"
    subtitle="Large language model"
    icon={<FiCpu />}
    category="llm"
    handles={[
      { id: `${id}-system`, type: 'target', position: Position.Left, label: 'system' },
      { id: `${id}-prompt`, type: 'target', position: Position.Left, label: 'prompt' },
      { id: `${id}-response`, type: 'source', position: Position.Right, label: 'response' },
    ]}
    fields={[
      {
        name: 'model',
        label: 'Model',
        type: 'select',
        default: 'gpt-4o',
        options: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'llama-3.1-70b'],
      },
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        default: '0.7',
        min: 0,
        max: 2,
        step: 0.1,
      },
    ]}
  />
);
