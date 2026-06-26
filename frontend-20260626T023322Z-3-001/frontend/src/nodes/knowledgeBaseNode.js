// knowledgeBaseNode.js — semantic search over a vector store (RAG).
import { Position } from 'reactflow';
import { FiDatabase } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const KnowledgeBaseNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Knowledge Base"
    subtitle="Vector store retrieval"
    icon={<FiDatabase />}
    category="knowledge"
    handles={[
      { id: `${id}-query`, type: 'target', position: Position.Left, label: 'query' },
      { id: `${id}-results`, type: 'source', position: Position.Right, label: 'results' },
    ]}
    fields={[
      {
        name: 'knowledgeBase',
        label: 'Knowledge base',
        type: 'select',
        default: 'company-docs',
        options: ['company-docs', 'product-wiki', 'support-tickets', 'legal'],
      },
      {
        name: 'topK',
        label: 'Top K results',
        type: 'number',
        default: '5',
        min: 1,
        max: 50,
      },
    ]}
  />
);
