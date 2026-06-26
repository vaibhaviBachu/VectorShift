// inputNode.js
import { Position } from 'reactflow';
import { FiLogIn } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const InputNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Input"
    subtitle="Pipeline entry point"
    icon={<FiLogIn />}
    category="input"
    handles={[{ id: `${id}-value`, type: 'source', position: Position.Right }]}
    fields={[
      {
        name: 'inputName',
        label: 'Name',
        type: 'text',
        default: (id) => id.replace('customInput-', 'input_'),
      },
      {
        name: 'inputType',
        label: 'Type',
        type: 'select',
        default: 'Text',
        options: ['Text', 'File'],
      },
    ]}
  />
);
