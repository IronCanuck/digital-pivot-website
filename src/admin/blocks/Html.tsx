import { Code } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, TextArea } from './Inspector';

interface HtmlProps extends Record<string, unknown> {
  html: string;
}

const defaultProps: HtmlProps = { html: '<p>Custom HTML goes here.</p>' };

export const HtmlBlock: BlockDefinition<HtmlProps> = {
  type: 'html',
  label: 'Custom HTML',
  icon: Code,
  group: 'advanced',
  defaultProps,
  Render: ({ props, mode }) => {
    if (mode === 'edit') {
      return (
        <div className="my-3 mx-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-amber-700 mb-2">
            Custom HTML preview
          </p>
          <div dangerouslySetInnerHTML={{ __html: props.html }} />
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
  },
  Inspector: ({ props, onChange }) => (
    <Field label="HTML" hint="Be careful — pasted HTML is rendered as-is on your live site.">
      <TextArea value={props.html} onChange={v => onChange({ html: v })} rows={12} />
    </Field>
  ),
};
