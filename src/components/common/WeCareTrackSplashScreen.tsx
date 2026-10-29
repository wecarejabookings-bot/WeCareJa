import React, { useEffect, useState } from 'react';
import { WeCareTrackLogo } from './WeCareTrackLogo';

interface WeCareTrackSplashScreenProps {
  onDismiss?: () => void;
  minDurationMs?: number;
}

export const WeCareTrackSplashScreen: React.FC<WeCareTrackSplashScreenProps> = ({
  onDismiss,
  minDurationMs = 1800
}) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const dismissTimer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 400);
      return () => clearTimeout(dismissTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center p-8 max-w-md w-full">
        {/* Animated Icon Card with Soft Shadow */}
        <div className="relative mb-6 transform transition-all duration-700 animate-fadeIn">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/15 border border-slate-100 p-2 bg-white flex items-center justify-center">
            <img
              src="/app-icon-1024.png"
              alt="WeCare Track Jamaica"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Subtle Heartbeat Pulse Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-[#3B82F6] animate-ping opacity-25 pointer-events-none" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2 text-center animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1E4E] flex items-center justify-center gap-1.5">
            <span>WeCare</span>
            <span className="text-[#F59E0B]">Track</span>
            <span>Jamaica</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-6 bg-[#3B82F6]" />
            <p className="text-xs font-bold tracking-[0.25em] text-[#3B82F6] uppercase">
              HOME NURSING
            </p>
            <div className="h-[2px] w-6 bg-[#3B82F6]" />
          </div>
          <p className="text-[11px] text-slate-500 pt-1 font-medium">
            Professional Home Nursing at Your Doorstep
          </p>
        </div>

        {/* EKG Live Line Visual Indicator */}
        <div className="w-48 h-8 mt-6 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 40" fill="none" className="w-full h-full">
            <path
              d="M 0 20 L 50 20 L 60 10 L 70 32 L 85 4 L 100 36 L 110 20 L 200 20"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Skip button for user convenience */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-4 cursor-pointer"
          >
            Skip to App
          </button>
        )}
      </div>
    </div>
  );
};
