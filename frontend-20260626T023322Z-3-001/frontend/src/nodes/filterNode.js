// filterNode.js — keeps only items matching a condition.
import { Position } from 'reactflow';
import { FiFilter } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const FilterNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Filter"
    subtitle="Keep matching items"
    icon={<FiFilter />}
    category="data"
    handles={[
      { id: `${id}-input`, type: 'target', position: Position.Left, label: 'in' },
      { id: `${id}-output`, type: 'source', position: Position.Right, label: 'out' },
    ]}
    fields={[
      {
        name: 'condition',
        label: 'Condition',
        type: 'text',
        default: 'item.value > 0',
        placeholder: 'e.g. item.score > 0.5',
      },
    ]}
  />
);
