import { Video } from 'lucide-react';
import type { BlockDefinition } from './types';
import { Field, TextInput, Toggle } from './Inspector';

interface VideoProps extends Record<string, unknown> {
  url: string;
  autoplay: boolean;
}

const defaultProps: VideoProps = {
  url: '',
  autoplay: false,
};

function toEmbedUrl(url: string): string {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export const VideoBlock: BlockDefinition<VideoProps> = {
  type: 'video',
  label: 'Video',
  icon: Video,
  group: 'media',
  defaultProps,
  Render: ({ props }) => {
    const embed = toEmbedUrl(props.url);
    if (!embed) {
      return (
        <div className="my-4 mx-4 aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
          Paste a YouTube or Vimeo URL
        </div>
      );
    }
    const src = props.autoplay ? `${embed}?autoplay=1&mute=1` : embed;
    return (
      <div className="my-4 mx-4">
        <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={src}
            title="Embedded video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  },
  Inspector: ({ props, onChange }) => (
    <div className="space-y-4">
      <Field label="Video URL" hint="Paste a YouTube or Vimeo URL.">
        <TextInput
          value={props.url}
          onChange={v => onChange({ url: v })}
          placeholder="https://youtube.com/watch?v=..."
        />
      </Field>
      <Toggle
        value={props.autoplay}
        onChange={v => onChange({ autoplay: v })}
        label="Autoplay (muted)"
      />
    </div>
  ),
};
