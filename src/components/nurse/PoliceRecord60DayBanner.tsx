import React, { useState } from 'react';
import { NurseProfile } from '../../types';
import { 
  ShieldAlert, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface PoliceRecord60DayBannerProps {
  nurse: NurseProfile;
  onUpdateNurse?: (updated: NurseProfile) => void;
  onOpenUploadModal?: () => void;
}

export const PoliceRecord60DayBanner: React.FC<PoliceRecord60DayBannerProps> = ({
  nurse,
  onUpdateNurse,
  onOpenUploadModal
}) => {
  // Current simulated day (1, 14, 30, 50, 60)
  const [simulatedDay, setSimulatedDay] = useState<number>(() => {
    if (nurse.policeRecordDueDays !== undefined) {
      return 60 - nurse.policeRecordDueDays;
    }
    return 14;
  });

  const [isUploaded, setIsUploaded] = useState<boolean>(nurse.policeRecordStatus === 'verified');
  const [isSimMenuOpen, setIsSimMenuOpen] = useState<boolean>(false);

  // Calculate remaining days
  const daysLeft = Math.max(0, 60 - simulatedDay);
  const isPaused = daysLeft === 0;

  // Determine copy and colors according to Section 10
  const getBannerContent = () => {
    if (isUploaded) {
      return {
        badge: 'POLICE RECORD VERIFIED',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Background Verification Complete',
        message: 'Your official Jamaica Constabulary Force Criminal Records Office certificate is on file and active.',
        urgency: 'low',
        bgColor: 'bg-emerald-950/40 border-emerald-500/30'
      };
    }

    if (simulatedDay >= 60) {
      return {
        badge: 'PROFILE PAUSED (DAY 60)',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
        title: 'Profile Paused • 60-Day Grace Period Ended',
        message: 'Upload your police record now to reactivate bookings instantly. You cannot receive new client dispatches while paused.',
        urgency: 'critical',
        bgColor: 'bg-red-950/60 border-red-500/50'
      };
    }

    if (simulatedDay >= 50) {
      return {
        badge: 'URGENT (DAY 50)',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
        title: `Urgent: ${daysLeft} Days Left to Upload Police Record!`,
        message: 'Your profile will pause automatically on Day 60 unless your police record certificate is submitted.',
        urgency: 'high',
        bgColor: 'bg-red-950/40 border-red-500/40'
      };
    }

    if (simulatedDay >= 30) {
      return {
        badge: 'HALFWAY MARK (DAY 30)',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        title: `Halfway Mark: ${daysLeft} Days Left to Upload Police Record`,
        message: 'Get your certificate processed at PICA Office, 8 Waterloo Road, Kingston to keep taking uninterrupted bookings.',
        urgency: 'medium',
        bgColor: 'bg-amber-950/40 border-amber-500/30'
      };
    }

    if (simulatedDay >= 14) {
      return {
        badge: 'REMINDER (DAY 14)',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        title: `Friendly Reminder: ${daysLeft} Days Left to Upload Police Record`,
        message: 'You are currently active and taking bookings. Be sure to request your police record certificate before the 60-day limit.',
        urgency: 'normal',
        bgColor: 'bg-purple-950/40 border-purple-500/30'
      };
    }

    return {
      badge: 'APPROVAL NOTICE (DAY 1)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      title: "You're Approved! One Task Within 60 Days",
      message: 'Start taking client bookings now. Upload your police record certificate within 60 days to stay continuously active.',
      urgency: 'normal',
      bgColor: 'bg-purple-950/40 border-purple-500/30'
    };
  };

  const content = getBannerContent();

  const handleSimulateDay = (day: number) => {
    setSimulatedDay(day);
    setIsUploaded(false);
    setIsSimMenuOpen(false);
    soundFX.playTabSwitch();

    if (onUpdateNurse) {
      onUpdateNurse({
        ...nurse,
        policeRecordDueDays: Math.max(0, 60 - day),
        policeRecordStatus: day >= 60 ? 'overdue_suspended' : day >= 50 ? 'due_soon' : 'not_uploaded'
      });
    }
  };

  const handleSimulateUpload = () => {
    setIsUploaded(true);
    soundFX.playSuccessSoftDing();
    if (onUpdateNurse) {
      onUpdateNurse({
        ...nurse,
        policeRecordStatus: 'verified',
        policeRecordVerifiedAt: new Date().toISOString(),
        policeRecordUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'
      });
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition shadow-xl relative overflow-hidden ${content.bgColor}`}>
      {/* Background Accent Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
            isUploaded 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : isPaused
              ? 'bg-red-500/30 text-red-400 border-red-500/50 animate-pulse'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : isPaused ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${content.badgeColor}`}>
                {content.badge}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E63946]" />
                <span>PICA Office: 8 Waterloo Road, Kingston</span>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight">
              {content.title}
            </h4>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {content.message}
            </p>

            {/* Helper Text from Launch Pack */}
            <p className="text-[11px] text-purple-200/80 italic pt-0.5">
              "Don't have police record yet? No problem. You can join and start taking bookings. Upload within 60 days to stay active. Get it at PICA Office, 8 Waterloo Road, Kingston. We will remind you."
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-center justify-end">
          {/* Upload Police Record CTA */}
          {!isUploaded ? (
            <button
              onClick={() => {
                if (onOpenUploadModal) {
                  onOpenUploadModal();
                } else {
                  handleSimulateUpload();
                }
              }}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs shadow-lg transition flex items-center gap-1.5 ${
                isPaused
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white animate-bounce'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isPaused ? 'Upload & Reactivate Now' : 'Upload Police Record'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsUploaded(false)}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5"
              title="Click to reset and test upload again"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified On File</span>
            </button>
          )}

          {/* PICA Directions Link */}
          <a
            href="https://maps.google.com/?q=PICA+8+Waterloo+Road+Kingston+Jamaica"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
            title="Open PICA Waterloo Road in Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
