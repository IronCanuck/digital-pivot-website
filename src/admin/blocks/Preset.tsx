import { LayoutTemplate } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, Select } from './Inspector';
import HeroSection from '../../components/HeroSection';
import ValuePillars from '../../components/ValuePillars';
import ComparisonTable from '../../components/ComparisonTable';
import PortfolioSection from '../../components/PortfolioSection';
import ProcessSection from '../../components/ProcessSection';
import BenefitsSection from '../../components/BenefitsSection';
import PricingSection from '../../components/PricingSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import FAQSection from '../../components/FAQSection';
import ContactSection from '../../components/ContactSection';

type PresetKey =
  | 'hero'
  | 'value_pillars'
  | 'comparison'
  | 'portfolio'
  | 'process'
  | 'benefits'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'contact';

interface PresetProps extends Record<string, unknown> {
  component: PresetKey;
}

const defaultProps: PresetProps = { component: 'hero' };

const presetMap: Record<PresetKey, { label: string; component: React.ComponentType }> = {
  hero: { label: 'Hero', component: HeroSection },
  value_pillars: { label: 'Value Pillars', component: ValuePillars },
  comparison: { label: 'Comparison Table', component: ComparisonTable },
  portfolio: { label: 'Portfolio', component: PortfolioSection },
  process: { label: 'Process', component: ProcessSection },
  benefits: { label: 'Benefits', component: BenefitsSection },
  pricing: { label: 'Pricing', component: PricingSection },
  testimonials: { label: 'Testimonials', component: TestimonialsSection },
  faq: { label: 'FAQ', component: FAQSection },
  contact: { label: 'Contact', component: ContactSection },
};

export const PresetBlock: BlockDefinition<PresetProps> = {
  type: 'preset',
  label: 'Section Preset',
  icon: LayoutTemplate,
  group: 'preset',
  defaultProps,
  Render: ({ props }) => {
    const entry = presetMap[props.component];
    if (!entry) {
      return (
        <div className="my-3 mx-4 p-4 rounded-xl border border-dashed border-red-200 bg-red-50 text-xs text-red-600">
          Unknown preset: {String(props.component)}
        </div>
      );
    }
    const C = entry.component;
    return <C />;
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Section" hint="Pre-built site sections — edit their text under Page Content.">
        <Select
          value={props.component}
          onChange={v => onChange({ component: v as PresetKey })}
          options={(Object.keys(presetMap) as PresetKey[]).map(k => ({
            value: k,
            label: presetMap[k].label,
          }))}
        />
      </Field>
    </div>
  ),
};

export const presetOptions = (Object.keys(presetMap) as PresetKey[]).map(k => ({
  value: k,
  label: presetMap[k].label,
}));
