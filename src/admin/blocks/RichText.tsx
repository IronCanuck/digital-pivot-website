import { AlignLeft } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, Select, TextArea, ColorInput } from './Inspector';

interface RichTextProps extends Record<string, unknown> {
  text: string;
  align: 'left' | 'center' | 'right';
  size: 'sm' | 'base' | 'lg' | 'xl';
  color: string;
}

const defaultProps: RichTextProps = {
  text: 'Edit this paragraph and add your own text. Click here to begin editing — you can change the alignment, size, and color from the right inspector panel.',
  align: 'left',
  size: 'base',
  color: '',
};

const sizeMap: Record<RichTextProps['size'], string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const RichTextBlock: BlockDefinition<RichTextProps> = {
  type: 'rich_text',
  label: 'Text',
  icon: AlignLeft,
  group: 'basic',
  defaultProps,
  Render: ({ props }) => {
    const alignClass =
      props.align === 'center' ? 'text-center' : props.align === 'right' ? 'text-right' : 'text-left';
    return (
      <p
        className={`${sizeMap[props.size]} ${alignClass} text-gray-700 leading-relaxed my-3 px-4 whitespace-pre-wrap`}
        style={props.color ? { color: props.color } : undefined}
      >
        {props.text}
      </p>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Text">
        <TextArea value={props.text} onChange={v => onChange({ text: v })} rows={6} />
      </Field>
      <Field label="Size">
        <Select
          value={props.size}
          onChange={v => onChange({ size: v })}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'base', label: 'Normal' },
            { value: 'lg', label: 'Large' },
            { value: 'xl', label: 'Extra large' },
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
