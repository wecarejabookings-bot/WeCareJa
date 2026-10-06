import React from 'react';
import { ActivityNotificationItem, ActivityNotificationType } from '../../types';
import { ActivityNotificationStream } from './ActivityNotificationStream';
import { Bell, X } from 'lucide-react';

interface ActivityNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ActivityNotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  onTriggerDemoAlert?: (type: ActivityNotificationType, title: string, message: string) => void;
  currentRole?: 'client' | 'nurse' | 'admin';
}

export const ActivityNotificationModal: React.FC<ActivityNotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearAll = () => {},
  currentRole = 'client'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0416]/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7209B7]/30 text-[#C77DFF] border border-purple-500/30 shadow-lg shadow-purple-900/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Activity Stream &amp; Alerts</h2>
              <p className="text-xs text-slate-400">Real-time alerts with synthesized chime &amp; background push</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Stream */}
        <div className="flex-1 overflow-y-auto pr-1">
          <ActivityNotificationStream
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearNotifications={onClearAll}
            currentRole={currentRole}
          />
        </div>
      </div>
    </div>
  );
};
