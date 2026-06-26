// mathNode.js — combines two numeric inputs with an operation.
import { Position } from 'reactflow';
import { FiDivideSquare } from 'react-icons/fi';
import { BaseNode } from '../components/BaseNode';

export const MathNode = ({ id, data }) => (
  <BaseNode
    id={id}
    data={data}
    title="Math"
    subtitle="Arithmetic operation"
    icon={<FiDivideSquare />}
    category="logic"
    handles={[
      { id: `${id}-a`, type: 'target', position: Position.Left, label: 'a' },
      { id: `${id}-b`, type: 'target', position: Position.Left, label: 'b' },
      { id: `${id}-result`, type: 'source', position: Position.Right, label: 'result' },
    ]}
    fields={[
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        default: 'add',
        options: [
          { label: 'Add (+)', value: 'add' },
          { label: 'Subtract (−)', value: 'subtract' },
          { label: 'Multiply (×)', value: 'multiply' },
          { label: 'Divide (÷)', value: 'divide' },
        ],
      },
    ]}
  />
);
