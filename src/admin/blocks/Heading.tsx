import { Type } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, Select, TextInput, ColorInput } from './Inspector';

interface HeadingProps extends Record<string, unknown> {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4';
  align: 'left' | 'center' | 'right';
  color: string;
}

const defaultProps: HeadingProps = {
  text: 'New heading',
  level: 'h2',
  align: 'left',
  color: '',
};

export const HeadingBlock: BlockDefinition<HeadingProps> = {
  type: 'heading',
  label: 'Heading',
  icon: Type,
  group: 'basic',
  defaultProps,
  Render: ({ props }) => {
    const Tag = props.level;
    const sizes: Record<HeadingProps['level'], string> = {
      h1: 'text-4xl sm:text-5xl font-display font-bold',
      h2: 'text-3xl sm:text-4xl font-display font-bold',
      h3: 'text-2xl sm:text-3xl font-display font-semibold',
      h4: 'text-xl sm:text-2xl font-display font-semibold',
    };
    const alignClass = props.align === 'center' ? 'text-center' : props.align === 'right' ? 'text-right' : 'text-left';
    return (
      <Tag
        className={`${sizes[props.level]} ${alignClass} text-gray-900 my-4 px-4`}
        style={props.color ? { color: props.color } : undefined}
      >
        {props.text}
      </Tag>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Text">
        <TextInput value={props.text} onChange={v => onChange({ text: v })} />
      </Field>
      <Field label="Level">
        <Select
          value={props.level}
          onChange={v => onChange({ level: v })}
          options={[
            { value: 'h1', label: 'H1 — Page title' },
            { value: 'h2', label: 'H2 — Section' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
          ]}
        />
      </Field>
      <Field label="Alignment">
        <Select
          value={props.align}
          onChange={v => onChange({ align: v })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Field>
      <Field label="Color">
        <ColorInput value={props.color} onChange={v => onChange({ color: v })} />
      </Field>
    </div>
  ),
};
