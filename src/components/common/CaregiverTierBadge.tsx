import React from 'react';
import { ShieldCheck, HeartHandshake, Award, HelpCircle, Check, AlertTriangle, Stethoscope, Sparkles } from 'lucide-react';
import { NurseProfile, NurseCareLevel, UserRole } from '../../types';

interface CaregiverTierBadgeProps {
  nurse?: Partial<NurseProfile> | null;
  careLevel?: NurseCareLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'card' | 'pill' | 'banner';
  showScopeInfo?: boolean;
  showRate?: boolean;
  onOpenScopeModal?: () => void;
  className?: string;
  viewerRole?: UserRole;
}

export const CaregiverTierBadge: React.FC<CaregiverTierBadgeProps> = ({
  nurse,
  careLevel: overrideCareLevel,
  size = 'sm',
  variant = 'badge',
  showScopeInfo = false,
  onOpenScopeModal,
  className = '',
  viewerRole = 'client'
}) => {
  const careLevel: NurseCareLevel = 
    overrideCareLevel || 
    nurse?.careLevel || 
    (nurse?.requiresNcjRegistration === false ? 'geriatric_caregiver' : 'registered_nurse');

  const isRegisteredNurse = careLevel === 'registered_nurse';
  const isGeriatricCaregiver = careLevel === 'geriatric_caregiver';
  const isPracticalAide = careLevel === 'practical_nurse_aide';

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

  if (variant === 'banner') {
    if (isRegisteredNurse) {
      return (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-emerald-950/60 border border-emerald-400/40 text-white ${className}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-300 text-sm">NCJ Registered Nurse (RN/BSN/RM)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase">
                    Clinical Tier
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">
                  Formally licensed by the <strong>Nursing Council of Jamaica</strong>. Authorized for IV infusions, sterile wound dressing, clinical assessments &amp; injectable medications (Rate: JMD $6,500 – $10,500/hr).
                </p>
              </div>
            </div>

            {onOpenScopeModal && (
              <button
                type="button"
                onClick={onOpenScopeModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold transition self-start sm:self-center shrink-0"
              >
                View Clinical Scope
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-cyan-900/40 to-blue-950/60 border border-sky-400/40 text-white ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/40 shrink-0">
              <HeartHandshake className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sky-300 text-sm">
                  {isGeriatricCaregiver ? 'Certified Geriatric Care Aide' : 'Certified Practical Caregiver'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[9px] font-bold uppercase">
                  Non-NCJ Minimal Care
                </span>
              </div>
              <p className="text-[11px] text-sky-100/80 mt-0.5">
                Certified caregiver providing dedicated non-invasive assistance (ADLs, hygiene, companionship, vitals &amp; meal prep). <strong>Not required to register with NCJ</strong> for minimal care. Affordable rate: JMD $2,800 – $3,800/hr.
              </p>
            </div>
          </div>

          {onOpenScopeModal && (
            <button
              type="button"
              onClick={onOpenScopeModal}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold transition self-start sm:self-center shrink-0"
            >
              Caregiver Scope &amp; Rates
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    if (isRegisteredNurse) {
      return (
        <div className={`p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-1.5 ${className}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NCJ Registered Nurse
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
              Clinical Tier
            </span>
          </div>
          <p className="text-[11px] text-emerald-100/70">
            Authorized for advanced clinical treatments, IV infusions, wound dressing, and post-op nursing care.
          </p>
          <div className="pt-1 text-[11px] font-bold text-emerald-300 flex justify-between">
            <span>Standard Fee:</span>
            <span>JMD $6,500 – $10,500 / visit</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sky-300 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-sky-400" />
            {isGeriatricCaregiver ? 'Certified Geriatric Care Aide' : 'Certified Practical Caregiver'}
          </span>
          <span className="text-[10px] font-mono bg-sky-500/20 px-2 py-0.5 rounded text-sky-300">
            Non-NCJ Minimal Care
          </span>
        </div>
        <p className="text-[11px] text-sky-100/70">
          Trained in elder assistance, hygiene, mobility, meal prep &amp; vitals check. Not required to register with NCJ for non-invasive care.
        </p>
        <div className="pt-1 text-[11px] font-bold text-sky-300 flex justify-between">
          <span>Standard Fee:</span>
          <span className="text-cyan-300 font-black">JMD $2,800 – $3,800 / hr</span>
        </div>
      </div>
    );
  }

  // Pill / Badge Variant
  if (isRegisteredNurse) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-xs font-bold transition hover:bg-emerald-500/30 ${sizeClasses[size]} ${className}`}
        title="Registered with Nursing Council of Jamaica • Clinical Registered Nurse"
      >
        <ShieldCheck className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
        <span className="whitespace-nowrap">NCJ Registered Nurse</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-xs font-bold transition hover:bg-sky-500/30 ${sizeClasses[size]} ${className}`}
      title="Certified Geriatric / Practical Caregiver • Non-NCJ Minimal Care (ADLs, Hygiene, Companionship)"
    >
      <HeartHandshake className={`${iconSizes[size]} text-sky-400 shrink-0`} />
      <span className="whitespace-nowrap">
        {isGeriatricCaregiver ? 'Geriatric Care Aide (Non-NCJ)' : 'Practical Care Aide (Non-NCJ)'}
      </span>
    </span>
  );
};
