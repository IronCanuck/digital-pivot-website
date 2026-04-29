import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type BlockProps = Record<string, unknown>;

export interface BlockInstance {
  id: string;
  page_id: string;
  parent_id: string | null;
  block_type: string;
  props: BlockProps;
  display_order: number;
  children?: BlockInstance[];
}

export type BlockMode = 'view' | 'edit';

export interface BlockRenderProps<P extends BlockProps = BlockProps> {
  block: BlockInstance;
  props: P;
  mode: BlockMode;
  renderChildren?: () => ReactNode;
}

export interface InspectorProps<P extends BlockProps = BlockProps> {
  props: P;
  onChange: (next: Partial<P>) => void;
}

export interface BlockDefinition<P extends BlockProps = BlockProps> {
  type: string;
  label: string;
  icon: LucideIcon;
  group: 'basic' | 'media' | 'layout' | 'advanced' | 'preset';
  allowsChildren?: boolean;
  defaultProps: P;
  Render: ComponentType<BlockRenderProps<P>>;
  Inspector: ComponentType<InspectorProps<P>>;
}
