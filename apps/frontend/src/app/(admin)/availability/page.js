'use client';
import { useState, useEffect } from 'react';
import { getAvailability, getUser, updateAvailability, updateTimezone } from '@/lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata',
  'Asia/Tokyo', 'Australia/Sydney',
];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

const DEFAULT_SCHEDULE = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  isActive: i >= 1 && i <= 5,
}));

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getAvailability(), getUser()]).then(([avail, user]) => {
      if (avail.length > 0) {
        const merged = DEFAULT_SCHEDULE.map(def => {
          const found = avail.find(a => a.dayOfWeek === def.dayOfWeek);
          return found ? { dayOfWeek: def.dayOfWeek, startTime: found.startTime, endTime: found.endTime, isActive: found.isActive } : def;
        });
        setSchedule(merged);
      }
      if (user?.timezone) setTimezone(user.timezone);
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (i) => {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, isActive: !d.isActive } : d));
  };

  const update = (i, field, value) => {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateAvailability(schedule),
        updateTimezone(timezone),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 text-sm mt-1">Set when you're available for meetings</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary min-w-[100px]">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {/* Timezone */}
      <div className="card p-5 mb-5">
        <label className="label">Timezone</label>
        <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)}>
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* Weekly schedule */}
      <div className="card divide-y divide-gray-100">
        {schedule.map((day, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {/* Toggle */}
            <button onClick={() => toggle(i)} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ background: day.isActive ? '#0069ff' : '#d1d5db' }}>
              <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                style={{ transform: `translateX(${day.isActive ? '18px' : '2px'})` }} />
            </button>

            {/* Day label */}
            <span className={`w-24 text-sm font-medium ${day.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
              {DAYS[day.dayOfWeek]}
            </span>

            {day.isActive ? (
              <div className="flex items-center gap-2 flex-1">
                <select className="input text-sm py-1.5" value={day.startTime}
                  onChange={e => update(i, 'startTime', e.target.value)}>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-gray-400 text-sm">–</span>
                <select className="input text-sm py-1.5" value={day.endTime}
                  onChange={e => update(i, 'endTime', e.target.value)}>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400 flex-1">Unavailable</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
