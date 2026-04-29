import type { BlockDefinition } from './types';
import { HeadingBlock } from './Heading';
import { RichTextBlock } from './RichText';
import { ImageBlock } from './Image';
import { ButtonBlock } from './Button';
import { ContainerBlock } from './Container';
import { VideoBlock } from './Video';
import { SpacerBlock } from './Spacer';
import { DividerBlock } from './Divider';
import { HtmlBlock } from './Html';
import { FormBlock } from './Form';
import { PresetBlock } from './Preset';

export const blockDefinitions: BlockDefinition[] = [
  HeadingBlock as unknown as BlockDefinition,
  RichTextBlock as unknown as BlockDefinition,
  ImageBlock as unknown as BlockDefinition,
  ButtonBlock as unknown as BlockDefinition,
  ContainerBlock as unknown as BlockDefinition,
  VideoBlock as unknown as BlockDefinition,
  SpacerBlock as unknown as BlockDefinition,
  DividerBlock as unknown as BlockDefinition,
  HtmlBlock as unknown as BlockDefinition,
  FormBlock as unknown as BlockDefinition,
  PresetBlock as unknown as BlockDefinition,
];

export const blockRegistry: Record<string, BlockDefinition> = blockDefinitions.reduce(
  (acc, def) => {
    acc[def.type] = def;
    return acc;
  },
  {} as Record<string, BlockDefinition>,
);

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry[type];
}

export const blockGroups: { id: BlockDefinition['group']; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'media', label: 'Media' },
  { id: 'layout', label: 'Layout' },
  { id: 'preset', label: 'Site Sections' },
  { id: 'advanced', label: 'Advanced' },
];
