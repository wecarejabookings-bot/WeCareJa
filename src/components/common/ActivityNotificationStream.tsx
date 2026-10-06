import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Navigation, 
  DollarSign, 
  Star, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Radio, 
  X, 
  Filter, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ActivityNotificationItem, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface ActivityNotificationStreamProps {
  notifications?: ActivityNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onSelectBooking?: (bookingId: string) => void;
  currentRole: 'client' | 'nurse' | 'admin';
}

export const ActivityNotificationStream: React.FC<ActivityNotificationStreamProps> = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  onSelectBooking,
  currentRole
}) => {
  const [filter, setFilter] = useState<'all' | 'bookings' | 'routes' | 'payments' | 'alerts'>('all');
  const [browserPermissionGranted, setBrowserPermissionGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const handleRequestPermission = async () => {
    const granted = await soundFX.requestNotificationPermission();
    setBrowserPermissionGranted(granted);
    if (granted) {
      soundFX.triggerNotification(
        'WeCare Notifications Activated 🔔',
        'You will now receive sound alerts and updates for bookings, route transit, and nurse visits.',
        'booking_confirmed'
      );
    }
  };

  const filteredNotifications = (notifications || []).filter(item => {
    if (item.targetRole !== 'all' && item.targetRole !== currentRole) return false;
    
    if (filter === 'bookings') {
      return item.type === 'booking_request' || item.type === 'booking_confirmed' || item.type === 'cancellation';
    }
    if (filter === 'routes') {
      return item.type === 'nurse_enroute';
    }
    if (filter === 'payments') {
      return item.type === 'payment_confirmed';
    }
    if (filter === 'alerts') {
      return item.type === 'nurse_late' || item.type === 'time_up' || item.type === 'rating_received' || item.type === 'health_news';
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const playNotificationSound = (type: ActivityNotificationType) => {
    switch (type) {
      case 'booking_confirmed':
        soundFX.playBookingConfirmed();
        break;
      case 'booking_request':
        soundFX.playBookingRequest();
        break;
      case 'nurse_enroute':
        soundFX.playNurseEnRoute();
        break;
      case 'payment_confirmed':
        soundFX.playPaymentConfirmed();
        break;
      case 'rating_received':
        soundFX.playRatingReceived();
        break;
      case 'nurse_late':
        soundFX.playNurseLateAlert();
        break;
      case 'time_up':
        soundFX.playNurseTimeUp();
        break;
      case 'chat_message':
        soundFX.playChatMessage();
        break;
      case 'incoming_call':
        soundFX.playIncomingCall();
        break;
      case 'cancellation':
        soundFX.playCancellation();
        break;
      case 'health_news':
        soundFX.playHealthNews();
        break;
      case 'visit_reminder_30min':
        soundFX.play30MinReminder();
        break;
      default:
        soundFX.playSuccessPing();
        break;
    }
  };

  const getNotificationIcon = (type: ActivityNotificationType) => {
    switch (type) {
      case 'visit_reminder_30min':
        return <Clock className="w-4 h-4 text-amber-300 animate-pulse" />;
      case 'booking_confirmed':
      case 'booking_request':
        return <Calendar className="w-4 h-4 text-[#C77DFF]" />;
      case 'nurse_enroute':
        return <Navigation className="w-4 h-4 text-cyan-400" />;
      case 'payment_confirmed':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'rating_received':
        return <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />;
      case 'nurse_late':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'time_up':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'chat_message':
        return <MessageSquare className="w-4 h-4 text-purple-300" />;
      case 'cancellation':
        return <X className="w-4 h-4 text-rose-400" />;
      case 'health_news':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Bell className="w-4 h-4" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Live Activity Notifications</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Audio Synthesizer Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Real-time alerts with synthesized sound for bookings &amp; visits</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {!browserPermissionGranted && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              title="Allow notifications so you hear updates even when switching browser tabs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enable System Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-black/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#7209B7] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All Activity ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('bookings')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'bookings'
              ? 'bg-[#7209B7] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3 h-3 text-[#C77DFF]" />
          <span>Bookings</span>
        </button>

        <button
          onClick={() => setFilter('routes')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'routes'
              ? 'bg-[#7209B7] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>En-Route Transit</span>
        </button>

        <button
          onClick={() => setFilter('payments')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'payments'
              ? 'bg-[#7209B7] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3 h-3 text-emerald-400" />
          <span>Payments &amp; Escrow</span>
        </button>

        <button
          onClick={() => setFilter('alerts')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            filter === 'alerts'
              ? 'bg-[#7209B7] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Timers &amp; Ratings</span>
        </button>
      </div>

      {/* Stream List */}
      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-purple-400/40 mx-auto" />
            <p className="text-xs">No notifications in this category yet.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                playNotificationSound(item.type);
                if (item.bookingId && onSelectBooking) {
                  onSelectBooking(item.bookingId);
                }
              }}
              className={`p-4 transition flex items-start gap-3.5 cursor-pointer hover:bg-white/5 group ${
                !item.read ? 'bg-purple-900/15' : ''
              }`}
            >
              {/* Icon */}
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                {getNotificationIcon(item.type)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-200 transition">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {item.timestamp}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#E63946] shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playNotificationSound(item.type);
                    }}
                    className="text-[10px] font-bold text-purple-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 transition"
                  >
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Replay Chime</span>
                  </button>

                  {item.bookingId && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span>Booking: #{item.bookingId}</span>
                      <ChevronRight className="w-3 h-3 text-purple-400" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info banner */}
      <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Background sound alerts keep you updated even when multitasking</span>
        </div>
        <button
          onClick={onClearNotifications}
          className="text-slate-400 hover:text-rose-300 text-[10px] font-bold underline transition"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};
