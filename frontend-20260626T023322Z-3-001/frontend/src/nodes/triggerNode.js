// triggerNode.js — starts a pipeline run on an event.
import { Position } from 'reactflow';
import { FiZap } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const TriggerNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Trigger"
    subtitle="Start the pipeline"
    icon={<FiZap />}
    category="trigger"
    handles={[
      { id: `${id}-fire`, type: 'source', position: Position.Right, label: 'fire' },
    ]}
    fields={[
      {
        name: 'triggerType',
        label: 'Trigger on',
        type: 'select',
        default: 'Manual',
        options: ['Manual', 'Schedule', 'Webhook', 'Slack message', 'New email'],
      },
      {
        name: 'schedule',
        label: 'Schedule (cron)',
        type: 'text',
        default: '',
        placeholder: '0 9 * * 1  (Mon 9am)',
      },
    ]}
  />
);
