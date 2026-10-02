import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Users, 
  Sun, 
  Moon, 
  HeartPulse, 
  Baby, 
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { ServiceItem } from '../../types';

interface ServiceLogoProps {
  service?: ServiceItem | null;
  serviceId?: string;
  serviceName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  withGlow?: boolean;
  interactive?: boolean;
  className?: string;
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({
  service,
  serviceId,
  serviceName,
  size = 'md',
  showBadge = false,
  withGlow = false,
  interactive = false,
  className = ''
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Derive service identifier
  const id = service?.id || serviceId || '';
  const name = service?.name || serviceName || '';

  // Theme palettes and vectors for each clinical procedure
  const getLogoConfig = () => {
    // 1. Wound Dressing & Post-Op Care
    if (id === 'srv-1' || name.toLowerCase().includes('wound') || name.toLowerCase().includes('dressing')) {
      return {
        label: 'Wound Care',
        theme: 'emerald',
        bgGradient: 'from-emerald-600 via-teal-700 to-slate-950',
        borderColor: 'border-emerald-400/50',
        textColor: 'text-emerald-300',
        glowColor: 'shadow-emerald-500/30',
        stampBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            {/* Circular clinical seal */}
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            <circle cx="24" cy="24" r="18" fill="currentColor" fillOpacity="0.12" />
            {/* Sterile Cross Badge */}
            <rect x="21" y="9" width="6" height="30" rx="3" fill="#10B981" />
            <rect x="9" y="21" width="30" height="6" rx="3" fill="#10B981" />
            {/* Criss-cross sterile bandage strip */}
            <path d="M12 16L36 32" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
            <path d="M36 16L12 32" stroke="#A7F3D0" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
            {/* Antiseptic healing droplet */}
            <circle cx="24" cy="24" r="4.5" fill="#34D399" />
            <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
          </svg>
        )
      };
    }

    // 2. Elderly Vitals & Medication Management
    if (id === 'srv-2' || name.toLowerCase().includes('vitals') || name.toLowerCase().includes('blood pressure')) {
      return {
        label: 'Vitals & Meds',
        theme: 'cyan',
        bgGradient: 'from-cyan-600 via-sky-700 to-slate-950',
        borderColor: 'border-cyan-400/50',
        textColor: 'text-cyan-300',
        glowColor: 'shadow-cyan-500/30',
        stampBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-40" />
            <circle cx="24" cy="24" r="18" fill="currentColor" fillOpacity="0.12" />
            {/* Stethoscope Tubing loop */}
            <path d="M14 12V24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24V12" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="12" r="2.5" fill="#E0F2FE" />
            <circle cx="34" cy="12" r="2.5" fill="#E0F2FE" />
            {/* Resonator disc */}
            <circle cx="24" cy="37" r="4.5" fill="#0284C7" stroke="#BAE6FD" strokeWidth="1.5" />
            {/* Heartbeat EKG Pulse */}
            <path d="M17 23H21L23 18L26 28L28 21L30 23H32" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dual pill indicator */}
            <rect x="29" y="8" width="10" height="5" rx="2.5" transform="rotate(30 29 8)" fill="#FBBF24" />
          </svg>
        )
      };
    }

    // 3. IV Therapy & Injectable Admin
    if (id === 'srv-3' || name.toLowerCase().includes('iv ') || name.toLowerCase().includes('injectable') || name.toLowerCase().includes('infusion')) {
      return {
        label: 'IV Infusion',
        theme: 'purple',
        bgGradient: 'from-purple-600 via-indigo-800 to-slate-950',
        borderColor: 'border-purple-400/50',
        textColor: 'text-purple-300',
        glowColor: 'shadow-purple-500/30',
        stampBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* IV Infusion Drip Bag */}
            <path d="M16 12C16 10 18 9 20 9H28C30 9 32 10 32 12V24C32 28 28 31 24 31C20 31 16 28 16 24V12Z" fill="#7C3AED" fillOpacity="0.4" stroke="#C084FC" strokeWidth="2" />
            {/* Liquid level */}
            <path d="M17 18C19 19 29 19 31 18V24C31 27 28 29.5 24 29.5C20 29.5 17 27 17 24V18Z" fill="#A855F7" fillOpacity="0.6" />
            {/* Calibrated graduation ticks */}
            <line x1="20" y1="14" x2="23" y2="14" stroke="#E9D5FF" strokeWidth="1.5" />
            <line x1="20" y1="18" x2="25" y2="18" stroke="#E9D5FF" strokeWidth="1.5" />
            <line x1="20" y1="22" x2="23" y2="22" stroke="#E9D5FF" strokeWidth="1.5" />
            {/* Drip chamber & tube */}
            <rect x="22.5" y="31" width="3" height="5" rx="1" fill="#DDD6FE" />
            <path d="M24 36V41" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
            {/* Droplet */}
            <circle cx="24" cy="43" r="1.5" fill="#38BDF8" />
            {/* Precision syringe angle */}
            <path d="M33 33L40 40M37 29L43 35M28 38L34 44" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
      };
    }

    // 4. Catheter & Stoma Tube Care
    if (id === 'srv-4' || name.toLowerCase().includes('catheter') || name.toLowerCase().includes('stoma')) {
      return {
        label: 'Catheter Care',
        theme: 'blue',
        bgGradient: 'from-blue-600 via-sky-800 to-slate-950',
        borderColor: 'border-blue-400/50',
        textColor: 'text-blue-300',
        glowColor: 'shadow-blue-500/30',
        stampBg: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Protective Drainage Shield */}
            <path d="M24 8L36 13V24C36 32 28 38 24 40C20 38 12 32 12 24V13L24 8Z" fill="#1E3A8A" fillOpacity="0.4" stroke="#60A5FA" strokeWidth="2" />
            {/* Curved clinical conduit tube */}
            <path d="M19 16C19 22 29 20 29 27C29 32 23 33 21 34" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            {/* Fluid valve clamp */}
            <rect x="21" y="22" width="6" height="3" rx="1.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="24" cy="28" r="2" fill="#60A5FA" />
          </svg>
        )
      };
    }

    // 5. Postnatal & Newborn Mother Care
    if (id === 'srv-5' || name.toLowerCase().includes('postnatal') || name.toLowerCase().includes('newborn') || name.toLowerCase().includes('mother')) {
      return {
        label: 'Maternal & Baby',
        theme: 'rose',
        bgGradient: 'from-rose-500 via-pink-700 to-slate-950',
        borderColor: 'border-rose-400/50',
        textColor: 'text-rose-300',
        glowColor: 'shadow-rose-500/30',
        stampBg: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Cradling Heart silhouette */}
            <path d="M24 38C24 38 11 29 11 19C11 14 15 11 19 11C21.5 11 23.5 12.5 24 14C24.5 12.5 26.5 11 29 11C33 11 37 14 37 19C37 29 24 38 24 38Z" fill="#FB7185" fillOpacity="0.25" stroke="#FDA4AF" strokeWidth="1.5" />
            {/* Mother silhouette */}
            <circle cx="20" cy="18" r="3.5" fill="#FFE4E6" />
            <path d="M15 29C15 25 18 24 21 24C23 24 25 25 25 29" stroke="#FFE4E6" strokeWidth="2" strokeLinecap="round" />
            {/* Newborn Baby head & swaddle */}
            <circle cx="28" cy="23" r="2.8" fill="#F43F5E" />
            <path d="M26 27C27 26 31 26 32 29" stroke="#FECDD3" strokeWidth="2.5" strokeLinecap="round" />
            {/* Sparkle of health */}
            <path d="M33 13L34 16L37 17L34 18L33 21L32 18L29 17L32 16L33 13Z" fill="#FDE047" />
          </svg>
        )
      };
    }

    // 6. Palliative & Comfort Nursing
    if (id === 'srv-6' || name.toLowerCase().includes('palliative') || name.toLowerCase().includes('comfort')) {
      return {
        label: 'Comfort Care',
        theme: 'amber',
        bgGradient: 'from-amber-600 via-orange-800 to-slate-950',
        borderColor: 'border-amber-400/50',
        textColor: 'text-amber-300',
        glowColor: 'shadow-amber-500/30',
        stampBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Gentle hands holding glowing heart */}
            <path d="M12 28C14 24 18 25 21 27L24 29" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 28C34 24 30 25 27 27L24 29" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            {/* Tender heart */}
            <path d="M24 26C24 26 18 20 18 16C18 13.5 20 12 22 12C23.5 12 24 13 24 13C24 13 24.5 12 26 12C28 12 30 13.5 30 16C30 20 24 26 24 26Z" fill="#F59E0B" stroke="#FBBF24" strokeWidth="1.5" />
            {/* Radiating gentle rays */}
            <line x1="24" y1="8" x2="24" y2="10" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="17" y1="10" x2="18.5" y2="11.5" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="31" y1="10" x2="29.5" y2="11.5" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
      };
    }

    // 7. Geriatric Companion & ADL Care
    if (id === 'srv-7' || name.toLowerCase().includes('companion') || name.toLowerCase().includes('adl')) {
      return {
        label: 'Companion ADL',
        theme: 'amber',
        bgGradient: 'from-amber-600 via-yellow-700 to-slate-950',
        borderColor: 'border-amber-400/50',
        textColor: 'text-amber-200',
        glowColor: 'shadow-amber-500/30',
        stampBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Two companions side by side with walking cane */}
            {/* Senior figure */}
            <circle cx="18" cy="15" r="3.5" fill="#FEF08A" />
            <path d="M13 32V25C13 22 15 20 18 20C21 20 22 22 22 25" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Walking cane */}
            <path d="M12 24C12 22 10 22 10 24V36" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
            {/* Friendly Caregiver figure */}
            <circle cx="29" cy="17" r="3.5" fill="#38BDF8" />
            <path d="M25 32V26C25 23 27 22 30 22C33 22 35 23 35 26V32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Reaching arm / Handshake connection */}
            <path d="M21 24L26 25" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            {/* Heart of warmth */}
            <path d="M23 12C23 12 21 9 19.5 9C18 9 17 10 17 11.5C17 13.5 23 17 23 17C23 17 29 13.5 29 11.5C29 10 28 9 26.5 9C25 9 23 12 23 12Z" fill="#F43F5E" />
          </svg>
        )
      };
    }

    // 8. Senior Morning/Bedtime Routine & Vitals
    if (id === 'srv-8' || name.toLowerCase().includes('routine') || name.toLowerCase().includes('bedtime') || name.toLowerCase().includes('morning')) {
      return {
        label: 'Routine Care',
        theme: 'indigo',
        bgGradient: 'from-indigo-600 via-purple-900 to-slate-950',
        borderColor: 'border-indigo-400/50',
        textColor: 'text-indigo-200',
        glowColor: 'shadow-indigo-500/30',
        stampBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Left half: Radiant Morning Sun */}
            <path d="M24 10C16.27 10 10 16.27 10 24C10 31.73 16.27 38 24 38V10Z" fill="#F59E0B" fillOpacity="0.25" />
            <path d="M24 16C19.58 16 16 19.58 16 24C16 28.42 19.58 32 24 32V16Z" fill="#FBBF24" />
            <line x1="8" y1="24" x2="12" y2="24" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="14" x2="15" y2="17" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="34" x2="15" y2="31" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            {/* Right half: Evening Crescent Moon & Stars */}
            <path d="M24 10C31.73 10 38 16.27 38 24C38 31.73 31.73 38 24 38V10Z" fill="#312E81" fillOpacity="0.5" />
            <path d="M25 17C29 18 31 22 30 26C29 30 25 32 24 32C28 31 31 27 30 22C29.5 20 27 18 25 17Z" fill="#A5B4FC" />
            <circle cx="33" cy="16" r="1" fill="#FFFFFF" />
            <circle cx="34" cy="28" r="1.2" fill="#FFFFFF" />
            {/* Center dividing subtle line */}
            <line x1="24" y1="9" x2="24" y2="39" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        )
      };
    }

    // 9. Senior Respite Care (2-Hour Block)
    if (id === 'srv-9' || name.toLowerCase().includes('respite') || name.toLowerCase().includes('2-hour')) {
      return {
        label: '2-Hr Respite',
        theme: 'cyan',
        bgGradient: 'from-teal-600 via-cyan-800 to-slate-950',
        borderColor: 'border-teal-400/50',
        textColor: 'text-teal-200',
        glowColor: 'shadow-teal-500/30',
        stampBg: 'bg-teal-500/20 text-teal-200 border-teal-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Clock Face with 2 Hours Highlighted */}
            <circle cx="24" cy="24" r="16" stroke="#2DD4BF" strokeWidth="2" fill="#134E4A" fillOpacity="0.4" />
            {/* 2-Hour sector wedge (from 12 to 2) */}
            <path d="M24 24L24 10A14 14 0 0 1 36 17Z" fill="#14B8A6" fillOpacity="0.7" />
            {/* Clock hands */}
            <line x1="24" y1="24" x2="24" y2="13" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="24" x2="33" y2="18" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
            {/* "2H" Relief Stamp */}
            <rect x="13" y="27" width="12" height="7" rx="3.5" fill="#042F2E" stroke="#5EEAD4" strokeWidth="1" />
            <text x="19" y="32.5" fill="#5EEAD4" fontSize="5.5" fontWeight="900" textAnchor="middle">2H</text>
          </svg>
        )
      };
    }

    // 10. Mobility & Assisted Transfer Support
    if (id === 'srv-10' || name.toLowerCase().includes('mobility') || name.toLowerCase().includes('transfer') || name.toLowerCase().includes('wheelchair')) {
      return {
        label: 'Mobility Care',
        theme: 'blue',
        bgGradient: 'from-blue-600 via-sky-800 to-slate-950',
        borderColor: 'border-blue-400/50',
        textColor: 'text-blue-200',
        glowColor: 'shadow-blue-500/30',
        stampBg: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Wheelchair & Active Assistance Guide */}
            {/* Person Head */}
            <circle cx="24" cy="14" r="3.5" fill="#93C5FD" />
            {/* Torso upright & supported */}
            <path d="M24 18V28L30 35" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Arm holding support rail */}
            <path d="M24 23L16 26" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            {/* Wheelchair circle */}
            <circle cx="21" cy="31" r="7" stroke="#60A5FA" strokeWidth="2" strokeDasharray="3 2" />
            {/* Movement forward arrows */}
            <path d="M33 22L36 25L33 28" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 25H36" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      };
    }

    // 11. 3x Daily Practitioner Guardian Care
    if (id === 'srv-11' || name.toLowerCase().includes('3x') || name.toLowerCase().includes('guardian') || name.toLowerCase().includes('triple')) {
      return {
        label: '3x Guardian',
        theme: 'emerald',
        bgGradient: 'from-emerald-700 via-teal-800 to-slate-950',
        borderColor: 'border-emerald-400/50',
        textColor: 'text-emerald-200',
        glowColor: 'shadow-emerald-500/30',
        stampBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
        renderGraphic: () => (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
            {/* Golden Guardian Shield */}
            <path d="M24 7L37 13V23C37 32 29 39 24 41C19 39 11 32 11 23V13L24 7Z" fill="#064E3B" fillOpacity="0.5" stroke="#34D399" strokeWidth="2" />
            {/* 3 Checkpoint Stars (Morning, Afternoon, Night) */}
            {/* Morning 8am Star */}
            <circle cx="18" cy="18" r="3" fill="#FBBF24" />
            {/* Midday 1pm Star */}
            <circle cx="24" cy="27" r="3.5" fill="#38BDF8" />
            {/* Night 6pm Star */}
            <circle cx="30" cy="18" r="3" fill="#A78BFA" />
            {/* Shield crest badge 3X */}
            <path d="M19 18L24 27L29 18" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="24" y="36" fill="#FDE047" fontSize="7" fontWeight="900" textAnchor="middle">3x</text>
          </svg>
        )
      };
    }

    // Default Clinical Procedure Fallback
    return {
      label: 'Clinical Care',
      theme: 'purple',
      bgGradient: 'from-purple-700 via-violet-800 to-slate-950',
      borderColor: 'border-purple-400/50',
      textColor: 'text-purple-200',
      glowColor: 'shadow-purple-500/30',
      stampBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
      renderGraphic: () => (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-40" />
          <rect x="21" y="11" width="6" height="26" rx="3" fill="#A855F7" />
          <rect x="11" y="21" width="26" height="6" rx="3" fill="#A855F7" />
          <circle cx="24" cy="24" r="5" fill="#F43F5E" />
        </svg>
      )
    };
  };

  const config = getLogoConfig();

  // Dimension mapping
  const sizeClasses = {
    xs: 'w-6 h-6 p-0.5 rounded-lg text-[8px]',
    sm: 'w-9 h-9 p-1 rounded-xl text-[9px]',
    md: 'w-12 h-12 p-1.5 rounded-2xl text-[10px]',
    lg: 'w-16 h-16 p-2 rounded-2xl text-xs',
    xl: 'w-20 h-20 p-2.5 rounded-3xl text-sm'
  };

  const badgeSizeClasses = {
    xs: 'text-[8px] px-1 py-0.2',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1'
  };

  return (
    <>
      <div 
        className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
        onClick={() => interactive && setShowPreviewModal(true)}
        title={service ? `${service.name} (${config.label})` : config.label}
      >
        {/* Emblem Container with gradient & crystal edge */}
        <div 
          className={`relative ${sizeClasses[size]} bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} flex items-center justify-center transition-all duration-300 ${
            withGlow ? `shadow-lg ${config.glowColor}` : 'shadow-md'
          } ${interactive ? 'group-hover:scale-105 group-hover:border-white/80 group-hover:shadow-xl' : ''}`}
        >
          {/* Inner vector illustration */}
          <div className="w-full h-full text-white drop-shadow-sm flex items-center justify-center">
            {config.renderGraphic()}
          </div>

          {/* Micro "WeCare" logo mark */}
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white/90"></span>
          </span>
        </div>

        {/* Optional Logo Label Banner below */}
        {showBadge && (
          <span 
            className={`mt-1 font-black uppercase tracking-wider rounded-md border text-center whitespace-nowrap shadow-xs ${badgeSizeClasses[size]} ${config.stampBg}`}
          >
            {service?.badgeLabel || config.label}
          </span>
        )}
      </div>

      {/* Interactive Service Picture Preview Modal */}
      {showPreviewModal && service && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo Picture Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} p-2 shadow-xl flex items-center justify-center`}>
                {config.renderGraphic()}
              </div>

              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.stampBg}`}>
                  {config.label} Official Procedure Logo
                </span>
                <h3 className="text-base font-black text-white mt-1">{service.name}</h3>
                <span className="text-xs text-[#C77DFF] font-bold">JMD ${service.priceJMD.toLocaleString()} • {service.durationMinutes} mins</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              {service.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-slate-400">Practitioner Level:</span>
                <span className="font-bold text-emerald-400">
                  {service.careLevelRequired === 'registered_nurse' ? 'NCJ Registered Nurse (Sterile)' : 'Certified Geriatric Caregiver / Nurse'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-slate-400">Scope of Practice:</span>
                <span className="font-medium text-slate-200">{service.careScopeSummary || 'In-home clinical procedure'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-slate-400">Coverage Parishes:</span>
                <span className="font-medium text-slate-200">Kingston, St. Andrew, Portmore & Spanish Town</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
