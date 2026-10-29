import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Booking, UserRole, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { VisitReminder30MinAlertModal } from './VisitReminder30MinAlertModal';
import { Bell, Clock, Radio, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

interface VisitReminderNotificationManagerProps {
  bookings: Booking[];
  currentRole: UserRole;
  currentUserId?: string;
  onTriggerNotification: (type: ActivityNotificationType, title: string, description: string) => void;
  onOpenChat?: (booking: Booking) => void;
}

const STORAGE_KEY = 'wecare_alerted_30min_visits_v1';

export const VisitReminderNotificationManager: React.FC<VisitReminderNotificationManagerProps> = ({
  bookings,
  currentRole,
  currentUserId,
  onTriggerNotification,
  onOpenChat
}) => {
  const [activeAlertBooking, setActiveAlertBooking] = useState<Booking | null>(null);
  const alertedBookingIdsRef = useRef<string[]>((() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })());

  // Keep latest props in refs to prevent dependency thrashing
  const bookingsRef = useRef(bookings);
  bookingsRef.current = bookings;
  const currentRoleRef = useRef(currentRole);
  currentRoleRef.current = currentRole;
  const onTriggerNotificationRef = useRef(onTriggerNotification);
  onTriggerNotificationRef.current = onTriggerNotification;

  // Check bookings for 30-minute threshold safely
  const checkUpcomingVisits = useCallback(() => {
    const now = Date.now();
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    const currentBookings = bookingsRef.current;
    const alertedIds = alertedBookingIdsRef.current;

    for (const booking of currentBookings) {
      // Only active / accepted / en_route bookings
      if (['accepted', 'scheduled', 'en_route', 'in_progress'].includes(booking.status)) {
        const scheduledTime = new Date(booking.scheduledDateTime).getTime();
        const diffMs = scheduledTime - now;

        // Check if within 30-minute pre-visit window (0 to 30 minutes before)
        if (diffMs > 0 && diffMs <= THIRTY_MINUTES_MS) {
          if (!alertedIds.includes(booking.id)) {
            // Mark as alerted
            const updated = [...alertedIds, booking.id];
            alertedBookingIdsRef.current = updated;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}

            // 1. Play harmonic 30-min reminder chime & native Web Notification
            const alertTitle = `⏰ 30-Minute Visit Reminder: ${booking.serviceName}`;
            const alertBody = currentRoleRef.current === 'nurse'
              ? `Scheduled visit with patient ${booking.clientName} begins in ~30 minutes at ${booking.clientAddress}, ${booking.zone}.`
              : `Nurse ${booking.nurseName} is scheduled to arrive at your home in ~30 minutes.`;

            soundFX.triggerNotification(alertTitle, alertBody, 'visit_reminder_30min');

            // 2. Add to Activity Stream
            onTriggerNotificationRef.current?.('visit_reminder_30min', alertTitle, alertBody);

            // 3. Open in-app high priority modal
            setActiveAlertBooking(booking);
            break; // trigger one at a time
          }
        }
      }
    }
  }, []);

  // Periodic interval check every 15 seconds
  useEffect(() => {
    checkUpcomingVisits();
    const interval = setInterval(checkUpcomingVisits, 15000);
    return () => clearInterval(interval);
  }, [checkUpcomingVisits]);

  // Expose global test trigger helper on window for dev/demo
  useEffect(() => {
    (window as any).__triggerWeCare30MinReminderTest = () => {
      const sampleBooking = bookings[0] || {
        id: 'BK-TEST-30MIN',
        serviceId: 'srv-1',
        serviceName: 'Wound Dressing & Post-Op Care',
        clientId: 'cli-test',
        clientName: 'Patricia Sutherland',
        clientPhone: '+1 (876) 555-8833',
        clientAddress: '14 Trafalgar Road, Kingston 5',
        zone: 'New Kingston',
        nurseId: 'nurse-registered',
        nurseName: 'Registered Home Nurse, RN',
        nursePhoto: 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400',
        nursePhone: '+1 (876) 555-3829',
        scheduledDateTime: new Date(Date.now() + 29 * 60000).toISOString(),
        status: 'accepted',
        priceJMD: 7500,
        notes: '30-minute reminder test notification'
      };

      const title = `⏰ 30-Minute Visit Reminder: ${sampleBooking.serviceName}`;
      const desc = `Practitioner arrival alert for ${sampleBooking.clientName} in ${sampleBooking.zone}.`;
      soundFX.triggerNotification(title, desc, 'visit_reminder_30min');
      onTriggerNotification('visit_reminder_30min', title, desc);
      setActiveAlertBooking(sampleBooking as any);
    };

    return () => {
      delete (window as any).__triggerWeCare30MinReminderTest;
    };
  }, [bookings, onTriggerNotification]);

  return (
    <>
      <VisitReminder30MinAlertModal
        isOpen={!!activeAlertBooking}
        booking={activeAlertBooking}
        onClose={() => setActiveAlertBooking(null)}
        currentRole={currentRole}
        onOpenChat={onOpenChat}
      />
    </>
  );
};
