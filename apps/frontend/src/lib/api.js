import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Event Types ──────────────────────────────────────
export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const createEventType = (data) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`).then(r => r.data);

// ── Availability ─────────────────────────────────────
export const getAvailability = () => api.get('/availability').then(r => r.data);
export const getUser = () => api.get('/availability/user').then(r => r.data);
export const updateAvailability = (schedule) => api.put('/availability', { schedule }).then(r => r.data);
export const updateTimezone = (timezone) => api.put('/availability/timezone', { timezone }).then(r => r.data);

// ── Bookings (admin) ──────────────────────────────────
export const getBookings = (filter) => api.get(`/bookings?filter=${filter}`).then(r => r.data);
export const cancelBooking = (id, cancelReason) => api.patch(`/bookings/${id}/cancel`, { cancelReason }).then(r => r.data);

// ── Public booking ────────────────────────────────────
export const getPublicProfile = (username) => api.get(`/public/${username}`).then(r => r.data);
export const getPublicEvent = (username, slug) => api.get(`/public/${username}/${slug}`).then(r => r.data);
export const getSlots = (username, slug, date) => api.get(`/public/${username}/${slug}/slots?date=${date}`).then(r => r.data);
export const createBooking = (username, slug, data) => api.post(`/public/${username}/${slug}/book`, data).then(r => r.data);

export default api;
