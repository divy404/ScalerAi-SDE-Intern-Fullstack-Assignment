'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

function ConfirmationContent({ params }) {
  const { username, slug } = params;
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return setLoading(false);
    api.get(`/bookings/${bookingId}`)
      .then(r => setBooking(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're scheduled!</h1>
        <p className="text-gray-500 text-sm mb-6">A confirmation has been sent to your email.</p>

        {booking && (
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <svg width="16" height="16" className="mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <div>
                <p className="text-xs text-gray-400">Date & time</p>
                <p className="text-sm font-semibold text-gray-800">
                  {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(booking.startTime), 'h:mm a')} – {format(new Date(booking.endTime), 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg width="16" height="16" className="mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-semibold text-gray-800">{booking.eventType?.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg width="16" height="16" className="mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <div>
                <p className="text-xs text-gray-400">Invitee</p>
                <p className="text-sm font-semibold text-gray-800">{booking.inviteeName}</p>
                <p className="text-sm text-gray-500">{booking.inviteeEmail}</p>
              </div>
            </div>

            {booking.eventType && (
              <div className="flex items-start gap-3">
                <svg width="16" height="16" className="mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Event type</p>
                  <p className="text-sm font-semibold text-gray-800">{booking.eventType.name}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Link href={`/${username}`}
          className="btn-secondary inline-block w-full text-center">
          Back to scheduling page
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmedPage({ params }) {
  return (
    <Suspense>
      <ConfirmationContent params={params} />
    </Suspense>
  );
}
