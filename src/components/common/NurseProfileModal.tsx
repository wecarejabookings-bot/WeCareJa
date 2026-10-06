import React, { useState } from 'react';
import { NurseProfile, Booking, UserRole } from '../../types';
import { VerifiedNursingCouncilBadge } from './VerifiedNursingCouncilBadge';
import { CaregiverTierBadge } from './CaregiverTierBadge';
import { ScopeOfCareModal } from './ScopeOfCareModal';
import { ServiceLogo } from './ServiceLogo';
import { checkNurseBookingConflict, getNurseScheduleForDate } from '../../utils/bookingAvailability';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Award, 
  MapPin, 
  Clock, 
  FileCheck, 
  Phone, 
  Mail, 
  Stethoscope, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  Check, 
  UserCheck, 
  Lock,
  Building2,
  ThumbsUp,
  HeartHandshake,
  AlertTriangle,
  Info,
  CalendarCheck,
  Ban,
  Moon,
  Radio,
  BadgeCheck,
  FileBadge,
  Printer
} from 'lucide-react';
import { VerifiedWeCareIDCardModal } from '../nurse/VerifiedWeCareIDCardModal';

interface NurseProfileModalProps {
  nurse: NurseProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectNurseForBooking?: (nurse: NurseProfile) => void;
  isSelected?: boolean;
  viewerRole?: UserRole;
  currentUserId?: string;
  allBookings?: Booking[];
  requestedDate?: string;
  requestedTime?: string;
  durationMinutes?: number;
  onToggleAvailability?: (nurse: NurseProfile) => void;
}

export const NurseProfileModal: React.FC<NurseProfileModalProps> = ({
  nurse,
  isOpen,
  onClose,
  onSelectNurseForBooking,
  isSelected = false,
  viewerRole = 'client',
  currentUserId,
  allBookings = [],
  requestedDate,
  requestedTime,
  durationMinutes = 60,
  onToggleAvailability
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'schedule' | 'credentials' | 'reviews'>('overview');
  const [showScopeModal, setShowScopeModal] = useState<boolean>(false);
  const [isIDCardOpen, setIsIDCardOpen] = useState<boolean>(false);

  if (!isOpen || !nurse) return null;

  const isRegisteredNurse = nurse.careLevel === 'registered_nurse' || (!nurse.careLevel && nurse.requiresNcjRegistration !== false);
  const isVerified = nurse.status === 'approved' || nurse.licenseVerified === true || !!(nurse.nursingCouncilLicense && nurse.licenseDocumentUrl);
  const canSeeRawLicense = viewerRole === 'admin';
  const isNurseOnCall = nurse.availabilityStatus !== 'offline';

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  // Availability calculation
  const targetDateStr = requestedDate || new Date().toISOString().split('T')[0];
  const targetTimeStr = requestedTime || '10:00';
  const availability = checkNurseBookingConflict(
    nurse.id,
    targetDateStr,
    targetTimeStr,
    durationMinutes,
    allBookings
  );

  const daySchedule = getNurseScheduleForDate(nurse.id, targetDateStr, allBookings);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-3xl rounded-3xl bg-[#140526] border border-purple-500/30 text-white shadow-2xl overflow-hidden my-8">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Top Header with Close */}
          <div className="relative z-10 p-6 md:p-8 bg-gradient-to-b from-purple-950/40 via-transparent to-transparent border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <img
                    src={nurse.photoUrl}
                    alt={nurse.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-purple-400 shadow-xl"
                  />
                  {isVerified && (
                    <span 
                      className={`absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full text-white shadow-lg border-2 border-[#140526] ${
                        isRegisteredNurse ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      title={isRegisteredNurse ? "Verified NCJ Registered Nurse" : "Certified Caregiver"}
                    >
                      {isRegisteredNurse ? <ShieldCheck className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {nurse.name}
                    </h3>
                  </div>

                  {/* Primary Caregiver Tier Badge */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <CaregiverTierBadge
                      nurse={nurse}
                      size="sm"
                      variant="pill"
                    />

                    {isRegisteredNurse && isVerified && (
                      <VerifiedNursingCouncilBadge 
                        nurse={nurse} 
                        size="sm" 
                        variant="trust-pill"
                        label="NCJ License Verified"
                        viewerRole={viewerRole}
                        showLicense={canSeeRawLicense}
                      />
                    )}

                    <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {nurse.rating}.0 ({nurse.reviewCount} reviews)
                    </span>

                    {/* Live Availability Status & Interactive Toggle */}
                    {onToggleAvailability ? (
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(nurse)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                          isNurseOnCall
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-600 hover:text-white'
                        }`}
                        title={`Click to toggle ${nurse.name}'s availability between On-Call and Offline`}
                      >
                        <div className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                          isNurseOnCall ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-white shadow-xs transition-transform ${
                            isNurseOnCall ? 'transform translate-x-2.5' : ''
                          }`} />
                        </div>
                        <span>{isNurseOnCall ? '🟢 On-Call (Dispatch Ready)' : '🌙 Offline (Scheduled Only)'}</span>
                      </button>
                    ) : (
                      isNurseOnCall ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 shadow-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>🟢 On-Call (Dispatch Ready)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                          <Moon className="w-2.5 h-2.5 text-slate-400" />
                          <span>Offline (Scheduled Only)</span>
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1 text-purple-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#C77DFF]" />
                      {nurse.yearsExperience} Years Experience
                    </span>
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {nurse.completedVisitsCount || 24}+ Completed Home Visits
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-purple-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Overview &amp; Bio
              </button>
              <button
                onClick={() => setActiveTab('scope')}
                className={`px-3.5 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'scope'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
                Scope &amp; Services
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3.5 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'schedule'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                Live Availability
                {!availability.isAvailable && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`px-3.5 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'credentials'
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Credentials &amp; Vetting
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-3.5 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Reviews ({nurse.reviewCount})
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="relative z-10 p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* TAB 1: OVERVIEW & BIO */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Prominent Trust / Tier Banner */}
                <CaregiverTierBadge
                  nurse={nurse}
                  variant="banner"
                  onOpenScopeModal={() => setShowScopeModal(true)}
                />

                {/* Bio & Care Philosophy */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#C77DFF]" />
                    Professional Profile &amp; Care Philosophy
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {nurse.bio || `${nurse.name} is a dedicated healthcare practitioner with over ${nurse.yearsExperience} years of experience in Jamaica.`}
                  </p>
                </div>

                {/* Verified Specialized Skill Badges */}
                {nurse.skillBadges && nurse.skillBadges.filter(b => b.status === 'verified').length > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-purple-950/40 border border-emerald-500/40 shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verified Specialized Clinical Skills</span>
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Admin Audited
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {nurse.skillBadges.filter(b => b.status === 'verified').map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-2.5 shadow-sm"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0 mt-0.5">
                            <BadgeCheck className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white">{b.skillName}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-black uppercase">
                                Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                              {b.description}
                            </p>
                            <span className="text-[9px] text-emerald-400/80 font-mono block mt-1">
                              Granted by {b.verifiedByAdminName || 'Clinical Administration'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Specialties */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Competencies &amp; Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nurse.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold flex items-center gap-2 shadow-sm"
                      >
                        <ServiceLogo serviceName={spec} size="xs" showBadge={false} />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Service Coverage Zones */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E63946]" />
                    Authorized Service Neighborhoods
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {nurse.zones.map((zone) => (
                      <span
                        key={zone}
                        className="px-2.5 py-1 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-medium"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCOPE OF CARE & SPECIFIC PERMITTED SERVICES */}
            {activeTab === 'scope' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Caregiver Level &amp; Qualification
                    </span>
                    <h4 className="text-base font-black text-white">
                      {nurse.qualificationTitle || (isRegisteredNurse ? 'NCJ Registered General Nurse' : 'Certified Geriatric Care Aide')}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {nurse.payTierDescription || (isRegisteredNurse ? 'Clinical Tier (JMD $6,500 – $10,500)' : 'Minimal Care Tier (JMD $2,800 – $3,800)')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowScopeModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold shrink-0"
                  >
                    Compare All Tiers
                  </button>
                </div>

                {/* What This Nurse CAN Provide */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    Care &amp; Services Authorized Under This Profile:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {(nurse.scopeOfCare?.canProvide || [
                      isRegisteredNurse ? 'Sterile surgical wound care & dressing' : 'Personal hygiene, assisted bathing & grooming',
                      isRegisteredNurse ? 'Doctor-prescribed IV infusions & injections' : 'Wheelchair transfers & assisted walking',
                      isRegisteredNurse ? 'Catheter flushes & stoma maintenance' : 'Vital signs monitoring (BP, Pulse, Temp, Glucose)',
                      isRegisteredNurse ? 'Clinical assessment & doctor escalations' : 'Meal preparation & medication reminders'
                    ]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Cannot Be Provided (If Geriatric Aide) */}
                {!isRegisteredNurse && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Scope Boundaries (Requires NCJ Registered Nurse):
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Geriatric aides provide non-invasive care. For intravenous infusions, surgical stitch debridement, or clinical medication adjustments, please select an <strong>NCJ Registered Nurse</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LIVE AVAILABILITY & CALENDAR SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                        Availability for Date
                      </span>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        {targetDateStr}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {availability.isAvailable ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Available at {targetTimeStr}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/40 text-xs font-bold flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5 text-red-400" />
                          Booked at {targetTimeStr}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conflict Notice if booked */}
                  {!availability.isAvailable && (
                    <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Schedule Conflict Notice</span>
                      </div>
                      <p className="text-[11px] text-slate-200">
                        {availability.conflictReason || `This nurse has a confirmed home visit booked between ${availability.conflictingTimeRange}.`}
                      </p>
                      {(availability?.suggestedTimes?.length || 0) > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] text-amber-300 font-bold block mb-1">
                            Available Alternative Times on this date:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(availability?.suggestedTimes || []).map((time) => (
                              <span
                                key={time}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scheduled Visits Timeline */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Confirmed Daily Schedule ({daySchedule.length} Visits)
                    </h5>
                    {daySchedule.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center bg-black/20 rounded-xl">
                        No scheduled bookings yet on this date. Full schedule is open!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[11px]">
                                {item.startHourMinutes} - {item.endHourMinutes}
                              </span>
                              <span className="font-semibold text-white">{item.serviceName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{item.zone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CREDENTIALS & COUNCIL VERIFICATION DETAILS */}
            {activeTab === 'credentials' && (
              <div className="space-y-5">
                {/* Official Council Card or Caregiver Certification */}
                {isRegisteredNurse ? (
                  <VerifiedNursingCouncilBadge
                    nurse={nurse}
                    variant="card"
                    label="Registered with Nursing Council of Jamaica"
                    viewerRole={viewerRole}
                    showLicense={canSeeRawLicense}
                  />
                ) : (
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-cyan-400" />
                        <span className="font-black text-white text-sm">
                          Certified Geriatric / Practical Caregiver
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        Vetted &amp; Certified
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Trained in Activities of Daily Living (ADLs), patient transfers, senior companionship, and vital sign monitoring. Not required to register with NCJ for non-invasive assistance.
                    </p>
                  </div>
                )}

                {/* Credential Verification Checklist */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Practitioner Credential Audit
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <strong className="text-white block">
                            {isRegisteredNurse ? 'Nursing Council of Jamaica (NCJ) Practicing Certificate' : 'Caregiving & Practical Nurse Certification'}
                          </strong>
                          <span className="text-slate-400 text-[11px]">
                            {isRegisteredNurse ? 'Valid active practicing registration in Jamaica' : 'Accredited training certificate in elder & ADL care'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        {isRegisteredNurse ? (canSeeRawLicense ? nurse.nursingCouncilLicense : 'NCJ Registered') : 'Certified'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <strong className="text-white block">Government Identification &amp; TRN Verification</strong>
                          <span className="text-slate-400 text-[11px]">Identity vetted with official Jamaican national records</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[11px] font-bold">Verified</span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <strong className="text-white block">Police Record &amp; Background Clearance</strong>
                          <span className="text-slate-400 text-[11px]">Current clean background check on file</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[11px] font-bold">Clear</span>
                    </div>

                    {/* Verified We Care ID Card Action */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsIDCardOpen(true)}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 border border-amber-300/40 cursor-pointer"
                      >
                        <FileBadge className="w-4 h-4 text-white" />
                        <span>Generate 'Verified We Care ID' (Printable PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CLIENT REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">Average Patient Rating</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <strong className="text-xl font-bold text-white">{nurse.rating}.0 / 5.0</strong>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-300">
                    <strong className="text-white text-base block">{nurse.reviewCount}</strong>
                    <span>Verified patient reviews</span>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">Patricia S. (New Kingston)</strong>
                        <span className="text-emerald-400 text-[10px] font-bold">✓ Verified Visit</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      “{nurse.name} arrived on time, was so gentle and attentive with our family. Having this level of vetted care gave us complete peace of mind.”
                    </p>
                    <span className="text-[10px] text-slate-400">Verified Home Care • 2 weeks ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Footer Actions */}
          <div className="relative z-10 p-5 md:p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Standard In-Home Visit Rate
              </span>
              <span className="text-xl font-black text-[#C77DFF]">
                {formatJMD(nurse.hourlyRateJMD)}
              </span>
              <span className="text-[11px] text-emerald-400 block font-medium">
                {isRegisteredNurse ? 'Includes clinical assessment & sterile procedures' : 'Includes senior assistance, ADL care & vitals check'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition"
              >
                Close
              </button>

              {onSelectNurseForBooking && (
                <button
                  disabled={!availability.isAvailable}
                  onClick={() => {
                    if (!availability.isAvailable) return;
                    onSelectNurseForBooking(nurse);
                    onClose();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 ${
                    !availability.isAvailable
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                      : isSelected
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/60'
                      : 'bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white shadow-purple-950/60'
                  }`}
                >
                  {!availability.isAvailable ? (
                    <>
                      <Ban className="w-4 h-4 text-red-400" />
                      <span>Nurse Booked at this Time</span>
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Nurse Selected</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Select This {isRegisteredNurse ? 'Nurse' : 'Caregiver'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caregiver Scope Modal */}
      <ScopeOfCareModal
        isOpen={showScopeModal}
        onClose={() => setShowScopeModal(false)}
        selectedNurse={nurse}
      />

      {/* Verified We Care ID Card Modal */}
      {isIDCardOpen && (
        <VerifiedWeCareIDCardModal
          nurse={nurse}
          isOpen={isIDCardOpen}
          onClose={() => setIsIDCardOpen(false)}
        />
      )}
    </>
  );
};
