// integrationNode.js — sends the pipeline result to an external app.
import { Position } from 'reactflow';
import { FiShare2 } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const IntegrationNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Integration"
    subtitle="Send to an external app"
    icon={<FiShare2 />}
    category="integration"
    handles={[
      { id: `${id}-payload`, type: 'target', position: Position.Left, label: 'payload' },
      { id: `${id}-response`, type: 'source', position: Position.Right, label: 'response' },
    ]}
    fields={[
      {
        name: 'service',
        label: 'Service',
        type: 'select',
        default: 'Slack',
        options: ['Slack', 'Gmail', 'Notion', 'HubSpot', 'Google Sheets'],
      },
      {
        name: 'action',
        label: 'Action',
        type: 'text',
        default: 'Send message',
        placeholder: 'e.g. Send message, Create row',
      },
    ]}
  />
);
