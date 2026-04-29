import { Columns3 } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, NumberInput, Select, ColorInput, ImagePicker } from './Inspector';

interface ContainerProps extends Record<string, unknown> {
  columns: 1 | 2 | 3 | 4;
  gap: number;
  paddingY: number;
  paddingX: number;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background: string;
  backgroundImage: string;
  align: 'start' | 'center' | 'stretch';
}

const defaultProps: ContainerProps = {
  columns: 1,
  gap: 6,
  paddingY: 12,
  paddingX: 6,
  maxWidth: 'xl',
  background: '',
  backgroundImage: '',
  align: 'stretch',
};

const maxWidthMap: Record<ContainerProps['maxWidth'], string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-none',
};

const colsMap: Record<ContainerProps['columns'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
};

const alignMap: Record<ContainerProps['align'], string> = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
};

export const ContainerBlock: BlockDefinition<ContainerProps> = {
  type: 'container',
  label: 'Container',
  icon: Columns3,
  group: 'layout',
  allowsChildren: true,
  defaultProps,
  Render: ({ props, mode, renderChildren }) => {
    const sectionStyle: React.CSSProperties = {
      paddingTop: `${props.paddingY * 4}px`,
      paddingBottom: `${props.paddingY * 4}px`,
      paddingLeft: `${props.paddingX * 4}px`,
      paddingRight: `${props.paddingX * 4}px`,
    };
    if (props.background) sectionStyle.backgroundColor = props.background;
    if (props.backgroundImage) {
      sectionStyle.backgroundImage = `url(${props.backgroundImage})`;
      sectionStyle.backgroundSize = 'cover';
      sectionStyle.backgroundPosition = 'center';
    }
    return (
      <section className="w-full" style={sectionStyle}>
        <div className={`mx-auto ${maxWidthMap[props.maxWidth]}`}>
          <div
            className={`grid ${colsMap[props.columns]} ${alignMap[props.align]}`}
            style={{ gap: `${props.gap * 4}px` }}
          >
            {renderChildren ? renderChildren() : null}
            {mode === 'edit' && !renderChildren && (
              <div className="col-span-full text-center text-xs text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-xl">
                Drop blocks inside this container
              </div>
            )}
          </div>
        </div>
      </section>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Columns">
        <Select
          value={String(props.columns) as '1' | '2' | '3' | '4'}
          onChange={v => onChange({ columns: Number(v) as ContainerProps['columns'] })}
          options={[
            { value: '1', label: '1 column' },
            { value: '2', label: '2 columns' },
            { value: '3', label: '3 columns' },
            { value: '4', label: '4 columns' },
          ]}
        />
      </Field>
      <Field label="Max width">
        <Select
          value={props.maxWidth}
          onChange={v => onChange({ maxWidth: v })}
          options={[
            { value: 'sm', label: 'Narrow' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Wide' },
            { value: 'xl', label: 'Extra wide' },
            { value: '2xl', label: 'Huge' },
            { value: 'full', label: 'Full width' },
          ]}
        />
      </Field>
      <Field label="Vertical alignment">
        <Select
          value={props.align}
          onChange={v => onChange({ align: v })}
          options={[
            { value: 'start', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'stretch', label: 'Stretch' },
          ]}
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Gap">
          <NumberInput value={props.gap} onChange={v => onChange({ gap: v })} min={0} max={24} />
        </Field>
        <Field label="Pad X">
          <NumberInput
            value={props.paddingX}
            onChange={v => onChange({ paddingX: v })}
            min={0}
            max={24}
          />
        </Field>
        <Field label="Pad Y">
          <NumberInput
            value={props.paddingY}
            onChange={v => onChange({ paddingY: v })}
            min={0}
            max={48}
          />
        </Field>
      </div>
      <Field label="Background color">
        <ColorInput value={props.background} onChange={v => onChange({ background: v })} />
      </Field>
      <Field label="Background image">
        <ImagePicker
          value={props.backgroundImage}
          onChange={v => onChange({ backgroundImage: v })}
        />
      </Field>
    </div>
  ),
};
