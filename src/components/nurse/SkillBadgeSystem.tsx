import React, { useState } from 'react';
import { 
  Award, 
  BadgeCheck, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Baby, 
  Activity, 
  Bandage, 
  Syringe, 
  HeartHandshake, 
  HeartPulse, 
  Zap, 
  Send,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { NurseProfile, NurseSkillBadge } from '../../types';
import { AVAILABLE_SPECIALIZED_SKILLS, SpecializedSkillDefinition } from '../../data/skillBadges';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface SkillBadgeSystemProps {
  currentNurse: NurseProfile;
  onUpdateNurseProfile: (updated: NurseProfile) => void;
  readOnly?: boolean;
}

// Icon helper
export const renderSkillIcon = (iconName?: string, className = "w-4 h-4") => {
  switch (iconName) {
    case 'Baby':
      return <Baby className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Bandage':
      return <Bandage className={className} />;
    case 'Syringe':
      return <Syringe className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'ShieldCheck':
    default:
      return <BadgeCheck className={className} />;
  }
};

/**
 * Compact Pill for Nurse Cards and Search Listings
 */
export const VerifiedSkillPill: React.FC<{
  badge: NurseSkillBadge;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}> = ({ badge, size = 'sm' }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (badge.status !== 'verified') {
    return null;
  }

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all cursor-pointer shadow-sm ${
          isSmall 
            ? 'px-2.5 py-0.5 text-[10px] bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400' 
            : 'px-3 py-1 text-xs bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-950/90 text-emerald-200 border border-emerald-500/50 hover:border-emerald-300'
        }`}
      >
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <BadgeCheck className="w-3 h-3" />
        </span>
        <span className="truncate">{badge.skillName}</span>
        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-300 uppercase tracking-wider font-extrabold font-mono">
          Verified
        </span>
      </div>

      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 rounded-2xl bg-[#160a26] border border-emerald-500/40 shadow-2xl text-left pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs mb-1">
            <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verified: {badge.skillName}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
            {badge.supportingNote || 'Clinically assessed and audited by We Care Clinical Administration.'}
          </p>
          <div className="text-[9px] text-slate-400 border-t border-white/10 pt-1.5 flex flex-col gap-0.5">
            <span>Verified by: <strong className="text-white">{badge.verifiedByAdminName || 'Master Clinical Admin'}</strong></span>
            {badge.verifiedAt && (
              <span>Date: {new Date(badge.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Skill Badge Manager Component for Nurse Profile Tab
 */
export const NurseSkillBadgesManager: React.FC<SkillBadgeSystemProps> = ({
  currentNurse,
  onUpdateNurseProfile,
  readOnly = false
}) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSkillToRequest, setSelectedSkillToRequest] = useState<SpecializedSkillDefinition | null>(null);
  const [supportingNote, setSupportingNote] = useState('');
  const [documentProofName, setDocumentProofName] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [requestSuccessNotice, setRequestSuccessNotice] = useState('');

  const badges = currentNurse.skillBadges || [];
  const verifiedBadges = badges.filter(b => b.status === 'verified');
  const pendingBadges = badges.filter(b => b.status === 'pending_review');
  const rejectedBadges = badges.filter(b => b.status === 'rejected');

  // Available skills that haven't been requested or verified yet
  const availableToRequest = AVAILABLE_SPECIALIZED_SKILLS.filter(spec => {
    const existing = badges.find(b => b.id === spec.id);
    return !existing || existing.status === 'unverified' || existing.status === 'rejected';
  });

  const handleOpenRequest = (skillDef?: SpecializedSkillDefinition) => {
    soundFX.playToggleClick();
    if (skillDef) {
      setSelectedSkillToRequest(skillDef);
      setCustomSkillName('');
      setSupportingNote('');
      setDocumentProofName(skillDef.suggestedProofDocument);
    } else {
      setSelectedSkillToRequest(null);
      setCustomSkillName('');
      setSupportingNote('');
      setDocumentProofName('');
    }
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = selectedSkillToRequest ? selectedSkillToRequest.name : customSkillName.trim();
    const skillId = selectedSkillToRequest ? selectedSkillToRequest.id : `custom-${String(skillName || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (!skillName) return;

    soundFX.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    const newBadge: NurseSkillBadge = {
      id: skillId,
      skillName: skillName,
      category: selectedSkillToRequest?.category || 'specialized',
      status: 'pending_review',
      requestedAt: new Date().toISOString(),
      supportingNote: supportingNote.trim() || `Request for official verified status in ${skillName}.`,
      documentProofName: documentProofName.trim() || 'Clinical_Experience_Proof.pdf',
      iconName: selectedSkillToRequest?.iconName || 'BadgeCheck'
    };

    // Update nurse profile
    const currentBadges = currentNurse.skillBadges || [];
    const updatedBadges = currentBadges.filter(b => b.id !== skillId);
    updatedBadges.push(newBadge);

    // Also add to nurse specialties if not already present
    const updatedSpecialties = [...currentNurse.specialties];
    if (!updatedSpecialties.includes(skillName)) {
      updatedSpecialties.push(skillName);
    }

    const updatedNurse: NurseProfile = {
      ...currentNurse,
      skillBadges: updatedBadges,
      specialties: updatedSpecialties
    };

    onUpdateNurseProfile(updatedNurse);
    setIsRequestModalOpen(false);
    setRequestSuccessNotice(`Your verification request for "${skillName}" has been submitted to the We Care Admin Portal for clinical review.`);
    setTimeout(() => setRequestSuccessNotice(''), 6000);
  };

  const handleCancelPendingRequest = (badgeId: string) => {
    soundFX.playToggleClick();
    const updatedBadges = (currentNurse.skillBadges || []).map(b => {
      if (b.id === badgeId) {
        return {
          ...b,
          status: 'unverified' as const
        };
      }
      return b;
    });

    onUpdateNurseProfile({
      ...currentNurse,
      skillBadges: updatedBadges
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Skill System Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-purple-950/60 border border-purple-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#7209B7] flex items-center justify-center text-white shadow-lg shadow-purple-950/50 shrink-0 border border-white/20">
              <Award className="w-6 h-6 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Specialized Clinical Skill Badges</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Admin Audited</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Nurses can request official <strong>'Verified'</strong> badge status for high-acuity skills like <strong>Post-Op Care</strong> or <strong>Pediatric Nursing</strong>. Granted badges are displayed on client proximity cards and elevate your dispatch priority.
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => handleOpenRequest()}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Request Skill Verification</span>
            </button>
          )}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Verified Badges</span>
            <span className="text-lg font-black text-emerald-300">{verifiedBadges.length}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pending Admin Review</span>
            <span className="text-lg font-black text-amber-300">{pendingBadges.length}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Available to Request</span>
            <span className="text-lg font-black text-purple-300">{availableToRequest.length}</span>
          </div>
        </div>
      </div>

      {requestSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="font-medium">{requestSuccessNotice}</p>
        </div>
      )}

      {/* SECTION 1: VERIFIED SKILL BADGES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Verified Badges ({verifiedBadges.length})</span>
          </h4>
          <span className="text-[10px] text-slate-400">
            Visible on Client Booking Cards &amp; Proximity Map
          </span>
        </div>

        {verifiedBadges.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h5 className="text-xs font-bold text-white">No Verified Skill Badges Yet</h5>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Request verified status for your key clinical skills below to receive the green verified emblem on your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {verifiedBadges.map((badge) => (
              <div 
                key={badge.id}
                className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-purple-950/20 to-slate-900/60 border border-emerald-500/40 shadow-lg text-white space-y-2.5 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      {renderSkillIcon(badge.iconName, "w-4 h-4")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-white">{badge.skillName}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block capitalize">
                        {badge.category || 'Clinical'} Specialization
                      </span>
                    </div>
                  </div>
                </div>

                {badge.supportingNote && (
                  <p className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 italic">
                    "{badge.supportingNote}"
                  </p>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Granted by {badge.verifiedByAdminName || 'Master Administrator'}</span>
                  </span>
                  {badge.verifiedAt && (
                    <span>{new Date(badge.verifiedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: PENDING ADMIN REVIEW */}
      {pendingBadges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Review by Admin Portal ({pendingBadges.length})</span>
            </h4>
            <span className="text-[10px] text-amber-300/80">
              Admin review typically takes 12-24 hours
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingBadges.map((badge) => (
              <div 
                key={badge.id}
                className="p-4 rounded-3xl bg-amber-950/20 border border-amber-500/30 text-white space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                      {renderSkillIcon(badge.iconName, "w-4 h-4")}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-sm text-white">{badge.skillName}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Under Review
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Requested on {badge.requestedAt ? new Date(badge.requestedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleCancelPendingRequest(badge.id)}
                      className="text-[10px] text-slate-400 hover:text-red-300 underline cursor-pointer"
                      title="Withdraw request"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {badge.supportingNote && (
                  <p className="text-[11px] text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <strong>Nurse Submission Note:</strong> {badge.supportingNote}
                  </p>
                )}

                {badge.documentProofName && (
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-300">
                    <FileText className="w-3 h-3 text-purple-400" />
                    <span>Attached Proof: {badge.documentProofName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: REJECTED / NEEDS REVISION */}
      {rejectedBadges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Verification Needs Revision ({rejectedBadges.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rejectedBadges.map((badge) => (
              <div 
                key={badge.id}
                className="p-4 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-white space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm text-white">{badge.skillName}</h5>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
                    Feedback Provided
                  </span>
                </div>

                {badge.rejectionReason && (
                  <p className="text-[11px] text-rose-200/90 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
                    <strong>Admin Clinical Note:</strong> {badge.rejectionReason}
                  </p>
                )}

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const def = AVAILABLE_SPECIALIZED_SKILLS.find(s => s.id === badge.id);
                      handleOpenRequest(def);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Re-submit with Updated Proof</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: AVAILABLE SPECIALIZED SKILLS (QUICK REQUEST TILES) */}
      {!readOnly && availableToRequest.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Available Skills for 'Verified' Request</span>
            </h4>
            <span className="text-[10px] text-slate-400">Click to apply for verified status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableToRequest.map((skill) => (
              <div 
                key={skill.id}
                className="p-4 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-400/40 transition text-white flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0">
                        {renderSkillIcon(skill.iconName, "w-4 h-4")}
                      </div>
                      <h5 className="font-bold text-sm text-white group-hover:text-purple-300 transition">
                        {skill.name}
                      </h5>
                    </div>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                    Rec: {skill.recommendedCertifications[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenRequest(skill)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/60 text-purple-200 hover:text-white border border-purple-400/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Badge</span>
                    <Plus className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT SKILL VERIFICATION REQUEST */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#180a29] border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7209B7] to-emerald-500 flex items-center justify-center text-white">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">
                    Request 'Verified' Status
                  </h4>
                  <p className="text-xs text-slate-400">
                    Application submitted to Admin Portal for clinical auditing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {selectedSkillToRequest ? (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-200 text-sm flex items-center gap-2">
                      {renderSkillIcon(selectedSkillToRequest.iconName, "w-4 h-4 text-emerald-400")}
                      <span>{selectedSkillToRequest.name}</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {selectedSkillToRequest.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {selectedSkillToRequest.description}
                  </p>
                  <div className="text-[10px] text-emerald-300/90 pt-1">
                    <strong>Recommended Proof:</strong> {selectedSkillToRequest.suggestedProofDocument}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Specialized Skill Name
                  </label>
                  <select
                    value={customSkillName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomSkillName(val);
                      const found = AVAILABLE_SPECIALIZED_SKILLS.find(s => s.name === val);
                      if (found) {
                        setSelectedSkillToRequest(found);
                        setDocumentProofName(found.suggestedProofDocument);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  >
                    <option value="" className="bg-[#180a29]">-- Select Specialized Clinical Skill --</option>
                    {AVAILABLE_SPECIALIZED_SKILLS.map(s => (
                      <option key={s.id} value={s.name} className="bg-[#180a29] text-white">
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Clinical Experience &amp; Competency Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={supportingNote}
                  onChange={(e) => setSupportingNote(e.target.value)}
                  placeholder="Describe your practical experience (e.g. 3 years in Bustamante Hospital pediatric ward, or UHWI surgical recovery theater)..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Attached Credential / Document Proof Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={documentProofName}
                    onChange={(e) => setDocumentProofName(e.target.value)}
                    placeholder="e.g. UWISON_Pediatric_Practicum_Letter.pdf"
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono placeholder-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The Admin will inspect this against your official uploaded records in the command portal.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Once granted, the <strong>Verified</strong> badge will immediately appear on your public caregiver profile and in client matchmaking recommendations.
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Admin Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
