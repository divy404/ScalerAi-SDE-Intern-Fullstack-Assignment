'use client';
import { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '@/lib/api';
import { format } from 'date-fns';

function MeetingRow({ booking, onCancel }) {
  const { eventType, inviteeName, inviteeEmail, startTime, endTime, timezone, status } = booking;
  const start = new Date(startTime);
  const isPast = start < new Date() || status === 'CANCELLED';

  return (
    <div className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      {/* Color dot */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: eventType?.color || '#0069ff' }} />

      {/* Date/time */}
      <div className="w-40 flex-shrink-0">
        <p className="text-sm font-medium text-gray-800">{format(start, 'EEE, MMM d')}</p>
        <p className="text-xs text-gray-400">{format(start, 'h:mm a')} – {format(new Date(endTime), 'h:mm a')}</p>
      </div>

      {/* Meeting info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{eventType?.name}</p>
        <p className="text-xs text-gray-500">{inviteeName} · {inviteeEmail}</p>
      </div>

      {/* Status + action */}
      <div className="flex items-center gap-3">
        {status === 'CANCELLED' ? (
          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">Cancelled</span>
        ) : isPast ? (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Completed</span>
        ) : (
          <>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">Confirmed</span>
            <button onClick={() => onCancel(booking.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
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

  const load = async (filter) => {
    setLoading(true);
    try {
      const data = await getBookings(filter);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    await cancelBooking(id, reason);
    load(tab);
  };

  return (
    <div className="p-8">
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

      <div className="card divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No {tab} meetings</p>
          </div>
        ) : (
          bookings.map(b => <MeetingRow key={b.id} booking={b} onCancel={handleCancel} />)
        )}
      </div>
    </div>
  );
}
