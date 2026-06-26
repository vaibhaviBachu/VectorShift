// conditionNode.js — branches the pipeline into true/false paths.
import { Position } from 'reactflow';
import { FiGitBranch } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const ConditionNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Condition"
    subtitle="Branch the flow"
    icon={<FiGitBranch />}
    category="logic"
    handles={[
      { id: `${id}-input`, type: 'target', position: Position.Left, label: 'value' },
      { id: `${id}-true`, type: 'source', position: Position.Right, label: 'true' },
      { id: `${id}-false`, type: 'source', position: Position.Right, label: 'false' },
    ]}
    fields={[
      {
        name: 'operator',
        label: 'Operator',
        type: 'select',
        default: '==',
        options: ['==', '!=', '>', '>=', '<', '<='],
      },
      {
        name: 'compareTo',
        label: 'Compare to',
        type: 'text',
        default: '',
        placeholder: 'value',
      },
    ]}
  />
);
