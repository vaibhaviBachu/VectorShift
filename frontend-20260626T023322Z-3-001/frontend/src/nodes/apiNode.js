// apiNode.js — makes an outbound HTTP request.
import { Position } from 'reactflow';
import { FiGlobe } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const ApiNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="API Request"
    subtitle="Call an HTTP endpoint"
    icon={<FiGlobe />}
    category="integration"
    handles={[
      { id: `${id}-trigger`, type: 'target', position: Position.Left, label: 'trigger' },
      { id: `${id}-body`, type: 'target', position: Position.Left, label: 'body' },
      { id: `${id}-response`, type: 'source', position: Position.Right, label: 'response' },
    ]}
    fields={[
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        default: 'GET',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        default: 'https://api.example.com',
        placeholder: 'https://...',
      },
    ]}
  />
);
