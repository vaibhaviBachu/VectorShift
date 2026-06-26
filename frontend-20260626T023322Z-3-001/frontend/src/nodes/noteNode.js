// noteNode.js — a documentation sticky with no handles, showing the
// abstraction handles connection-less nodes just as easily.
import { FiFileText } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const NoteNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Note"
    subtitle="Documentation only"
    icon={<FiFileText />}
    category="data"
    fields={[
      {
        name: 'content',
        label: 'Content',
        type: 'textarea',
        default: 'Add notes about this pipeline…',
        rows: 3,
      },
    ]}
  />
);
