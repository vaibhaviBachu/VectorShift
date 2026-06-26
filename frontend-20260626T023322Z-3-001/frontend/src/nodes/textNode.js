// textNode.js
// Demonstrates that the BaseNode abstraction also supports nodes with
// bespoke behavior: the Text node auto-resizes to its content and parses
// {{ variables }} out of the text to spawn matching input handles (Part 3).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Position } from 'reactflow';
import { useUpdateNodeInternals } from 'reactflow';
import { FiType } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';
import { useStore } from '../store';
import './textNode.css';

// Matches {{ name }} where `name` is a valid JS identifier.
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

const extractVariables = (text) => {
  const found = new Set();
  let match;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    found.add(match[1]);
  }
  return [...found];
};

// Approximate the box size from the content so width/height track the text.
const MIN_WIDTH = 240;
const MAX_WIDTH = 460;

const computeWidth = (text) => {
  const longestLine = text
    .split('\n')
    .reduce((max, line) => Math.max(max, line.length), 0);
  const estimated = longestLine * 7.7 + 48;
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, estimated));
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const [text, setText] = useState(data?.text ?? '{{ input }}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => extractVariables(text), [text]);

  // Auto-grow the textarea height to fit the content.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  // Persist to the store so the value is part of the pipeline at submit.
  useEffect(() => {
    updateNodeField(id, 'text', text);
  }, [id, text, updateNodeField]);

  // Handle positions change when variables change — tell ReactFlow to
  // recompute so edges connect to the right spot.
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, variables, updateNodeInternals]);

  const handles = [
    ...variables.map((name) => ({
      id: `${id}-var-${name}`,
      type: 'target',
      position: Position.Left,
      label: name,
    })),
    { id: `${id}-output`, type: 'source', position: Position.Right, label: 'output' },
  ];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Text"
      subtitle={variables.length ? `${variables.length} variable(s)` : 'Static text'}
      icon={<FiType />}
      category="text"
      width={computeWidth(text)}
      handles={handles}
    >
      <div className="vs-field">
        <label className="vs-field__label" htmlFor={`${id}-text`}>
          Text
        </label>
        <textarea
          id={`${id}-text`}
          ref={textareaRef}
          className="vs-field__control vs-field__control--area vs-text-node__input"
          value={text}
          placeholder="Type text, use {{ variable }} for inputs"
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </BaseNode>
  );
};
