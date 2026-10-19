import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  Radio,
  MapPin,
  ShieldAlert,
  Share2,
  Check,
  Clock,
  Sparkles,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  LocateFixed,
  FastForward,
  UserCheck
} from 'lucide-react';
import {
  aiEmergencyVoice,
  buildPoliceVoiceEmergencyScript,
  EmergencyVoiceScriptParams
} from '../../services/aiEmergencyVoiceService';
import { formatCoordinates } from '../../utils/locationDetector';

export interface AIEmergencyVoicePoliceDispatchProps {
  userRole: 'client' | 'nurse' | 'admin';
  userName?: string;
  lat: number | null;
  lng: number | null;
  address?: string;
  nearestStationName?: string;
  nearestStationPhone?: string;
  nearestStationDistanceKm?: number;
  autoStartCountdown?: boolean;
  onVoiceStarted?: () => void;
  onVoiceEnded?: () => void;
  compactMode?: boolean;
}

export const AIEmergencyVoicePoliceDispatch: React.FC<AIEmergencyVoicePoliceDispatchProps> = ({
  userRole,
  userName,
  lat,
  lng,
  address = 'Kingston & St. Andrew Corridor, Jamaica',
  nearestStationName,
  nearestStationPhone,
  nearestStationDistanceKm,
  autoStartCountdown = true,
  onVoiceStarted,
  onVoiceEnded,
  compactMode = false
}) => {
  // Fallback to Jamaica central coordinates if not provided yet
  const effectiveLat = lat ?? 18.0179;
  const effectiveLng = lng ?? -76.8099;

  // Countdown state: 30 seconds
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(autoStartCountdown);
  const [isCanceledByUser, setIsCanceledByUser] = useState<boolean>(false);

  // Speech playback state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState<boolean>(false);
  const [spokenCharIndex, setSpokenCharIndex] = useState<number>(0);
  const [preferredVoice, setPreferredVoice] = useState<'female' | 'male'>('female');
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [autoRepeatEnabled, setAutoRepeatEnabled] = useState<boolean>(true);

  // Audio visualization simulation
  const [audioMeter, setAudioMeter] = useState<number[]>([20, 45, 75, 90, 60, 40, 70, 85, 30, 65, 80, 50]);

  const scriptData = useMemo(() => {
    return buildPoliceVoiceEmergencyScript({
      userRole,
      userName,
      lat: effectiveLat,
      lng: effectiveLng,
      address,
      nearestStationName,
      nearestStationDistanceKm
    });
  }, [userRole, userName, effectiveLat, effectiveLng, address, nearestStationName, nearestStationDistanceKm]);

  // Audio visualizer ticker when speaking
  useEffect(() => {
    if (!isSpeaking) return;
    const interval = setInterval(() => {
      setAudioMeter([
        Math.floor(Math.random() * 80 + 20),
        Math.floor(Math.random() * 90 + 10),
        Math.floor(Math.random() * 95 + 15),
        Math.floor(Math.random() * 85 + 25),
        Math.floor(Math.random() * 90 + 20),
        Math.floor(Math.random() * 75 + 15),
        Math.floor(Math.random() * 95 + 20),
        Math.floor(Math.random() * 85 + 15),
        Math.floor(Math.random() * 70 + 20),
        Math.floor(Math.random() * 90 + 25),
        Math.floor(Math.random() * 80 + 15),
        Math.floor(Math.random() * 65 + 20)
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Countdown timer: 30 seconds down to 0
  useEffect(() => {
    if (!isCountdownActive || isCanceledByUser || isSpeaking || hasCompletedOnce) return;

    if (secondsLeft <= 0) {
      // 30 seconds elapsed and user unable to speak -> trigger AI voice automatically!
      setIsCountdownActive(false);
      handleTriggerAIVoiceDispatch();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, isCountdownActive, isCanceledByUser, isSpeaking, hasCompletedOnce]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      aiEmergencyVoice.stop();
    };
  }, []);

  const handleTriggerAIVoiceDispatch = () => {
    setIsCountdownActive(false);
    setIsSpeaking(true);
    setSpokenCharIndex(0);
    onVoiceStarted?.();

    aiEmergencyVoice.speakEmergencyScript(scriptData.fullText, {
      preferredVoice,
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setHasCompletedOnce(true);
        onVoiceEnded?.();

        // If auto-repeat is enabled, wait 15 seconds then repeat
        if (autoRepeatEnabled) {
          setTimeout(() => {
            if (autoRepeatEnabled && !isCanceledByUser) {
              handleTriggerAIVoiceDispatch();
            }
          }, 15000);
        }
      },
      onError: (err) => {
        console.warn('AI voice dispatch error:', err);
        setIsSpeaking(false);
        setHasCompletedOnce(true);
      },
      onBoundary: (charIndex) => {
        setSpokenCharIndex(charIndex);
      }
    });
  };

  const handleStopAIVoice = () => {
    aiEmergencyVoice.stop();
    setIsSpeaking(false);
    setAutoRepeatEnabled(false);
  };

  const handleUserCanSpeakCancel = () => {
    aiEmergencyVoice.stop();
    setIsSpeaking(false);
    setIsCountdownActive(false);
    setIsCanceledByUser(true);
  };

  const handleResetCountdown = () => {
    aiEmergencyVoice.stop();
    setIsSpeaking(false);
    setIsCanceledByUser(false);
    setSecondsLeft(30);
    setIsCountdownActive(true);
    setHasCompletedOnce(false);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(scriptData.fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 3000);
  };

  const cleanNearestPhone = nearestStationPhone ? nearestStationPhone.replace(/[^0-9+]/g, '') : '119';

  return (
    <div className="rounded-3xl bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 border-2 border-red-500/80 p-4 sm:p-5 shadow-2xl relative overflow-hidden text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-red-500/30 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-950/80 shrink-0">
            {isSpeaking ? (
              <Radio className="w-5 h-5 animate-pulse text-yellow-300" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Emergency AI Voice Failsafe
              </span>
              <span className="text-[11px] font-bold text-red-200">
                wecareja.care • {scriptData.roleDescription}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Unable to Speak to Police Assistant
            </h3>
          </div>
        </div>

        {/* Live Audio Visualizer / Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {isSpeaking ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/30 border border-red-400/50 text-red-300 text-xs font-mono font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>TRANSMITTING TO POLICE</span>
            </div>
          ) : isCountdownActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-black">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>AUTO-TRIGGER IN {secondsLeft}S</span>
            </div>
          ) : isCanceledByUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>User Speaking Manually</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 text-xs font-bold">
              <span>Ready for Transmission</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Mode 1: 30-Second Countdown Active (User unable to speak failsafe) */}
      {isCountdownActive && !isSpeaking && (
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-red-950/50 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Animated Circular Countdown Dial */}
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-1000 ease-linear"
                    strokeDasharray={`${(secondsLeft / 30) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-black text-amber-300 text-sm">
                  {secondsLeft}s
                </span>
              </div>

              <div>
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  30-Second Silent Failsafe Running
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  If you are unable to speak to the police after 30 seconds, an automated AI voice will start telling the police you are in distress with your exact coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Choice Buttons: Speak Now or I Can Speak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleTriggerAIVoiceDispatch}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition cursor-pointer border border-red-400/40"
            >
              <FastForward className="w-4 h-4 text-yellow-300" />
              <span>Activate AI Voice Now (Can't Speak)</span>
            </button>

            <button
              type="button"
              onClick={handleUserCanSpeakCancel}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-white/15"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>I Can Speak to Police Myself</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Mode 2: AI Voice Active or Ready */}
      {(isSpeaking || !isCountdownActive || hasCompletedOnce) && (
        <div className="my-4 space-y-3">
          {/* Animated Equalizer Waveform while speaking */}
          {isSpeaking && (
            <div className="p-3 rounded-2xl bg-black/40 border border-red-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-red-400 animate-bounce" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  AI Voice Broadcasting Loud &amp; Clear:
                </span>
              </div>
              <div className="flex items-end gap-1 h-6">
                {audioMeter.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-red-500 to-yellow-400 rounded-full transition-all duration-100"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Transcript / Spoken Message Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/15 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-red-300">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                Official Police Transmission Script:
              </span>
              <button
                type="button"
                onClick={handleCopyTranscript}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                title="Copy text to clipboard"
              >
                {copiedTranscript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Transcript text block */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3 rounded-xl border border-white/10 select-text">
              &ldquo;{scriptData.fullText}&rdquo;
            </p>

            {/* Exact GPS Coordinates Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS: {formatCoordinates(effectiveLat, effectiveLng)}</span>
              </div>
              <span className="text-slate-400 text-[11px] truncate max-w-xs">
                Ref: {address}
              </span>
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={handleStopAIVoice}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer border border-red-400/40"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop AI Voice</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerAIVoiceDispatch}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer border border-emerald-400/40"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{hasCompletedOnce ? 'Repeat AI Broadcast' : 'Start AI Voice Now'}</span>
                </button>
              )}

              {/* Reset / Restart 30s timer button */}
              <button
                type="button"
                onClick={handleResetCountdown}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 transition cursor-pointer"
                title="Restart 30 second timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart 30s Failsafe</span>
              </button>
            </div>

            {/* Voice Gender Switcher & SMS Dispatch */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPreferredVoice(preferredVoice === 'female' ? 'male' : 'female')}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-[11px] font-bold border border-white/10 transition cursor-pointer flex items-center gap-1"
                title="Change AI voice gender"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>Voice: {preferredVoice === 'female' ? 'Female' : 'Male'}</span>
              </button>

              <a
                href={`sms:119?&body=${encodeURIComponent(scriptData.smsBody)}`}
                className="px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-blue-400/30 transition cursor-pointer"
                title="Send SMS text with coordinates"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
                <span>SMS Coordinates</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Information Footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Automated 119 Emergency Speech Dispatch &bull; WeCareJa.care</span>
        </span>
        <span className="text-slate-400">
          Hold device near telephone microphone if connected with police
        </span>
      </div>
    </div>
  );
};
