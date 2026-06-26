// outputNode.js
import { Position } from 'reactflow';
import { FiLogOut } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const OutputNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Output"
    subtitle="Pipeline result"
    icon={<FiLogOut />}
    category="output"
    handles={[{ id: `${id}-value`, type: 'target', position: Position.Left }]}
    fields={[
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        default: (id) => id.replace('customOutput-', 'output_'),
      },
      {
        name: 'outputType',
        label: 'Type',
        type: 'select',
        default: 'Text',
        options: [
          { label: 'Text', value: 'Text' },
          { label: 'Image', value: 'Image' },
        ],
      },
    ]}
  />
);
