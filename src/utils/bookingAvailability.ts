import { Booking, NurseProfile } from '../types';

export interface TimeSlotAvailability {
  isAvailable: boolean;
  conflictingBooking?: Booking;
  conflictReason?: string;
  conflictingTimeRange?: string;
  nextAvailableTime?: string;
  suggestedTimes: string[];
}

/**
 * Checks if a specific nurse has any booking overlapping with the requested start time and duration.
 * Includes an optional buffer for transit, preparation, and sanitization between clients.
 */
export function checkNurseBookingConflict(
  nurseId: string,
  requestedDateStr: string, // YYYY-MM-DD
  requestedTimeStr: string, // HH:mm (24-hour)
  durationMinutes: number = 60,
  allBookings: Booking[] = [],
  bufferMinutes: number = 30
): TimeSlotAvailability {
  if (!nurseId || !requestedDateStr || !requestedTimeStr) {
    return {
      isAvailable: true,
      suggestedTimes: ['09:00', '11:00', '14:00', '16:00', '18:00']
    };
  }

  // Parse requested time window
  const reqStart = new Date(`${requestedDateStr}T${requestedTimeStr}:00`).getTime();
  if (isNaN(reqStart)) {
    return {
      isAvailable: true,
      suggestedTimes: ['09:00', '11:00', '14:00', '16:00']
    };
  }

  const reqEnd = reqStart + durationMinutes * 60 * 1000;
  // Apply buffer window for transit/preparation
  const reqStartWithBuffer = reqStart - (bufferMinutes * 60 * 1000) / 2;
  const reqEndWithBuffer = reqEnd + (bufferMinutes * 60 * 1000) / 2;

  // Filter active bookings for this nurse
  const activeBookings = (allBookings || []).filter((b) => {
    if (!b || b.nurseId !== nurseId) return false;
    // Only count active, accepted, en_route, or in_progress bookings
    return ['requested', 'accepted', 'en_route', 'in_progress'].includes(b.status);
  });

  // Check for any overlapping booking
  let conflictingBooking: Booking | undefined;

  for (const b of activeBookings) {
    const bStart = new Date(b.scheduledDateTime).getTime();
    if (isNaN(bStart)) continue;

    const bDuration = b.baseDurationMinutes || 60;
    const bEnd = bStart + bDuration * 60 * 1000;

    // Check if the requested window intersects with existing booking (+ transit buffer)
    const bStartBuffered = bStart - bufferMinutes * 30 * 1000;
    const bEndBuffered = bEnd + bufferMinutes * 30 * 1000;

    const hasOverlap = Math.max(reqStart, bStartBuffered) < Math.min(reqEnd, bEndBuffered);

    if (hasOverlap) {
      conflictingBooking = b;
      break;
    }
  }

  // Generate suggested available slots for that day
  const candidateTimes = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
  const suggestedTimes: string[] = [];

  for (const t of candidateTimes) {
    const candStart = new Date(`${requestedDateStr}T${t}:00`).getTime();
    const candEnd = candStart + durationMinutes * 60 * 1000;

    const conflict = activeBookings.some((b) => {
      const bStart = new Date(b.scheduledDateTime).getTime();
      const bEnd = bStart + (b.baseDurationMinutes || 60) * 60 * 1000;
      return Math.max(candStart, bStart) < Math.min(candEnd, bEnd + bufferMinutes * 60 * 1000);
    });

    if (!conflict && t !== requestedTimeStr) {
      suggestedTimes.push(t);
    }
  }

  if (conflictingBooking) {
    const bStartDate = new Date(conflictingBooking.scheduledDateTime);
    const startFmt = bStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bEndDate = new Date(bStartDate.getTime() + (conflictingBooking.baseDurationMinutes || 60) * 60000);
    const endFmt = bEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const rangeStr = `${startFmt} – ${endFmt}`;
    return {
      isAvailable: false,
      conflictingBooking,
      conflictingTimeRange: rangeStr,
      conflictReason: `Nurse is booked for ${conflictingBooking.serviceName} (${rangeStr} in ${conflictingBooking.zone}).`,
      nextAvailableTime: (suggestedTimes || [])[0] || undefined,
      suggestedTimes: (suggestedTimes || []).slice(0, 4)
    };
  }

  return {
    isAvailable: true,
    suggestedTimes: (suggestedTimes || []).slice(0, 4)
  };
}

/**
 * Returns a list of all booked time intervals for a given nurse on a specific date.
 */
export function getNurseScheduleForDate(
  nurseId: string,
  dateStr: string,
  allBookings: Booking[] = []
): {
  id: string;
  serviceName: string;
  startHourMinutes: string;
  endHourMinutes: string;
  status: string;
  zone: string;
  durationMinutes: number;
}[] {
  const targetDatePrefix = dateStr;

  return (allBookings || [])
    .filter((b) => {
      if (!b || b.nurseId !== nurseId) return false;
      if (!['requested', 'accepted', 'en_route', 'in_progress', 'completed'].includes(b.status)) return false;
      const bDate = (b.scheduledDateTime || '').split('T')[0];
      return bDate === targetDatePrefix;
    })
    .map((b) => {
      const start = new Date(b.scheduledDateTime || Date.now());
      const duration = b.baseDurationMinutes || 60;
      const end = new Date(start.getTime() + duration * 60000);

      return {
        id: b.id,
        serviceName: b.serviceName || 'Home Visit',
        startHourMinutes: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endHourMinutes: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: b.status,
        zone: b.zone || 'Kingston',
        durationMinutes: duration
      };
    })
    .sort((a, b) => a.startHourMinutes.localeCompare(b.startHourMinutes));
}
