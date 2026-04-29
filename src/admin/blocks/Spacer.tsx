import { MoveVertical } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, NumberInput } from './Inspector';

interface SpacerProps extends Record<string, unknown> {
  height: number;
}

const defaultProps: SpacerProps = { height: 40 };

export const SpacerBlock: BlockDefinition<SpacerProps> = {
  type: 'spacer',
  label: 'Spacer',
  icon: MoveVertical,
  group: 'layout',
  defaultProps,
  Render: ({ props }) => <div style={{ height: `${props.height}px` }} aria-hidden />,
  Inspector: ({ props, onChange }) => (
    <Field label="Height (px)">
      <NumberInput
        value={props.height}
        onChange={v => onChange({ height: v })}
        min={0}
        max={400}
      />
    </Field>
  ),
};
