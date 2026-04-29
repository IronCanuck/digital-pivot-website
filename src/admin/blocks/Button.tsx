import { MousePointerClick } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, Select, TextInput, Toggle } from './Inspector';

interface ButtonProps extends Record<string, unknown> {
  label: string;
  link: string;
  align: 'left' | 'center' | 'right';
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  newTab: boolean;
}

const defaultProps: ButtonProps = {
  label: 'Click me',
  link: '#',
  align: 'left',
  variant: 'primary',
  size: 'md',
  newTab: false,
};

const sizeClass: Record<ButtonProps['size'], string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantClass: Record<ButtonProps['variant'], string> = {
  primary: 'bg-gradient-brand text-white hover:opacity-90 shadow-lg shadow-teal-500/20',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
  ghost: 'text-gray-900 hover:bg-gray-100',
};

export const ButtonBlock: BlockDefinition<ButtonProps> = {
  type: 'button',
  label: 'Button',
  icon: MousePointerClick,
  group: 'basic',
  defaultProps,
  Render: ({ props }) => {
    const wrapAlign =
      props.align === 'left'
        ? 'justify-start'
        : props.align === 'right'
          ? 'justify-end'
          : 'justify-center';
    return (
      <div className={`flex ${wrapAlign} my-3 px-4`}>
        <a
          href={props.link || '#'}
          target={props.newTab ? '_blank' : undefined}
          rel={props.newTab ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all ${sizeClass[props.size]} ${variantClass[props.variant]}`}
        >
          {props.label}
        </a>
      </div>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Label">
        <TextInput value={props.label} onChange={v => onChange({ label: v })} />
      </Field>
      <Field label="Link URL">
        <TextInput
          value={props.link}
          onChange={v => onChange({ link: v })}
          placeholder="https:// or #anchor"
        />
      </Field>
      <Field label="Style">
        <Select
          value={props.variant}
          onChange={v => onChange({ variant: v })}
          options={[
            { value: 'primary', label: 'Primary (gradient)' },
            { value: 'secondary', label: 'Secondary (dark)' },
            { value: 'outline', label: 'Outline' },
            { value: 'ghost', label: 'Ghost' },
          ]}
        />
      </Field>
      <Field label="Size">
        <Select
          value={props.size}
          onChange={v => onChange({ size: v })}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
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
      <Toggle
        value={props.newTab}
        onChange={v => onChange({ newTab: v })}
        label="Open in new tab"
      />
    </div>
  ),
};
