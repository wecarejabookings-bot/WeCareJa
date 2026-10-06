import React from 'react';
import { NurseProfile } from '../../types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  GraduationCap, 
  FileBadge, 
  UserCheck, 
  Stethoscope, 
  ExternalLink,
  MapPin,
  Calendar
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface VerifiedBadgeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurse: NurseProfile | null;
  onViewFullIdCard?: () => void;
}

export const VerifiedBadgeBreakdownModal: React.FC<VerifiedBadgeBreakdownModalProps> = ({
  isOpen,
  onClose,
  nurse,
  onViewFullIdCard
}) => {
  if (!isOpen || !nurse) return null;

  const isCaregiverOrCompanion = 
    nurse.careLevel === 'geriatric_caregiver' || 
    nurse.signupTrack === 'track_2_caregiver_companion' ||
    nurse.nonClinicalCareOnly;

  const policeDaysLeft = nurse.policeRecordDueDays ?? 45;
  const isPoliceVerified = nurse.policeRecordStatus === 'verified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#130324] border border-emerald-500/30 text-white shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={nurse.photoUrl || 'https://images.unsplash.com/photo-1594824813629-679df0a514d3?auto=format&fit=crop&q=80&w=300'} 
                alt={nurse.name} 
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-black">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Verified We Care Badge
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight mt-0.5">{nurse.name}</h3>
              <p className="text-xs text-purple-200">
                {isCaregiverOrCompanion ? 'Certified Caregiver & Companion' : (nurse.qualificationTitle || 'Licensed Registered Nurse')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Verification Items */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="text-slate-300">
            Every badge is independently verified by We Care Jamaica clinical administrators before client dispatch.
          </div>

          {/* ITEM 1: License OR Diploma */}
          {!isCaregiverOrCompanion ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs font-bold">Nursing Council of Jamaica (NCJ) License</strong>
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">VERIFIED</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5 space-y-0.5">
                  <div>License #: <span className="font-mono text-emerald-300 font-bold">{nurse.nursingCouncilLicense || 'NCJ-RN-2024-8192'}</span></div>
                  <div>Expiry: <span className="text-slate-300">{nurse.licenseExpiryDate || '31 Dec 2026'}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs font-bold">Diploma / Vocational Certification</strong>
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">VERIFIED</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  HEART Trust / NCTVET Geriatric Care Certification verified by admin.
                </div>
              </div>
            </div>
          )}

          {/* ITEM 2: Government ID */}
          <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-white text-xs font-bold">Government Photo ID Verified</strong>
                <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">VERIFIED</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {nurse.governmentIdType || 'Jamaican Passport / National ID'} checked against legal registration records.
              </div>
            </div>
          </div>

          {/* ITEM 3: School or References */}
          {!isCaregiverOrCompanion ? (
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs font-bold">Nursing School Degree Verified</strong>
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">VERIFIED</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {nurse.institutionAttended || 'The UWI School of Nursing Mona (UWISON)'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs font-bold">2 Professional References Checked</strong>
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">VERIFIED</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Prior clinical supervisors contacted &amp; employment verified.
                </div>
              </div>
            </div>
          )}

          {/* ITEM 4: Police Record 60-Day Status */}
          <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/30 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isPoliceVerified 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isPoliceVerified ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <strong className="text-white text-xs font-bold">Jamaica Constabulary Police Record</strong>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isPoliceVerified 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isPoliceVerified ? 'VERIFIED' : `DUE IN ${policeDaysLeft} DAYS`}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {isPoliceVerified ? (
                  <span>Official Criminal Records Office certificate on file (Waterloo Rd).</span>
                ) : (
                  <span>Under We Care 60-Day Onboarding Grace Period. Background check in progress.</span>
                )}
              </div>
            </div>
          </div>

          {/* Caregiver Scope Disclaimer Pill */}
          {isCaregiverOrCompanion && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block font-bold text-amber-300">
                  Caregiver Scope Notice
                </strong>
                <span>
                  "Caregiver - Non-clinical support. For clinical tasks (injections, wound dressing, IV, catheter) please book a Registered Nurse (RN) or LPN."
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          {onViewFullIdCard ? (
            <button
              onClick={() => {
                soundFX.playSuccessSoftDing();
                onViewFullIdCard();
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileBadge className="w-4 h-4 text-emerald-400" />
              <span>View Official ID Card</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Nursing Council of Jamaica standard</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
