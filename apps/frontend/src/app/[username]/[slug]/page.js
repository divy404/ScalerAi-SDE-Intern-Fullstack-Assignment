'use client';
import { useState, useEffect } from 'react';
import { getPublicEvent, getSlots, createBooking } from '@/lib/api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, isToday, startOfToday } from 'date-fns';
import { useRouter } from 'next/navigation';

// ── Mini calendar ────────────────────────────────────────────────
function Calendar({ selectedDate, onSelect, availableDays }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = startOfToday();

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const startPad = getDay(startOfMonth(viewMonth));

  return (
    <div className="w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewMonth(m => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-800">{format(viewMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setViewMonth(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const past = isBefore(day, today);
          const todayMark = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          // Only show days where the user has set availability
          const dayOfWeek = getDay(day);
          const available = availableDays.includes(dayOfWeek);

          return (
            <button key={day.toISOString()} disabled={past || !available}
              onClick={() => onSelect(day)}
              className={`aspect-square rounded-full text-xs font-medium transition-all flex items-center justify-center relative
                ${selected ? 'bg-blue-600 text-white shadow-md'
                  : todayMark && available && !past ? 'ring-2 ring-blue-400 text-blue-600 font-bold hover:bg-blue-50'
                  : available && !past ? 'text-gray-800 hover:bg-blue-50 font-semibold'
                  : 'text-gray-300 cursor-not-allowed'}`}>
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Time slots ──────────────────────────────────────────────────
function TimeSlots({ slots, timezone, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-xs text-gray-400">Loading times...</p>
      </div>
    );
  }

  if (!slots) return null;

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs text-gray-400 mb-3">{timezone}</p>
      {slots.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No available times on this day</p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
          {slots.map(slot => {
            const time = format(new Date(slot), 'h:mm a');
            const selected = slot === selectedSlot;
            return (
              <button key={slot} onClick={() => onSelect(slot)}
                className={`w-full py-3 rounded-lg border text-sm font-medium transition-all ${selected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50'}`}>
                {time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Booking form ────────────────────────────────────────────────
function BookingForm({ slot, eventType, onSubmit, onBack, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email) return setError('Name and email are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email');
    setError('');
    onSubmit({ inviteeName: name, inviteeEmail: email, notes });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
      <h3 className="font-semibold text-gray-800 mb-1">Enter your details</h3>
      <p className="text-xs text-gray-400 mb-4">{format(new Date(slot), 'EEEE, MMMM d · h:mm a')}</p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Name *</label>
          <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea className="input resize-none" rows={2} placeholder="Anything to share?" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Scheduling...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function BookingPage({ params }) {
  const { username, slug } = params;
  const router = useRouter();

  const [eventData, setEventData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState('calendar'); // 'calendar' | 'form'
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Actual available days of the week from backend
  const [availableDays, setAvailableDays] = useState([]);

  useEffect(() => {
    getPublicEvent(username, slug).then(data => {
      setEventData(data);
      // Use actual available days from the backend
      setAvailableDays(data.availableDays || []);
    }).catch(() => setError('Event not found'));
  }, [username, slug]);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('calendar');
    setSlotsLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      const { slots: s } = await getSlots(username, slug, dateStr);
      setSlots(s);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleBook = async ({ inviteeName, inviteeEmail, notes }) => {
    setBookingLoading(true);
    try {
      const booking = await createBooking(username, slug, {
        inviteeName, inviteeEmail, notes,
        startTime: selectedSlot,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      router.push(`/${username}/${slug}/confirmed?bookingId=${booking.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed. This slot may no longer be available.');
      setStep('calendar');
    } finally {
      setBookingLoading(false);
    }
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">{error}</p>
    </div>
  );

  if (!eventData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  const { user, eventType } = eventData;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-3xl flex flex-col md:flex-row">

        {/* Left panel - event info */}
        <div className="w-full md:w-72 flex-shrink-0 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-100">
          <p className="text-xs text-gray-400 mb-1">{user.name}</p>
          <h2 className="font-bold text-gray-900 text-lg mb-3" style={{ color: eventType.color }}>{eventType.name}</h2>
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm text-gray-600">{eventType.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
              <path strokeLinecap="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-xs text-gray-500">{user.timezone}</span>
          </div>
          {eventType.description && (
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">{eventType.description}</p>
          )}

          {selectedDate && selectedSlot && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700">{format(new Date(selectedSlot), 'EEE, MMM d')}</p>
              <p className="text-sm font-semibold text-blue-800">{format(new Date(selectedSlot), 'h:mm a')}</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 p-6 sm:p-8">
          {step === 'calendar' ? (
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Calendar */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm">Select a date</h3>
                <Calendar
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  availableDays={availableDays}
                />
              </div>

              {/* Time slots - only shown when date selected */}
              {selectedDate && (slots !== null || slotsLoading) && (
                <div className="w-full sm:w-48">
                  <h3 className="font-semibold text-gray-800 mb-4 text-sm">
                    {format(selectedDate, 'EEE, MMM d')}
                  </h3>
                  <TimeSlots
                    slots={slots}
                    timezone={user.timezone}
                    selectedSlot={selectedSlot}
                    onSelect={handleSlotSelect}
                    loading={slotsLoading}
                  />
                </div>
              )}
            </div>
          ) : (
            <BookingForm
              slot={selectedSlot}
              eventType={eventType}
              onSubmit={handleBook}
              onBack={() => setStep('calendar')}
              loading={bookingLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
