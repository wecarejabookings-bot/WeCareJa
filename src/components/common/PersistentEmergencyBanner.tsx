import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, Maximize2, CheckCircle2 } from 'lucide-react';
import { EmergencySOSData } from './FullScreenEmergencySOSOverlay';

interface PersistentEmergencyBannerProps {
  emergencyData: EmergencySOSData | null;
  onMaximize: () => void;
  onResolve?: () => void;
}

export const PersistentEmergencyBanner: React.FC<PersistentEmergencyBannerProps> = ({
  emergencyData,
  onMaximize,
  onResolve
}) => {
  if (!emergencyData || emergencyData.status === 'resolved') return null;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white border-b-2 border-yellow-400 px-4 py-2.5 shadow-2xl animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-yellow-400 text-slate-950 font-black">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-yellow-300 uppercase tracking-wide mr-2">
              🚨 119 EMERGENCY SOS ACTIVE:
            </span>
            <span className="font-bold text-white">
              {emergencyData.clientName} ({emergencyData.clientAddress}, {emergencyData.zone})
            </span>
            <span className="text-red-100 hidden sm:inline ml-2 text-[11px]">
              • Triggered by {emergencyData.triggererName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:119"
            className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-[11px] transition flex items-center gap-1 shadow"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call 119</span>
          </a>

          <button
            type="button"
            onClick={onMaximize}
            className="px-3 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/30 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-yellow-300" />
            <span>Open Full-Screen Console</span>
          </button>

          {onResolve && (
            <button
              type="button"
              onClick={onResolve}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>Stand Down</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
