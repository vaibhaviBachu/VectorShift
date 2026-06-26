// dataLoaderNode.js — ingests data from an external source.
import { Position } from 'reactflow';
import { FiDownloadCloud } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const DataLoaderNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Data Loader"
    subtitle="Ingest external data"
    icon={<FiDownloadCloud />}
    category="data"
    handles={[
      { id: `${id}-data`, type: 'source', position: Position.Right, label: 'data' },
    ]}
    fields={[
      {
        name: 'source',
        label: 'Source',
        type: 'select',
        default: 'File',
        options: ['File', 'URL', 'Notion', 'Google Drive', 'S3'],
      },
      {
        name: 'location',
        label: 'Path / URL',
        type: 'text',
        default: '',
        placeholder: 'e.g. https://… or /docs/report.pdf',
      },
    ]}
  />
);
