const { parseISO, addMinutes, isWithinInterval, format, startOfDay, endOfDay, getDay, parse } = require("date-fns");
const { toZonedTime, fromZonedTime } = require("date-fns-tz");

const DEFAULT_USER_TIMEZONE = "America/New_York";

/**
 * Generate available time slots for a given date, event type, and user
 * @param {Date} date - The date to generate slots for
 * @param {number} durationMins - Duration of the event type in minutes
 * @param {Array} availabilities - Array of availability records for the user
 * @param {Array} existingBookings - Array of confirmed bookings for that day
 * @param {string} userTimezone - The host's timezone
 * @returns {string[]} Array of available slot start times in ISO format (UTC)
 */
function generateAvailableSlots(date, durationMins, availabilities, existingBookings, userTimezone) {
  const tz = userTimezone || DEFAULT_USER_TIMEZONE;
  
  // Get the day of week in the host's timezone
  const zonedDate = toZonedTime(date, tz);
  const dayOfWeek = getDay(zonedDate); // 0=Sun, 6=Sat
  
  // Find availability for this day
  const dayAvailability = availabilities.find(
    (a) => a.dayOfWeek === dayOfWeek && a.isActive
  );
  
  if (!dayAvailability) return [];
  
  // Build the available window in the host's timezone
  const dateStr = format(zonedDate, "yyyy-MM-dd");
  const windowStart = fromZonedTime(
    parse(`${dateStr} ${dayAvailability.startTime}`, "yyyy-MM-dd HH:mm", new Date()),
    tz
  );
  const windowEnd = fromZonedTime(
    parse(`${dateStr} ${dayAvailability.endTime}`, "yyyy-MM-dd HH:mm", new Date()),
    tz
  );
  
  // Generate slots every `durationMins` minutes
  const slots = [];
  let cursor = windowStart;
  
  while (addMinutes(cursor, durationMins) <= windowEnd) {
    const slotEnd = addMinutes(cursor, durationMins);
    
    // Check if this slot conflicts with any existing booking
    const isBooked = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Overlap check: slot starts before booking ends AND slot ends after booking starts
      return cursor < bookingEnd && slotEnd > bookingStart;
    });
    
    // Only include future slots
    if (!isBooked && cursor > new Date()) {
      slots.push(cursor.toISOString());
    }
    
    cursor = addMinutes(cursor, durationMins);
  }
  
  return slots;
}

module.exports = { generateAvailableSlots };
