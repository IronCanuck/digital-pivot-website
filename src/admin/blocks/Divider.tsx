import { Minus } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, ColorInput, NumberInput } from './Inspector';

interface DividerProps extends Record<string, unknown> {
  color: string;
  thickness: number;
}

const defaultProps: DividerProps = { color: '#e5e7eb', thickness: 1 };

export const DividerBlock: BlockDefinition<DividerProps> = {
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  group: 'layout',
  defaultProps,
  Render: ({ props }) => (
    <div className="my-4 px-4">
      <hr
        style={{
          borderColor: props.color,
          borderTopWidth: `${props.thickness}px`,
          borderStyle: 'solid',
          margin: 0,
        }}
      />
    </div>
  ),
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Color">
        <ColorInput value={props.color} onChange={v => onChange({ color: v })} />
      </Field>
      <Field label="Thickness (px)">
        <NumberInput
          value={props.thickness}
          onChange={v => onChange({ thickness: v })}
          min={1}
          max={10}
        />
      </Field>
    </div>
  ),
};
