// nodeRegistry.js
// Single source of truth for every node type. The canvas (ui.js) builds
// its `nodeTypes` map from here, and the toolbar builds its palette from
// here — so registering a new node is a one-line change in one file.

import {
  FiLogIn,
  FiLogOut,
  FiCpu,
  FiType,
  FiFilter,
  FiDivideSquare,
  FiGlobe,
  FiGitBranch,
  FiFileText,
  FiDatabase,
  FiDownloadCloud,
  FiZap,
  FiShare2,
} from 'react-icons/fi';

import { InputNode } from './inputNode';
import { OutputNode } from './outputNode';
import { LLMNode } from './llmNode';
import { TextNode } from './textNode';
import { FilterNode } from './filterNode';
import { MathNode } from './mathNode';
import { ApiNode } from './apiNode';
import { ConditionNode } from './conditionNode';
import { NoteNode } from './noteNode';
import { KnowledgeBaseNode } from './knowledgeBaseNode';
import { DataLoaderNode } from './dataLoaderNode';
import { TriggerNode } from './triggerNode';
import { IntegrationNode } from './integrationNode';

export const NODE_REGISTRY = [
  // type is what ReactFlow uses; group/category drive toolbar + accents.
  { type: 'customInput', label: 'Input', icon: FiLogIn, component: InputNode, category: 'input', group: 'General' },
  { type: 'customOutput', label: 'Output', icon: FiLogOut, component: OutputNode, category: 'output', group: 'General' },
  { type: 'text', label: 'Text', icon: FiType, component: TextNode, category: 'text', group: 'General' },
  { type: 'llm', label: 'LLM', icon: FiCpu, component: LLMNode, category: 'llm', group: 'AI' },
  { type: 'math', label: 'Math', icon: FiDivideSquare, component: MathNode, category: 'logic', group: 'Logic' },
  { type: 'condition', label: 'Condition', icon: FiGitBranch, component: ConditionNode, category: 'logic', group: 'Logic' },
  { type: 'filter', label: 'Filter', icon: FiFilter, component: FilterNode, category: 'data', group: 'Logic' },
  { type: 'knowledgeBase', label: 'Knowledge Base', icon: FiDatabase, component: KnowledgeBaseNode, category: 'knowledge', group: 'Data' },
  { type: 'dataLoader', label: 'Data Loader', icon: FiDownloadCloud, component: DataLoaderNode, category: 'data', group: 'Data' },
  { type: 'trigger', label: 'Trigger', icon: FiZap, component: TriggerNode, category: 'trigger', group: 'Triggers' },
  { type: 'api', label: 'API Request', icon: FiGlobe, component: ApiNode, category: 'integration', group: 'Integrations' },
  { type: 'integration', label: 'Integration', icon: FiShare2, component: IntegrationNode, category: 'integration', group: 'Integrations' },
  { type: 'note', label: 'Note', icon: FiFileText, component: NoteNode, category: 'data', group: 'Integrations' },
];

// Map consumed by ReactFlow: { [type]: Component }
export const nodeTypes = Object.fromEntries(
  NODE_REGISTRY.map(({ type, component }) => [type, component])
);

// Toolbar palette grouped into sections, preserving registry order.
export const NODE_GROUPS = NODE_REGISTRY.reduce((groups, node) => {
  (groups[node.group] = groups[node.group] || []).push(node);
  return groups;
}, {});
