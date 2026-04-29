import { ImageIcon } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, ImagePicker, NumberInput, Select, TextInput } from './Inspector';

interface ImageBlockProps extends Record<string, unknown> {
  url: string;
  alt: string;
  link: string;
  width: number;
  align: 'left' | 'center' | 'right';
  rounded: 'none' | 'md' | 'xl' | 'full';
}

const defaultProps: ImageBlockProps = {
  url: '',
  alt: '',
  link: '',
  width: 100,
  align: 'center',
  rounded: 'xl',
};

const roundedMap: Record<ImageBlockProps['rounded'], string> = {
  none: 'rounded-none',
  md: 'rounded-md',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const ImageBlock: BlockDefinition<ImageBlockProps> = {
  type: 'image',
  label: 'Image',
  icon: ImageIcon,
  group: 'media',
  defaultProps,
  Render: ({ props }) => {
    const wrapAlign =
      props.align === 'left'
        ? 'justify-start'
        : props.align === 'right'
          ? 'justify-end'
          : 'justify-center';
    const img = props.url ? (
      <img
        src={props.url}
        alt={props.alt}
        className={`${roundedMap[props.rounded]} max-w-full h-auto`}
        style={{ width: `${Math.min(Math.max(props.width, 5), 100)}%` }}
      />
    ) : (
      <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
        No image selected
      </div>
    );
    return (
      <div className={`flex ${wrapAlign} my-3 px-4`}>
        {props.link ? (
          <a href={props.link} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Image">
        <ImagePicker value={props.url} onChange={v => onChange({ url: v })} />
      </Field>
      <Field label="Alt text" hint="Describes the image for accessibility & SEO.">
        <TextInput value={props.alt} onChange={v => onChange({ alt: v })} />
      </Field>
      <Field label="Link URL (optional)">
        <TextInput
          value={props.link}
          onChange={v => onChange({ link: v })}
          placeholder="https://"
        />
      </Field>
      <Field label="Width %">
        <NumberInput
          value={props.width}
          onChange={v => onChange({ width: v })}
          min={5}
          max={100}
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
      <Field label="Rounded">
        <Select
          value={props.rounded}
          onChange={v => onChange({ rounded: v })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'md', label: 'Subtle' },
            { value: 'xl', label: 'Large' },
            { value: 'full', label: 'Circle' },
          ]}
        />
      </Field>
    </div>
  ),
};
