import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Stethoscope, 
  ShoppingBag, 
  MapPin, 
  AlertTriangle, 
  Scan, 
  Sparkles, 
  Clock, 
  Maximize2, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { WeCareTrackLogo } from './WeCareTrackLogo';

interface AppVideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  onOpenBooking?: () => void;
  onOpenStore?: () => void;
  onOpenFaceScanTutorial?: () => void;
}

interface Chapter {
  id: number;
  title: string;
  duration: string;
  startSec: number;
  endSec: number;
  badge: string;
  summary: string;
  keyPoints: string[];
  visualTag: string;
}

const VIDEO_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'Welcome to We Care Jamaica',
    duration: '0:35',
    startSec: 0,
    endSec: 35,
    badge: 'Overview',
    summary: 'Jamaica\'s trusted on-demand home healthcare platform connecting families with NCJ licensed Registered Nurses & Certified Caregivers.',
    keyPoints: [
      '100% NCJ licensed nurses & background-verified caregivers',
      'Average 15–30 min emergency arrival across Kingston, St. Andrew & Portmore',
      'Strict independent contractor & clinical escrow protection'
    ],
    visualTag: 'overview'
  },
  {
    id: 2,
    title: 'Booking a Home Nurse Visit',
    duration: '0:40',
    startSec: 35,
    endSec: 75,
    badge: 'Procedures',
    summary: 'How to easily book clinical home visits—from IV infusions and post-op wound care to elderly companion wellness checks.',
    keyPoints: [
      'Select procedure or wellness service needed',
      'Pick verified nurse profile with verified reviews & hourly rate (JMD)',
      'Choose preferred date & time with instant calendar dispatch'
    ],
    visualTag: 'booking'
  },
  {
    id: 3,
    title: 'Add to Care Visit Bundles',
    duration: '0:35',
    startSec: 75,
    endSec: 110,
    badge: 'Medical Store',
    summary: 'Bundle essential medical supplies—nitrile gloves, automated BP monitors, and wound dressings—with your nurse booking in one checkout.',
    keyPoints: [
      'Items arrive hand-delivered by your attending nurse',
      'No separate delivery fees or pharmacy runs',
      'Itemized Jamaican health insurance receipt (Sagicor, Medecus, Guardian)'
    ],
    visualTag: 'store'
  },
  {
    id: 4,
    title: 'Live GPS Tracking & Doorstep QR Check-In',
    duration: '0:35',
    startSec: 110,
    endSec: 145,
    badge: 'Safety',
    summary: 'Watch your assigned nurse travel in real-time. Verify arrival with an audible chime and secure mutual QR code scan.',
    keyPoints: [
      'Real-time Jamaican community zone map ETA',
      'Audible arrival doorbell chime alerts your household',
      'Visit cannot start without mutual booking QR code scan'
    ],
    visualTag: 'tracking'
  },
  {
    id: 5,
    title: 'Real Emergency SOS 119 Dispatch',
    duration: '0:30',
    startSec: 145,
    endSec: 175,
    badge: 'Emergency SOS',
    summary: 'Instant panic distress dispatch linking real client GPS coordinates, police stations, and the last attending nurse—never simulated data.',
    keyPoints: [
      'One-tap 119 police & Jamaica Fire Brigade dispatch',
      'Exact GPS latitude/longitude shared with emergency contacts',
      'Displays real attending nurse profile for clinical continuity'
    ],
    visualTag: 'sos'
  },
  {
    id: 6,
    title: 'Biometric Face Scan & Passkey Sign-In',
    duration: '0:35',
    startSec: 175,
    endSec: 210,
    badge: 'Biometrics',
    summary: 'Staff security standard: Mandatory live camera face scan for nurses & admins, plus FIDO2 Touch ID & Face ID passkey sign-in.',
    keyPoints: [
      'Photo file uploads disabled for staff: only live camera scans accepted',
      'Anti-spoofing oval reticle and compliance verification tokens',
      'One-touch biometric login without typing passwords'
    ],
    visualTag: 'biometrics'
  }
];

export const AppVideoTutorialModal: React.FC<AppVideoTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onOpenBooking,
  onOpenStore,
  onOpenFaceScanTutorial
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  const totalDurationSec = 210; // 3 mins 30 secs

  // Progress timer simulation for rich interactive video experience
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => {
          const next = prev + 1 * playbackSpeed;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return totalDurationSec;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed]);

  // Keep active chapter aligned with current time
  useEffect(() => {
    const matchedIdx = VIDEO_CHAPTERS.findIndex(
      ch => currentTimeSec >= ch.startSec && currentTimeSec < ch.endSec
    );
    if (matchedIdx !== -1 && matchedIdx !== activeChapterIndex) {
      setActiveChapterIndex(matchedIdx);
    }
  }, [currentTimeSec]);

  if (!isOpen) return null;

  const currentChapter = VIDEO_CHAPTERS[activeChapterIndex] || VIDEO_CHAPTERS[0];

  const handleSeek = (newSec: number) => {
    setCurrentTimeSec(newSec);
    soundFX.playToggleClick();
  };

  const handleSelectChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    setCurrentTimeSec(VIDEO_CHAPTERS[idx].startSec);
    setIsPlaying(true);
    soundFX.playTabSwitch();
  };

  const handleTogglePlay = () => {
    if (currentTimeSec >= totalDurationSec) {
      setCurrentTimeSec(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    soundFX.playToggleClick();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c0f2b] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top EKG line */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WeCareTrackLogo variant="horizontal" size="sm" inverted={true} />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Video Walkthrough: How to Use We Care Jamaica</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold">
                  Full Feature Tour
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Official 3-minute video guide for patients, families, and healthcare staff
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close video guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Video Screen Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl shadow-blue-950/60 flex flex-col justify-between">
            {/* Visual Simulated Screen corresponding to Current Chapter */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c1033] via-[#151c4a] to-[#0a0d24] flex items-center justify-center p-4">
              {/* Background ambient medical grid */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Dynamic Screen Content for each Chapter */}
              <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-3 p-4 sm:p-6 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
                {/* Chapter Icon Badge */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                  {currentChapter.visualTag === 'overview' && <Stethoscope className="w-7 h-7" />}
                  {currentChapter.visualTag === 'booking' && <Clock className="w-7 h-7" />}
                  {currentChapter.visualTag === 'store' && <ShoppingBag className="w-7 h-7" />}
                  {currentChapter.visualTag === 'tracking' && <MapPin className="w-7 h-7 animate-bounce" />}
                  {currentChapter.visualTag === 'sos' && <AlertTriangle className="w-7 h-7 text-rose-300 animate-pulse" />}
                  {currentChapter.visualTag === 'biometrics' && <Scan className="w-7 h-7 text-cyan-300 animate-pulse" />}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                    Chapter {currentChapter.id} of {VIDEO_CHAPTERS.length} • {currentChapter.badge}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {currentChapter.title}
                  </h4>
                  <p className="text-xs text-slate-200 max-w-md mx-auto leading-relaxed">
                    {currentChapter.summary}
                  </p>
                </div>

                {/* Animated Graphic / Feature Pill Callout */}
                <div className="w-full pt-1 flex flex-wrap items-center justify-center gap-2 text-[10px]">
                  {currentChapter.keyPoints.map((pt, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-medium flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{pt}</span>
                    </span>
                  ))}
                </div>

                {/* Subtitles / Closed Captions bar */}
                {showCaptions && (
                  <div className="mt-2 px-3 py-1 rounded-lg bg-black/80 text-amber-300 font-mono text-[11px] border border-amber-400/20 max-w-lg">
                    💬 [Narrator]: "{currentChapter.summary}"
                  </div>
                )}
              </div>
            </div>

            {/* Video Player Floating Controls Bar */}
            <div className="relative z-20 mt-auto p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
              {/* Scrubber Progress Bar */}
              <div 
                className="w-full h-2 rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer relative overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  handleSeek(pos * totalDurationSec);
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150"
                  style={{ width: `${(currentTimeSec / totalDurationSec) * 100}%` }}
                />
              </div>

              {/* Control Buttons Bar */}
              <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatTime(currentTimeSec)} / {formatTime(totalDurationSec)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Captions Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                      showCaptions
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    CC
                  </button>

                  {/* Playback Speed selector */}
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                    {[1, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          soundFX.playToggleClick();
                        }}
                        className={`px-1.5 py-0.5 rounded transition ${
                          playbackSpeed === spd
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Selector & Direct Jump Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Video Chapters &amp; Highlights</span>
              </span>
              <span className="text-[11px] text-slate-400">Click any chapter to jump</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {VIDEO_CHAPTERS.map((ch, idx) => {
                const isActive = activeChapterIndex === idx;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChapter(idx)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-400/50 shadow-lg shadow-blue-950/40'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'
                    }`}>
                      {ch.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-white text-[11px] truncate">{ch.title}</span>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">{ch.duration}</span>
                      </div>
                      <span className="text-[10px] text-blue-300 font-mono block">{ch.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ready to explore these features?</span>
              </h5>
              <p className="text-[11px] text-slate-400">
                Book a verified visit, order medical supplies, or review biometric security.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
                >
                  Book Nurse Visit
                </button>
              )}

              {onOpenStore && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStore();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
                >
                  Medical Store
                </button>
              )}

              {onOpenFaceScanTutorial && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFaceScanTutorial();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 font-bold text-xs border border-cyan-400/30 transition cursor-pointer flex items-center gap-1"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Face Scan Tutorial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
