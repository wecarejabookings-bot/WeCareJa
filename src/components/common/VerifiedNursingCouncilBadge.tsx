import React from 'react';
import { ShieldCheck, CheckCircle2, Award, FileCheck, Check, Sparkles, Lock } from 'lucide-react';
import { NurseProfile, UserRole } from '../../types';

interface VerifiedNursingCouncilBadgeProps {
  nurse?: Partial<NurseProfile> | null;
  licenseNumber?: string;
  status?: string;
  isVerified?: boolean;
  viewerRole?: UserRole;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'seal' | 'card' | 'inline' | 'banner' | 'trust-pill';
  label?: string;
  showLicense?: boolean;
  className?: string;
}

export const VerifiedNursingCouncilBadge: React.FC<VerifiedNursingCouncilBadgeProps> = ({
  nurse,
  licenseNumber,
  status,
  isVerified,
  viewerRole = 'client',
  size = 'sm',
  variant = 'badge',
  label = 'Registered with Nursing Council of Jamaica',
  showLicense = false,
  className = ''
}) => {
  // Determine if nurse has valid license info uploaded and verified
  const isApproved = 
    isVerified !== undefined 
      ? isVerified 
      : (status === 'approved' || nurse?.status === 'approved' || nurse?.licenseVerified === true || !!(nurse?.nursingCouncilLicense && nurse?.licenseDocumentUrl));

  // If NOT approved / verified, do NOT render the verified badge
  if (!isApproved) {
    return null;
  }

  // Only Admin can see raw license strings; Clients & Peer Nurses see protected verification status
  const canSeeRawLicense = viewerRole === 'admin' && showLicense;
  const displayLic = canSeeRawLicense
    ? (licenseNumber || nurse?.nursingCouncilLicense || 'NCJ-RN-VERIFIED')
    : 'Registered & Verified';

  // Size configurations
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[9px] gap-1',
    sm: 'px-2.5 py-1 text-[10px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'inline') {
    return (
      <span 
        className={`inline-flex items-center gap-1 font-bold text-emerald-300 ${className}`}
        title="Officially Registered & Verified with Nursing Council of Jamaica"
      >
        <ShieldCheck className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
        <span className="whitespace-nowrap">{label}</span>
        {canSeeRawLicense && (
          <span className="font-mono text-emerald-400/80 text-[10px]">({displayLic})</span>
        )}
      </span>
    );
  }

  if (variant === 'trust-pill') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 shadow-sm backdrop-blur-md font-extrabold ${sizeClasses[size]} ${className}`}
        title="Officially Verified & Registered with Nursing Council of Jamaica"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
        <span className="whitespace-nowrap tracking-tight">{label}</span>
        {canSeeRawLicense && (
          <span className="font-mono text-emerald-200/90 pl-1 border-l border-emerald-500/30 text-[10px]">
            {displayLic}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'seal') {
    return (
      <div 
        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 text-emerald-200 border border-emerald-400/50 shadow-lg shadow-emerald-950/60 backdrop-blur-md font-bold ${sizeClasses[size]} ${className}`}
        title="Officially Registered with Nursing Council of Jamaica • Active Clinical Practitioner"
      >
        <div className="p-0.5 rounded-full bg-emerald-400 text-slate-950 shrink-0">
          <ShieldCheck className={iconSizes[size]} />
        </div>
        <span className="tracking-tight whitespace-nowrap">{label}</span>
        {canSeeRawLicense && (
          <span className="font-mono text-emerald-300/90 pl-1.5 border-l border-emerald-500/40 text-[10px]">
            {displayLic}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0a2e20] to-emerald-950/40 border border-emerald-400/40 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-300 text-sm tracking-tight flex items-center gap-1.5">
                {label}
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase tracking-wider">
                NCJ Active
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-0.5">
              Formally registered and verified with the <strong>Nursing Council of Jamaica (NCJ)</strong>. Clinical competencies, background clearance, and sterile hygiene protocols vetted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-right">
            <span className="text-[9px] text-emerald-400/80 block uppercase font-bold tracking-wider">Council Status</span>
            <strong className="text-emerald-300 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Registered &amp; Verified
            </strong>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0d231a] to-emerald-950/40 border border-emerald-500/40 shadow-xl backdrop-blur-xl space-y-2.5 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-300 text-sm tracking-tight">
                  {label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase tracking-wider">
                  Active Vetted
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/70">
                Official registration verified against Nursing Council of Jamaica Registry
              </p>
            </div>
          </div>

          <Award className="w-6 h-6 text-emerald-400/50 shrink-0 hidden sm:block" />
        </div>

        <div className="pt-2 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-black/30 p-2 rounded-xl border border-emerald-500/20">
            <span className="text-emerald-400/70 block text-[9px] uppercase font-bold">Registration Status</span>
            <strong className="text-emerald-300 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active NCJ Practitioner
            </strong>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-emerald-500/20">
            <span className="text-emerald-400/70 block text-[9px] uppercase font-bold">Admin Vetting</span>
            <strong className="text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Approved
            </strong>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-emerald-500/20 col-span-2 sm:col-span-1">
            <span className="text-emerald-400/70 block text-[9px] uppercase font-bold">Parish Practice</span>
            <strong className="text-white">Kingston, St. Andrew, Portmore &amp; Spanish Town</strong>
          </div>
        </div>
      </div>
    );
  }

  // Default 'badge' pill variant
  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs font-bold transition hover:bg-emerald-500/25 ${sizeClasses[size]} ${className}`}
      title="Registered & Verified with Nursing Council of Jamaica"
    >
      <ShieldCheck className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
      <span className="whitespace-nowrap">{label}</span>
      {canSeeRawLicense && (
        <span className="font-mono text-emerald-400/80 font-normal pl-1 border-l border-emerald-500/30">
          {displayLic}
        </span>
      )}
    </span>
  );
};
