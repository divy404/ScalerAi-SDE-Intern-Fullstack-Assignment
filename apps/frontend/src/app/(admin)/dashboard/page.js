'use client';
import { useState, useEffect } from 'react';
import { getEventTypes, getUser, createEventType, updateEventType, deleteEventType } from '@/lib/api';
import EventTypeCard from '@/components/EventTypeCard';
import EventTypeModal from '@/components/EventTypeModal';

export default function DashboardPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('alex');

  const load = async () => {
    try {
      const [data, user] = await Promise.all([getEventTypes(), getUser()]);
      setEventTypes(data);
      if (user?.username) setUsername(user.username);
    } catch {
      setError('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    try {
      await createEventType(data);
      setShowModal(false);
      load();
    } catch (err) {
      throw err; // Re-throw so the modal can display the error
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateEventType(editing.id, data);
      setEditing(null);
      load();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event type? This will also delete all associated bookings.')) return;
    try {
      await deleteEventType(id);
      load();
    } catch (err) {
      setError('Failed to delete event type: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleToggle = async (et) => {
    try {
      await updateEventType(et.id, { isActive: !et.isActive });
      load();
    } catch (err) {
      setError('Failed to update: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-8 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your scheduling links</p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Event Type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map(et => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              username={username}
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
