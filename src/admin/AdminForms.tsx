import { useState, useEffect } from 'react';
import {
  Plus, Trash2, GripVertical, Save, CheckCircle, Settings2,
  Type, Mail, Phone, AlignLeft, ChevronDown, ToggleLeft, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FormField, FormSettings } from '../lib/supabase';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'tel', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft },
  { value: 'select', label: 'Dropdown', icon: ChevronDown },
];

function FieldTypeIcon({ type }: { type: string }) {
  const found = FIELD_TYPES.find(t => t.value === type);
  if (!found) return <Type className="w-4 h-4" />;
  const Icon = found.icon;
  return <Icon className="w-4 h-4" />;
}

export default function AdminForms() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'settings'>('builder');
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [fieldsRes, settingsRes] = await Promise.all([
      supabase.from('form_fields').select('*').order('display_order'),
      supabase.from('form_settings').select('*').maybeSingle(),
    ]);
    if (fieldsRes.data) setFields(fieldsRes.data);
    if (settingsRes.data) setSettings(settingsRes.data);
    setLoading(false);
  }

  function addField() {
    const newField: FormField = {
      id: `new-${Date.now()}`,
      label: 'New Field',
      field_type: 'text',
      placeholder: '',
      required: false,
      options: [],
      display_order: fields.length + 1,
      created_at: new Date().toISOString(),
    };
    setFields(prev => [...prev, newField]);
    setExpandedField(newField.id);
  }

  function removeField(id: string) {
    setFields(prev => prev.filter(f => f.id !== id));
    if (expandedField === id) setExpandedField(null);
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function updateSettings(patch: Partial<FormSettings>) {
    setSettings(prev => prev ? { ...prev, ...patch } : prev);
  }

  function handleDragStart(id: string) {
    setDragging(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOver(id);
  }

  function handleDrop(targetId: string) {
    if (!dragging || dragging === targetId) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    const from = fields.findIndex(f => f.id === dragging);
    const to = fields.findIndex(f => f.id === targetId);
    const reordered = [...fields];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setFields(reordered.map((f, i) => ({ ...f, display_order: i + 1 })));
    setDragging(null);
    setDragOver(null);
  }

  async function save() {
    setSaving(true);
    try {
      // Upsert settings
      if (settings) {
        await supabase.from('form_settings').upsert({
          ...settings,
          updated_at: new Date().toISOString(),
        });
      }

      // Get existing DB field IDs
      const { data: existing } = await supabase.from('form_fields').select('id');
      const existingIds = new Set((existing ?? []).map(r => r.id));

      const newFields = fields.filter(f => f.id.startsWith('new-'));
      const updatedFields = fields.filter(f => !f.id.startsWith('new-'));
      const deletedIds = [...existingIds].filter(id => !updatedFields.some(f => f.id === id));

      if (deletedIds.length > 0) {
        await supabase.from('form_fields').delete().in('id', deletedIds);
      }

      if (updatedFields.length > 0) {
        await supabase.from('form_fields').upsert(
          updatedFields.map((f, i) => ({ ...f, display_order: i + 1 }))
        );
      }

      if (newFields.length > 0) {
        const toInsert = newFields.map(({ id: _id, created_at: _ca, ...rest }, i) => ({
          ...rest,
          display_order: updatedFields.length + i + 1,
        }));
        await supabase.from('form_fields').insert(toInsert);
      }

      await load();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Form Builder</h1>
          <p className="text-gray-500 text-sm mt-1">Customize the "Get Started" form shown to clients</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60"
        >
          {success ? (
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : (
            <><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'builder' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Eye className="w-4 h-4" /> Form Fields
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Settings2 className="w-4 h-4" /> Form Settings
        </button>
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(field.id)}
              onDragOver={e => handleDragOver(e, field.id)}
              onDrop={() => handleDrop(field.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                dragOver === field.id ? 'border-teal-400 shadow-md' : 'border-gray-200'
              } ${dragging === field.id ? 'opacity-40' : ''}`}
            >
              {/* Field Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
              >
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab flex-shrink-0" />
                <span className="text-gray-400 flex-shrink-0">
                  <FieldTypeIcon type={field.field_type} />
                </span>
                <span className="font-medium text-gray-800 text-sm flex-1 truncate">{field.label || 'Untitled Field'}</span>
                {field.required && (
                  <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Required</span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0">{FIELD_TYPES.find(t => t.value === field.field_type)?.label}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeField(field.id); }}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Field Editor */}
              {expandedField === field.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Field Type</label>
                      <select
                        value={field.field_type}
                        onChange={e => updateField(field.id, { field_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                      >
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Placeholder Text</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={e => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                    />
                  </div>
                  {field.field_type === 'select' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Options (one per line)</label>
                      <textarea
                        value={(field.options ?? []).join('\n')}
                        onChange={e => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-9 h-5 rounded-full transition-colors ${field.required ? 'bg-teal-500' : 'bg-gray-200'}`} />
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-4' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <ToggleLeft className="w-4 h-4 text-gray-400" /> Required field
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Field
          </button>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="space-y-5 bg-white border border-gray-200 rounded-xl p-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Notification Email</label>
            <p className="text-xs text-gray-400 mb-2">Form submissions will be forwarded to this address.</p>
            <input
              type="email"
              value={settings.notification_email}
              onChange={e => updateSettings({ notification_email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="you@yourdomain.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Form Title</label>
            <input
              type="text"
              value={settings.form_title}
              onChange={e => updateSettings({ form_title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Form Description</label>
            <textarea
              value={settings.form_description}
              onChange={e => updateSettings({ form_description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Submit Button Label</label>
            <input
              type="text"
              value={settings.submit_button_label}
              onChange={e => updateSettings({ submit_button_label: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Success Message</label>
            <input
              type="text"
              value={settings.success_message}
              onChange={e => updateSettings({ success_message: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
