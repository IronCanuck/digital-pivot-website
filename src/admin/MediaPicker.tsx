import { useEffect, useRef, useState } from 'react';
import { X, Upload, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaAsset {
  id: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_at: string;
}

interface Props {
  onSelect: (publicUrl: string, asset?: MediaAsset) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data, error: err } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setAssets((data as MediaAsset[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from('site-media')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('site-media').getPublicUrl(path);
        const publicUrl = urlData.publicUrl;
        const { error: insErr } = await supabase.from('media_assets').insert({
          storage_path: path,
          public_url: publicUrl,
          mime_type: file.type,
          size_bytes: file.size,
          alt_text: '',
          uploaded_by: userId,
        });
        if (insErr) throw insErr;
      }
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remove = async (asset: MediaAsset) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    await supabase.storage.from('site-media').remove([asset.storage_path]);
    await supabase.from('media_assets').delete().eq('id', asset.id);
    load();
  };

  const filtered = assets.filter(a =>
    !filter ||
    a.alt_text.toLowerCase().includes(filter.toLowerCase()) ||
    a.storage_path.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-gray-900">Media Library</h2>
            <p className="text-xs text-gray-500">Upload new images or pick from existing.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-70"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No media yet. Click Upload to add images.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map(asset => (
                <div
                  key={asset.id}
                  className="group relative rounded-xl border border-gray-100 hover:border-teal-300 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => onSelect(asset.public_url, asset)}
                    className="block w-full aspect-square bg-gray-50"
                  >
                    {asset.mime_type.startsWith('image/') ? (
                      <img
                        src={asset.public_url}
                        alt={asset.alt_text}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {asset.mime_type}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => remove(asset)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur text-red-500 opacity-0 group-hover:opacity-100 hover:bg-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
