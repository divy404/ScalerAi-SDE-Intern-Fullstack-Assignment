'use client';
import { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '@/lib/api';
import { format } from 'date-fns';

function MeetingRow({ booking, onCancel }) {
  const { eventType, inviteeName, inviteeEmail, startTime, endTime, timezone, status } = booking;
  const start = new Date(startTime);
  const isPast = start < new Date() || status === 'CANCELLED';

  return (
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors">
      {/* Color dot + Date/time */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: eventType?.color || '#0069ff' }} />
        <div className="w-40 flex-shrink-0">
          <p className="text-sm font-medium text-gray-800">{format(start, 'EEE, MMM d')}</p>
          <p className="text-xs text-gray-400">{format(start, 'h:mm a')} – {format(new Date(endTime), 'h:mm a')}</p>
        </div>
      </div>

      {/* Meeting info */}
      <div className="flex-1 min-w-0 pl-5 sm:pl-0">
        <p className="text-sm font-medium text-gray-800 truncate">{eventType?.name}</p>
        <p className="text-xs text-gray-500">{inviteeName} · {inviteeEmail}</p>
      </div>

      {/* Status + action */}
      <div className="flex items-center gap-3 pl-5 sm:pl-0">
        {status === 'CANCELLED' ? (
          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">Cancelled</span>
        ) : isPast ? (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Completed</span>
        ) : (
          <>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">Confirmed</span>
            <button onClick={() => onCancel(booking.id)} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (filter) => {
    setLoading(true);
    setError('');
    try {
      const data = await getBookings(filter);
      setBookings(data);
    } catch {
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason === null) return; // User clicked Cancel on prompt
    try {
      await cancelBooking(id, reason);
      load(tab);
    } catch (err) {
      setError('Failed to cancel: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-8 pt-16 md:pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your scheduled meetings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['upcoming', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          {error}
        </div>
      )}

      <div className="card divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
            Loading meetings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No {tab} meetings</p>
          </div>
        ) : (
          bookings.map(b => <MeetingRow key={b.id} booking={b} onCancel={handleCancel} />)
        )}
      </div>
    </div>
  );
}
