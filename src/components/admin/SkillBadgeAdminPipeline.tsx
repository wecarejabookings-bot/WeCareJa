import React, { useState, useMemo } from 'react';
import { 
  Award, 
  BadgeCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Filter, 
  User, 
  FileText, 
  Send, 
  Sparkles,
  ChevronRight,
  Eye,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { NurseProfile, NurseSkillBadge } from '../../types';
import { AVAILABLE_SPECIALIZED_SKILLS, SpecializedSkillDefinition } from '../../data/skillBadges';
import { renderSkillIcon } from '../nurse/SkillBadgeSystem';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface SkillBadgeAdminPipelineProps {
  nurses: NurseProfile[];
  onUpdateNurseProfile: (updatedNurse: NurseProfile) => void;
  onGrantSkillBadge?: (nurseId: string, badgeId: string) => void;
  onRejectSkillBadge?: (nurseId: string, badgeId: string, reason: string) => void;
  adminName?: string;
}

export const SkillBadgeAdminPipeline: React.FC<SkillBadgeAdminPipelineProps> = ({
  nurses,
  onUpdateNurseProfile,
  adminName = 'Sydney Mattis, Master Administrator'
}) => {
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'verified' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionModalData, setRejectionModalData] = useState<{
    nurse: NurseProfile;
    badge: NurseSkillBadge;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isDirectGrantModalOpen, setIsDirectGrantModalOpen] = useState(false);
  const [directGrantNurseId, setDirectGrantNurseId] = useState('');
  const [directGrantSkillId, setDirectGrantSkillId] = useState('post-op-care');
  const [actionSuccessNotice, setActionSuccessNotice] = useState('');

  // Collect all requests with nurse reference
  const allBadgeRecords = useMemo(() => {
    const list: Array<{
      nurse: NurseProfile;
      badge: NurseSkillBadge;
    }> = [];

    nurses.forEach(nurse => {
      (nurse.skillBadges || []).forEach(badge => {
        list.push({ nurse, badge });
      });
    });

    return list;
  }, [nurses]);

  const pendingRequests = useMemo(() => {
    return allBadgeRecords.filter(item => item.badge.status === 'pending_review');
  }, [allBadgeRecords]);

  const verifiedBadges = useMemo(() => {
    return allBadgeRecords.filter(item => item.badge.status === 'verified');
  }, [allBadgeRecords]);

  // Filtered view
  const displayedItems = useMemo(() => {
    return allBadgeRecords.filter(item => {
      if (filterStatus === 'pending' && item.badge.status !== 'pending_review') return false;
      if (filterStatus === 'verified' && item.badge.status !== 'verified') return false;
      
      if (filterSkill !== 'all' && item.badge.id !== filterSkill && item.badge.skillName !== filterSkill) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNurse = item.nurse.name.toLowerCase().includes(q) || item.nurse.nursingCouncilLicense.toLowerCase().includes(q);
        const matchSkill = item.badge.skillName.toLowerCase().includes(q);
        if (!matchNurse && !matchSkill) return false;
      }

      return true;
    });
  }, [allBadgeRecords, filterStatus, filterSkill, searchQuery]);

  // Handlers
  const handleGrantBadge = (nurse: NurseProfile, badge: NurseSkillBadge) => {
    soundFX.playBadgeUnlock();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#1E1B4B', '#F59E0B']
    });

    const updatedBadges = (nurse.skillBadges || []).map(b => {
      if (b.id === badge.id) {
        return {
          ...b,
          status: 'verified' as const,
          verifiedAt: new Date().toISOString(),
          verifiedByAdminName: adminName,
          rejectionReason: undefined
        };
      }
      return b;
    });

    // Ensure skill name is in nurse specialties
    const updatedSpecialties = [...nurse.specialties];
    if (!updatedSpecialties.includes(badge.skillName)) {
      updatedSpecialties.push(badge.skillName);
    }

    const updatedNurse: NurseProfile = {
      ...nurse,
      skillBadges: updatedBadges,
      specialties: updatedSpecialties
    };

    onUpdateNurseProfile(updatedNurse);
    setActionSuccessNotice(`Granted 'Verified' badge for "${badge.skillName}" to ${nurse.name}!`);
    setTimeout(() => setActionSuccessNotice(''), 5000);
  };

  const handleOpenRejectModal = (nurse: NurseProfile, badge: NurseSkillBadge) => {
    soundFX.playToggleClick();
    setRejectionModalData({ nurse, badge });
    setRejectionReasonInput('Please provide an official clinical completion certificate or hospital ward letter.');
  };

  const handleConfirmReject = () => {
    if (!rejectionModalData) return;
    const { nurse, badge } = rejectionModalData;

    soundFX.playToggleClick();
    const updatedBadges = (nurse.skillBadges || []).map(b => {
      if (b.id === badge.id) {
        return {
          ...b,
          status: 'rejected' as const,
          rejectionReason: rejectionReasonInput.trim()
        };
      }
      return b;
    });

    onUpdateNurseProfile({
      ...nurse,
      skillBadges: updatedBadges
    });

    setRejectionModalData(null);
    setActionSuccessNotice(`Declined request for "${badge.skillName}" from ${nurse.name} with administrative revision notes.`);
    setTimeout(() => setActionSuccessNotice(''), 5000);
  };

  const handleRevokeBadge = (nurse: NurseProfile, badge: NurseSkillBadge) => {
    soundFX.playToggleClick();
    const updatedBadges = (nurse.skillBadges || []).map(b => {
      if (b.id === badge.id) {
        return {
          ...b,
          status: 'unverified' as const,
          verifiedAt: undefined,
          verifiedByAdminName: undefined
        };
      }
      return b;
    });

    onUpdateNurseProfile({
      ...nurse,
      skillBadges: updatedBadges
    });

    setActionSuccessNotice(`Revoked verified badge "${badge.skillName}" for ${nurse.name}.`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const handleDirectGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const nurse = nurses.find(n => n.id === directGrantNurseId);
    const skillDef = AVAILABLE_SPECIALIZED_SKILLS.find(s => s.id === directGrantSkillId);

    if (!nurse || !skillDef) return;

    soundFX.playBadgeUnlock();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    const currentBadges = nurse.skillBadges || [];
    const exists = currentBadges.find(b => b.id === skillDef.id);

    let updatedBadges: NurseSkillBadge[];
    if (exists) {
      updatedBadges = currentBadges.map(b => {
        if (b.id === skillDef.id) {
          return {
            ...b,
            status: 'verified' as const,
            verifiedAt: new Date().toISOString(),
            verifiedByAdminName: adminName,
            rejectionReason: undefined
          };
        }
        return b;
      });
    } else {
      updatedBadges = [
        ...currentBadges,
        {
          id: skillDef.id,
          skillName: skillDef.name,
          category: skillDef.category,
          status: 'verified' as const,
          verifiedAt: new Date().toISOString(),
          verifiedByAdminName: adminName,
          supportingNote: 'Directly granted by We Care Administration following credentials audit.',
          iconName: skillDef.iconName
        }
      ];
    }

    const updatedSpecialties = [...nurse.specialties];
    if (!updatedSpecialties.includes(skillDef.name)) {
      updatedSpecialties.push(skillDef.name);
    }

    onUpdateNurseProfile({
      ...nurse,
      skillBadges: updatedBadges,
      specialties: updatedSpecialties
    });

    setIsDirectGrantModalOpen(false);
    setActionSuccessNotice(`Directly granted '${skillDef.name}' verified status to ${nurse.name}!`);
    setTimeout(() => setActionSuccessNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-emerald-950/50 border border-purple-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> Clinical Vetting Desk
              </span>
              <span className="text-xs text-purple-300 font-mono">Specialized Skill Badges</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Specialized Skill Badge Verification Command
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Audit and grant official <strong>'Verified'</strong> status for high-risk clinical competencies including <strong>Post-Op Care</strong>, <strong>Pediatric Nursing</strong>, and <strong>Advanced Wound Care</strong>.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDirectGrantNurseId(nurses[0]?.id || '');
                setIsDirectGrantModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Directly Grant Badge to Nurse</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-center">
          <div 
            onClick={() => setFilterStatus('pending')}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              filterStatus === 'pending' 
                ? 'bg-amber-500/20 border-amber-400/60 ring-1 ring-amber-400' 
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Pending Requests</span>
            <span className="text-2xl font-black text-amber-300">{pendingRequests.length}</span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">Awaiting Review</span>
          </div>

          <div 
            onClick={() => setFilterStatus('verified')}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              filterStatus === 'verified' 
                ? 'bg-emerald-500/20 border-emerald-400/60 ring-1 ring-emerald-400' 
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Verified Badges</span>
            <span className="text-2xl font-black text-emerald-300">{verifiedBadges.length}</span>
            <span className="text-[10px] text-emerald-300/80 block mt-0.5">Active on Platform</span>
          </div>

          <div 
            onClick={() => setFilterSkill('post-op-care')}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              filterSkill === 'post-op-care' 
                ? 'bg-purple-500/20 border-purple-400/60 ring-1 ring-purple-400' 
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Post-Op Care</span>
            <span className="text-2xl font-black text-purple-200">
              {allBadgeRecords.filter(i => i.badge.id === 'post-op-care' && i.badge.status === 'verified').length}
            </span>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">Verified Nurses</span>
          </div>

          <div 
            onClick={() => setFilterSkill('pediatric-nursing')}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              filterSkill === 'pediatric-nursing' 
                ? 'bg-sky-500/20 border-sky-400/60 ring-1 ring-sky-400' 
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Pediatric Nursing</span>
            <span className="text-2xl font-black text-sky-300">
              {allBadgeRecords.filter(i => i.badge.id === 'pediatric-nursing' && i.badge.status === 'verified').length}
            </span>
            <span className="text-[10px] text-sky-300/80 block mt-0.5">Verified Nurses</span>
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-semibold">{actionSuccessNotice}</p>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" /> Status:
          </span>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterStatus === 'verified'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Verified ({verifiedBadges.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterStatus === 'all'
                ? 'bg-[#1E1B4B] text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Badges ({allBadgeRecords.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Skills</option>
            <option value="post-op-care">Post-Op Care</option>
            <option value="pediatric-nursing">Pediatric Nursing</option>
            <option value="advanced-wound-care">Advanced Wound Care</option>
            <option value="iv-infusion-therapy">IV Infusion Therapy</option>
            <option value="geriatric-dementia-care">Geriatric &amp; Dementia Care</option>
            <option value="critical-care-monitoring">Critical Care / ICU</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nurse or skill..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* REQUESTS LIST */}
      {displayedItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-white text-base">No Skill Badge Requests Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterStatus === 'pending'
              ? 'All nurse skill verification requests have been audited and resolved!'
              : 'No badges matching your filter criteria.'}
          </p>
          {filterStatus !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setFilterSkill('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedItems.map(({ nurse, badge }) => {
            const isPending = badge.status === 'pending_review';
            const isVerified = badge.status === 'verified';
            const isRejected = badge.status === 'rejected';

            return (
              <div
                key={`${nurse.id}-${badge.id}`}
                className={`p-5 rounded-3xl border transition shadow-xl space-y-4 text-white ${
                  isPending
                    ? 'bg-gradient-to-br from-amber-950/20 via-purple-950/30 to-slate-900/60 border-amber-500/40 ring-1 ring-amber-500/20'
                    : isVerified
                    ? 'bg-gradient-to-br from-emerald-950/20 via-purple-950/20 to-slate-900/60 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                {/* Header: Nurse Identity & Requested Skill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={nurse.photoUrl}
                      alt={nurse.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{nurse.name}</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                          {nurse.nursingCouncilLicense}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300 block">
                        {nurse.qualificationTitle || 'Registered General Nurse (NCJ)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {nurse.phone} • {nurse.email}
                      </span>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div>
                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Pending Review
                      </span>
                    ) : isVerified ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400" /> Revision Requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Skill Details Banner */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                        {renderSkillIcon(badge.iconName, "w-4 h-4 text-emerald-400")}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-purple-300 block">
                          Specialized Skill Request
                        </span>
                        <h5 className="font-bold text-base text-white">
                          {badge.skillName}
                        </h5>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      {badge.category || 'Clinical'}
                    </span>
                  </div>

                  {badge.supportingNote && (
                    <div className="text-xs text-slate-200 bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      <strong className="text-purple-300 block text-[10px] uppercase tracking-wider mb-0.5">
                        Nurse Competency &amp; Experience Statement:
                      </strong>
                      "{badge.supportingNote}"
                    </div>
                  )}

                  {badge.documentProofName && (
                    <div className="flex items-center justify-between text-[11px] bg-purple-950/40 px-3 py-2 rounded-xl border border-purple-500/20 text-purple-200">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate font-mono">Proof: {badge.documentProofName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">
                        Attached Record
                      </span>
                    </div>
                  )}

                  {isVerified && (
                    <div className="text-[11px] text-emerald-300 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Granted by: {badge.verifiedByAdminName || 'Master Administrator'}</span>
                      </span>
                      {badge.verifiedAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(badge.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {isRejected && badge.rejectionReason && (
                    <div className="text-xs text-rose-200 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                      <strong className="block text-[10px] text-rose-400 uppercase">Admin Revision Feedback:</strong>
                      {badge.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Admin Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[10px] text-slate-400">
                    {badge.requestedAt 
                      ? `Submitted: ${new Date(badge.requestedAt).toLocaleDateString()}` 
                      : 'Recently submitted'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(nurse, badge)}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/15 hover:border-red-500/30 text-xs font-semibold transition cursor-pointer"
                        >
                          Request Revision
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGrantBadge(nurse, badge)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <BadgeCheck className="w-4 h-4 text-emerald-200" />
                          <span>Grant 'Verified' Status</span>
                        </button>
                      </>
                    ) : isVerified ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeBadge(nurse, badge)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-medium transition cursor-pointer"
                        title="Revoke verified status"
                      >
                        Revoke Badge
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGrantBadge(nurse, badge)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Re-Verify &amp; Grant</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: DECLINE / REQUEST REVISION */}
      {rejectionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#180a29] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>Request Revision for Skill Badge</span>
                </h4>
                <p className="text-xs text-slate-400">
                  {rejectionModalData.nurse.name} • {rejectionModalData.badge.skillName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalData(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-300 block">
                Clinical Revision Feedback / Missing Documentation:
              </label>
              <textarea
                rows={4}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Explain what documentation or clinical verification is needed before this badge can be granted..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[11px] text-slate-400">
                This note will be displayed to {rejectionModalData.nurse.name} in their nurse portal with an option to upload updated evidence.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectionModalData(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Send Revision Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECTLY GRANT BADGE TO ANY NURSE */}
      {isDirectGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#180a29] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#1E1B4B] flex items-center justify-center text-white">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">
                    Directly Award Verified Skill Badge
                  </h4>
                  <p className="text-xs text-slate-400">
                    Administrator bypass grant following in-person or clinical record inspection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectGrantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDirectGrant} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Select Nurse Profile</label>
                <select
                  value={directGrantNurseId}
                  onChange={(e) => setDirectGrantNurseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#231038] border border-white/15 text-white"
                >
                  {nurses.map(n => (
                    <option key={n.id} value={n.id} className="bg-[#180a29]">
                      {n.name} ({n.nursingCouncilLicense || n.qualificationTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Specialized Skill</label>
                <select
                  value={directGrantSkillId}
                  onChange={(e) => setDirectGrantSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#231038] border border-white/15 text-white"
                >
                  {AVAILABLE_SPECIALIZED_SKILLS.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#180a29]">
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  This will grant the <strong>'Verified'</strong> status immediately, stamped with administrator <strong>{adminName}</strong>.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDirectGrantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Grant Verified Status Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
