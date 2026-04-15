'use client';
import { useState, useEffect } from 'react';
import { getEventTypes, createEventType, updateEventType, deleteEventType } from '@/lib/api';
import EventTypeCard from '@/components/EventTypeCard';
import EventTypeModal from '@/components/EventTypeModal';

export default function DashboardPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await getEventTypes();
      setEventTypes(data);
    } catch {
      setError('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    await createEventType(data);
    setShowModal(false);
    load();
  };

  const handleEdit = async (data) => {
    await updateEventType(editing.id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event type?')) return;
    await deleteEventType(id);
    load();
  };

  const handleToggle = async (et) => {
    await updateEventType(et.id, { isActive: !et.isActive });
    load();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your scheduling links</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Event Type
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card p-5 h-40 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#0069ff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No event types yet</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first event type to start accepting bookings</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Create Event Type</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map(et => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              onEdit={() => setEditing(et)}
              onDelete={() => handleDelete(et.id)}
              onToggle={() => handleToggle(et)}
            />
          ))}
        </div>
      )}

      {(showModal || editing) && (
        <EventTypeModal
          initial={editing}
          onSubmit={editing ? handleEdit : handleCreate}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
