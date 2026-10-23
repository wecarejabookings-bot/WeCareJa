import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';

export interface ApplicantApprovedWelcomeModalProps {
  user: any;
  onClose: () => void;
}

export const ApplicantApprovedWelcomeModal: React.FC<ApplicantApprovedWelcomeModalProps> = ({
  user,
  onClose
}) => {
  useEffect(() => {
    soundFX.playSuccessFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6']
    });
  }, []);

  if (!user) return null;

  const roleName = String(user.role || '').toLowerCase();
  const isNurse = roleName.includes('nurse');
  const roleDisplay = isNurse ? 'Nurse Practitioner' : 'Administrator';
  const fullName = user.full_name || user.name || 'Team Member';

  const handleClose = async () => {
    if (user.id) {
      try {
        await supabase
          .from('profiles')
          .update({ welcome_seen: true })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Welcome seen update note:', err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f0a26] border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 border-2 border-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-950/60">
          {isNurse ? (
            <Award className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-amber-400 animate-bounce" />
          )}
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Official Approval Confirmation</span>
          </span>
          <h3 className="text-xl font-black text-white mt-2">
            Welcome, {fullName}!
          </h3>
          <p className="text-xs text-emerald-300 font-bold mt-0.5 capitalize">
            Approved Role: {roleDisplay}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 leading-relaxed text-left space-y-2">
          {isNurse ? (
            <>
              <p>
                🎉 <strong>Congratulations!</strong> Your healthcare practitioner application and credentials have been verified and approved by We Care Jamaica Administration.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Your clinical profile is active and verified for patient bookings.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>85% caregiver earnings payout model active with weekly direct deposits.</span>
                </li>
              </ul>
            </>
          ) : (
            <>
              <p>
                🎉 <strong>Executive Access Granted!</strong> Your administrator profile and security clearance credentials have been verified and approved by Lead Administration.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full access to Command Centre, Clinical Dispatch, and Vetting.</span>
                </li>
              </ul>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl text-xs font-black text-[#1E1B4B] bg-[#F59E0B] hover:opacity-95 transition flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 cursor-pointer"
        >
          <span>Enter {roleDisplay} Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
