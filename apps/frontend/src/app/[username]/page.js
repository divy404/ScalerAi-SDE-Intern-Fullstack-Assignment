'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublicProfile } from '@/lib/api';

export default function PublicProfilePage({ params }) {
  const { username } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicProfile(username).then(setData).catch(() => setError('User not found'));
  }, [username]);

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <p className="text-sm text-gray-400 mt-1">The profile you're looking for doesn't exist</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  const { user, eventTypes } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-md">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Select an event to schedule</p>
        </div>

        {/* Event types */}
        <div className="space-y-3">
          {eventTypes.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-sm">No event types available</p>
            </div>
          ) : (
            eventTypes.map(et => (
              <Link key={et.id} href={`/${username}/${et.slug}`}
                className="card p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer block group">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: et.color }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{et.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs text-gray-400">{et.duration} min</span>
                  </div>
                  {et.description && <p className="text-xs text-gray-500 mt-1 truncate">{et.description}</p>}
                </div>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2} className="flex-shrink-0 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            ))
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Powered by Schedulr</p>
      </div>
    </div>
  );
}
