import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  ShieldCheck, 
  Award, 
  Star, 
  MapPin, 
  Stethoscope, 
  Heart, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  ExternalLink, 
  ChevronRight, 
  HeartHandshake, 
  BadgeCheck, 
  Info, 
  GraduationCap, 
  Building2, 
  Check, 
  Eye, 
  Radio, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { NurseProfile, UserAccount } from '../../types';
import { ServiceLogo } from '../common/ServiceLogo';
import { soundFX } from '../../utils/soundEffects';

interface NursingTeamDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurses: NurseProfile[];
  onSelectNurseForBooking: (nurse: NurseProfile) => void;
  onRequestLovedOneCheck?: (nurse: NurseProfile, lovedOneTitle?: string) => void;
  onViewNurseDetail?: (nurse: NurseProfile) => void;
  currentUser?: UserAccount | null;
}

export const NursingTeamDirectoryModal: React.FC<NursingTeamDirectoryModalProps> = ({
  isOpen,
  onClose,
  nurses = [],
  onSelectNurseForBooking,
  onRequestLovedOneCheck,
  onViewNurseDetail,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareLevel, setSelectedCareLevel] = useState<'all' | 'registered_nurse' | 'caregiver'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [onlyOnCall, setOnlyOnCall] = useState(false);

  // Filter approved and verified nurses only (protecting privacy, removing unverified/pending)
  const approvedNurses = useMemo(() => {
    return nurses.filter(n => n.status === 'approved' || n.licenseVerified === true);
  }, [nurses]);

  // Extract all available service zones across approved practitioners
  const availableZones = useMemo(() => {
    const zonesSet = new Set<string>();
    approvedNurses.forEach(n => {
      (n.zones || []).forEach(z => zonesSet.add(z));
    });
    return Array.from(zonesSet);
  }, [approvedNurses]);

  // Extract all specialties
  const availableSpecialties = useMemo(() => {
    const specSet = new Set<string>();
    approvedNurses.forEach(n => {
      (n.specialties || []).forEach(s => specSet.add(s));
    });
    return Array.from(specSet);
  }, [approvedNurses]);

  // Filtered nurses
  const filteredNurses = useMemo(() => {
    return approvedNurses.filter(n => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchName = n.name.toLowerCase().includes(q);
      const matchQual = (n.qualification || n.qualificationTitle || '').toLowerCase().includes(q);
      const matchSchool = (n.institutionAttended || '').toLowerCase().includes(q);
      const matchBio = (n.bio || '').toLowerCase().includes(q);
      const matchSpecs = (n.specialties || []).some(s => s.toLowerCase().includes(q));
      const matchZones = (n.zones || []).some(z => z.toLowerCase().includes(q));

      if (q && !matchName && !matchQual && !matchSchool && !matchBio && !matchSpecs && !matchZones) {
        return false;
      }

      // 2. Care Level Filter
      if (selectedCareLevel === 'registered_nurse') {
        const isRN = n.careLevel === 'registered_nurse' || (!n.careLevel && n.requiresNcjRegistration !== false);
        if (!isRN) return false;
      } else if (selectedCareLevel === 'caregiver') {
        const isCaregiver = n.careLevel === 'geriatric_caregiver' || n.careLevel === 'practical_nurse_aide' || n.requiresNcjRegistration === false;
        if (!isCaregiver) return false;
      }

      // 3. Zone Filter
      if (selectedZone !== 'all') {
        const hasZone = (n.zones || []).some(z => z.toLowerCase().includes(selectedZone.toLowerCase()));
        if (!hasZone) return false;
      }

      // 4. Specialty Filter
      if (selectedSpecialty !== 'all') {
        const hasSpec = (n.specialties || []).some(s => s.toLowerCase() === selectedSpecialty.toLowerCase());
        if (!hasSpec) return false;
      }

      // 5. On-Call Only Filter
      if (onlyOnCall && n.availabilityStatus === 'offline') {
        return false;
      }

      return true;
    });
  }, [approvedNurses, searchQuery, selectedCareLevel, selectedZone, selectedSpecialty, onlyOnCall]);

  if (!isOpen) return null;

  const handleBookNurse = (nurse: NurseProfile) => {
    soundFX.playClick();
    onSelectNurseForBooking(nurse);
    onClose();
  };

  const handleLovedOneCheck = (nurse: NurseProfile) => {
    soundFX.playClick();
    if (onRequestLovedOneCheck) {
      onRequestLovedOneCheck(nurse, 'Loved One');
    } else {
      onSelectNurseForBooking(nurse);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#140526] border border-purple-500/30 text-white shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-7 border-b border-white/10 bg-gradient-to-r from-[#1A1E4E] via-[#230d36] to-[#0e0316] relative shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  100% NCJ-Verified Caregivers
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  {approvedNurses.length} Licensed Practitioners on WeCareTrack
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Kingston • St. Andrew • St. Catherine • Portmore
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-[#3B82F6]" />
                <span>Meet Our Certified Clinical Nursing Team</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Connect directly with certified Jamaican practitioners. Review accredited clinical qualifications, verified NCJ licensing, institution backgrounds, and real patient reviews.
              </p>
            </div>

            <button
              onClick={() => {
                soundFX.playToggleClick();
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer self-start sm:self-auto border border-white/10"
              title="Close Directory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy & Safety Guarantee Badge */}
          <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] sm:text-xs">
                <strong>Patient &amp; Family Privacy Protected:</strong> All practitioner credentials have been verified by WeCare Jamaica administrators. Internal statutory documents (TRN, driver's license scans, and background dossiers) are strictly restricted to administrative compliance auditing.
              </span>
            </div>
            <span className="hidden md:inline-block px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0 border border-emerald-400/30">
              Audited &amp; Compliant
            </span>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-white/10">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nurses by name, specialty, or university..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-[#3B82F6] outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Care Tier Filter */}
            <div>
              <select
                value={selectedCareLevel}
                onChange={(e) => setSelectedCareLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-[#3B82F6] outline-none transition cursor-pointer"
              >
                <option value="all">All Care Tiers</option>
                <option value="registered_nurse">🩺 NCJ Registered Nurses (RN)</option>
                <option value="caregiver">🤝 Geriatric &amp; Practical Aides</option>
              </select>
            </div>

            {/* Zone Filter */}
            <div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-[#3B82F6] outline-none transition cursor-pointer"
              >
                <option value="all">All Jamaican Zones</option>
                <option value="Kingston">Kingston (All)</option>
                <option value="St. Andrew">St. Andrew</option>
                <option value="Portmore">Portmore</option>
                <option value="Spanish Town">Spanish Town</option>
                {availableZones.slice(0, 10).map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* On-Call Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => setOnlyOnCall(!onlyOnCall)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                  onlyOnCall
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                    : 'bg-black/60 text-slate-300 border-white/15 hover:bg-white/5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${onlyOnCall ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{onlyOnCall ? '🟢 Live On-Call' : 'Show On-Call'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MODAL BODY: NURSE DIRECTORY ROSTER */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredNurses.length}</strong> verified practitioners
            </span>
            {(searchQuery || selectedCareLevel !== 'all' || selectedZone !== 'all' || onlyOnCall) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCareLevel('all');
                  setSelectedZone('all');
                  setSelectedSpecialty('all');
                  setOnlyOnCall(false);
                }}
                className="text-[#3B82F6] hover:underline cursor-pointer font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredNurses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-black/20 rounded-3xl border border-white/5">
              <Stethoscope className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-bold text-white text-base">No practitioners match your current filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or selecting "All Care Tiers" to view all active caregivers across Jamaica.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNurses.map((nurse) => {
                const isRegisteredNurse = nurse.careLevel === 'registered_nurse' || (!nurse.careLevel && nurse.requiresNcjRegistration !== false);
                const isOnCall = nurse.availabilityStatus !== 'offline';

                return (
                  <div
                    key={nurse.id}
                    className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-blue-400/50 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top Glow Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 group-hover:bg-blue-600/20 transition-all" />

                    <div>
                      {/* Practitioner Identity Row */}
                      <div className="flex items-start gap-3.5 pb-3 border-b border-white/10">
                        <div className="relative shrink-0">
                          <img
                            src={nurse.photoUrl}
                            alt={nurse.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#3B82F6]/60 shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                            onClick={() => onViewNurseDetail?.(nurse)}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#140526] ${
                              isOnCall ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                            }`}
                            title={isOnCall ? 'On-Call & Ready for Dispatch' : 'Offline / Scheduled Visits Only'}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-base text-white truncate group-hover:text-blue-300 transition">
                              {nurse.name}
                            </h3>
                            {isRegisteredNurse ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" /> NCJ Registered
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-0.5">
                                <HeartHandshake className="w-3 h-3 text-cyan-400" /> Certified Aide
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-blue-300 font-semibold mt-0.5 truncate">
                            {nurse.qualificationTitle || nurse.qualification || (isRegisteredNurse ? 'Registered General Nurse (RN)' : 'Certified Geriatric Care Assistant')}
                          </p>

                          {/* University / Institution */}
                          {nurse.institutionAttended && (
                            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 truncate">
                              <GraduationCap className="w-3 h-3 text-purple-300 shrink-0" />
                              <span className="truncate">{nurse.institutionAttended}</span>
                            </p>
                          )}

                          {/* Quick Rating & Completed Visits */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs">
                            <div className="flex items-center gap-1 text-amber-300 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-300" />
                              <span>{nurse.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-300 text-[11px]">
                              {nurse.yearsExperience || 3} Yrs Exp
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-emerald-400 text-[11px] font-semibold">
                              {nurse.completedVisitsCount || nurse.reviewCount || 12} Visits Done
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio Statement */}
                      {nurse.bio && (
                        <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed italic">
                          "{nurse.bio}"
                        </p>
                      )}

                      {/* Clinical Specialties */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Clinical Competencies &amp; Services:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(nurse.specialties || []).slice(0, 4).map((spec, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-white/5 text-purple-200 border border-white/10 text-[10px] font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{spec}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Service Zones */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-300 flex-wrap">
                        <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                        <span className="font-semibold text-slate-400">Coverage:</span>
                        <span>{(nurse.zones || ['Kingston & St. Andrew']).slice(0, 3).join(', ')}</span>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate from</span>
                        <strong className="text-sm font-black text-white">
                          JMD ${(nurse.hourlyRateJMD || 4500).toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-400">/hr</span>
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewNurseDetail && (
                          <button
                            type="button"
                            onClick={() => onViewNurseDetail(nurse)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition cursor-pointer flex items-center gap-1"
                            title="Inspect full public profile and verified credentials"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span>Profile</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleLovedOneCheck(nurse)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-1 shadow-md shadow-emerald-950/40 cursor-pointer border border-emerald-400/30"
                          title="Dispatch nurse to check in on Mom, Dad, or an aging relative"
                        >
                          <Heart className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
                          <span>Check Loved One</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBookNurse(nurse)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1A1E4E] via-[#2E8BFF] to-[#F59E0B] hover:brightness-110 text-white text-xs font-black transition flex items-center gap-1 shadow-md cursor-pointer border border-amber-400/30"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>All practitioners are independently licensed under Jamaican Nursing regulations &amp; insured.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition cursor-pointer"
          >
            Done Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
