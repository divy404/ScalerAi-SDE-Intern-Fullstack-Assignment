'use client';
import { useState } from 'react';

const COLORS = ['#0069ff', '#7c3aed', '#059669', '#dc2626', '#d97706', '#db2777', '#0891b2'];
const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function EventTypeModal({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    slug: initial?.slug || '',
    duration: initial?.duration || 30,
    description: initial?.description || '',
    color: initial?.color || '#0069ff',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.slug) return setError('Name and slug are required');
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">{initial ? 'Edit Event Type' : 'New Event Type'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Event name</label>
            <input className="input" placeholder="e.g. 30 Minute Meeting" value={form.name}
              onChange={e => { set('name', e.target.value); if (!initial) set('slug', autoSlug(e.target.value)); }} />
          </div>

          <div>
            <label className="label">URL slug</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">/</span>
              <input className="flex-1 px-3 py-2 text-sm outline-none" placeholder="30min" value={form.slug}
                onChange={e => set('slug', autoSlug(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="label">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.duration === d ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  onClick={() => set('duration', d)}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="What is this event about?"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ background: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
