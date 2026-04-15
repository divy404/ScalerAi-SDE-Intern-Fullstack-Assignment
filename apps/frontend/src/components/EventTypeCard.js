'use client';

export default function EventTypeCard({ eventType, onEdit, onDelete, onToggle }) {
  const { name, duration, slug, description, color, isActive } = eventType;
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/alex/${slug}`;

  const copy = () => navigator.clipboard.writeText(bookingUrl);

  return (
    <div className={`card p-5 flex flex-col gap-3 transition-opacity ${!isActive ? 'opacity-60' : ''}`}>
      {/* Color bar */}
      <div className="h-1 rounded-full w-12" style={{ background: color }} />

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs text-gray-400">{duration} min</span>
        </div>
        {description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>}
      </div>

      {/* Link */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-500 truncate flex-1">/{slug}</span>
        <button onClick={copy} className="text-gray-400 hover:text-blue-600 transition-colors" title="Copy link">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button onClick={onToggle}
          className={`text-xs font-medium px-2 py-1 rounded ${isActive ? 'text-gray-500 hover:text-gray-700' : 'text-blue-600 hover:text-blue-700'}`}>
          {isActive ? 'Disable' : 'Enable'}
        </button>
        <button onClick={onEdit} className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded">Edit</button>
        <button onClick={onDelete} className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1 rounded ml-auto">Delete</button>
      </div>
    </div>
  );
}
