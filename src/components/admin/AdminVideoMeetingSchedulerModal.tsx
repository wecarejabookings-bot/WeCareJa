import React, { useState } from 'react';
import { VideoMeeting, NurseProfile, UserAccount } from '../../types';
import {
  Video,
  Calendar,
  Clock,
  User,
  Stethoscope,
  ShieldCheck,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link2,
  Copy,
  Plus
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface AdminVideoMeetingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurses: NurseProfile[];
  userAccounts?: UserAccount[];
  clients?: UserAccount[];
  existingMeetings?: VideoMeeting[];
  onScheduleMeeting: (meeting: VideoMeeting) => void;
  onStartVideoMeeting?: (meeting: VideoMeeting) => void;
  initialNurse?: NurseProfile;
  preselectedNurse?: NurseProfile;
}

export const AdminVideoMeetingSchedulerModal: React.FC<AdminVideoMeetingSchedulerModalProps> = ({
  isOpen,
  onClose,
  nurses,
  userAccounts = [],
  clients = [],
  existingMeetings = [],
  onScheduleMeeting,
  onStartVideoMeeting,
  initialNurse,
  preselectedNurse
}) => {
  const activeInitialNurse = initialNurse || preselectedNurse;
  const effectiveClients = clients.length > 0 ? clients : userAccounts.filter(u => u.role === 'client');
  const [participantRole, setParticipantRole] = useState<'nurse' | 'client'>('nurse');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    activeInitialNurse ? activeInitialNurse.id : nurses[0]?.id || ''
  );
  const [meetingType, setMeetingType] = useState<VideoMeeting['meetingType']>('onboarding_review');
  const [meetingTitle, setMeetingTitle] = useState('Clinical Onboarding & Credential Audit');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState('Verify NCJ registration certificate, clinical protocol readiness, and service zone logistics.');
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter accounts
  const clientAccounts = effectiveClients;

  const handleTypeChange = (type: VideoMeeting['meetingType']) => {
    setMeetingType(type);
    switch (type) {
      case 'onboarding_review':
        setMeetingTitle('Clinical Onboarding & NCJ Credential Audit');
        setNotes('Inspect original nursing certificates, discuss standard operating procedures, and confirm direct ACH deposit details.');
        break;
      case 'care_consultation':
        setMeetingTitle('Patient Care Plan & Medication Consultation');
        setNotes('Review elderly care requirements, medication schedule, mobility support, and emergency caregiver contact protocols.');
        break;
      case 'dispute_resolution':
        setMeetingTitle('Escrow Mediation & Visit Dispute Review');
        setNotes('Neutral administrative resolution between client and nurse with complete GPS and clinical vitals audit.');
        break;
      case 'routine_checkin':
        setMeetingTitle('Monthly Practitioner Performance & Punctuality Check-in');
        setNotes('Review visit rating feedback, cancellation history, and route expansion across Kingston, St. Andrew, and St. Catherine.');
        break;
      case 'emergency_triage':
        setMeetingTitle('Urgent Clinical Triage & Route Dispatch');
        setNotes('Immediate route coordination and safety briefing for high-priority clinical intervention.');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let pName = 'Participant';
    let pEmail = '';
    let pPhone = '';

    if (participantRole === 'nurse') {
      const foundNurse = nurses.find((n) => n.id === selectedParticipantId) || nurses[0];
      if (foundNurse) {
        pName = foundNurse.name;
        pEmail = foundNurse.email;
        pPhone = foundNurse.phone;
      }
    } else {
      const foundClient = clientAccounts.find((c) => c.id === selectedParticipantId) || clientAccounts[0];
      if (foundClient) {
        pName = foundClient.name;
        pEmail = foundClient.email;
        pPhone = foundClient.phone;
      }
    }

    const roomId = `room-wecare-${Math.random().toString(36).substring(2, 9)}`;

    const newMeeting: VideoMeeting = {
      id: `meet-${Date.now()}`,
      title: meetingTitle,
      meetingType,
      hostRole: 'admin',
      hostName: 'Sydney Mattis (Admin)',
      participantRole,
      participantId: selectedParticipantId,
      participantName: pName,
      participantEmail: pEmail,
      participantPhone: pPhone,
      scheduledDateTime: `${scheduledDate}T${scheduledTime}:00.000Z`,
      durationMinutes,
      status: 'scheduled',
      meetingRoomId: roomId,
      notes,
      createdAt: new Date().toISOString()
    };

    onScheduleMeeting(newMeeting);
    soundFX.playSuccessPing();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const handleCopyLink = (roomId: string) => {
    navigator.clipboard.writeText(`https://wecare.jm/telehealth/${roomId}`);
    setCopiedRoomId(roomId);
    soundFX.playToggleClick();
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#150722] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-200">
              <Video className="w-6 h-6 text-[#C77DFF]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Schedule Video Consultation / Meeting</h3>
              <p className="text-xs text-slate-300">
                Host an encrypted face-to-face clinical video call with caregivers, nurses, or client families.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Participant Role Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Participant Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setParticipantRole('nurse');
                  setSelectedParticipantId(nurses[0]?.id || '');
                  handleTypeChange('onboarding_review');
                }}
                className={`p-3 rounded-2xl border text-left font-bold text-xs transition flex items-center gap-2.5 ${
                  participantRole === 'nurse'
                    ? 'bg-[#1E1B4B] text-white border-purple-400/50 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-[#C77DFF]" />
                <div>
                  <span className="block text-white">Caregiver / Nurse</span>
                  <span className="text-[10px] text-purple-200 font-normal">Credential &amp; Audit Review</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setParticipantRole('client');
                  setSelectedParticipantId(clientAccounts[0]?.id || '');
                  handleTypeChange('care_consultation');
                }}
                className={`p-3 rounded-2xl border text-left font-bold text-xs transition flex items-center gap-2.5 ${
                  participantRole === 'client'
                    ? 'bg-[#1E1B4B] text-white border-purple-400/50 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-white">Client / Caregiver Family</span>
                  <span className="text-[10px] text-purple-200 font-normal">Care Plan Consultation</span>
                </div>
              </button>
            </div>
          </div>

          {/* Select Specific Person */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Select {participantRole === 'nurse' ? 'Nurse / Caregiver' : 'Client Account'}
            </label>
            <select
              value={selectedParticipantId}
              onChange={(e) => setSelectedParticipantId(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-purple-400"
            >
              {participantRole === 'nurse' ? (
                nurses.map((n) => (
                  <option key={n.id} value={n.id} className="bg-[#170826]">
                    {n.name} ({n.qualificationTitle} • {n.zones.join(', ')})
                  </option>
                ))
              ) : (
                clientAccounts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#170826]">
                    {c.name} ({c.email} • {c.zone || 'Corporate Area'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Meeting Purpose / Type */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Consultation Purpose</label>
            <select
              value={meetingType}
              onChange={(e) => handleTypeChange(e.target.value as VideoMeeting['meetingType'])}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-purple-400"
            >
              <option value="onboarding_review" className="bg-[#170826]">
                Clinical Onboarding &amp; NCJ License Verification
              </option>
              <option value="care_consultation" className="bg-[#170826]">
                Senior Care Plan &amp; Medication Routine Consultation
              </option>
              <option value="dispute_resolution" className="bg-[#170826]">
                Dispute Resolution &amp; Escrow Mediation
              </option>
              <option value="routine_checkin" className="bg-[#170826]">
                Routine Performance &amp; Punctuality Check-in
              </option>
              <option value="emergency_triage" className="bg-[#170826]">
                Urgent Clinical Triage &amp; Route Coordination
              </option>
            </select>
          </div>

          {/* Meeting Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Meeting Title</label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          {/* Date, Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Date</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/15">
                <Calendar className="w-4 h-4 text-purple-400" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Time</label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/15">
                <Clock className="w-4 h-4 text-emerald-400" />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
              >
                <option value={15} className="bg-[#170826]">15 Minutes (Brief)</option>
                <option value={30} className="bg-[#170826]">30 Minutes (Standard)</option>
                <option value={45} className="bg-[#170826]">45 Minutes (Full)</option>
                <option value={60} className="bg-[#170826]">60 Minutes (Comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Notes & Agenda */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Clinical Agenda / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:from-purple-600 hover:to-[#1E1B4B] text-white font-extrabold text-xs shadow-lg shadow-purple-950/60 border border-purple-400/40 transition flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-[#C77DFF]" />
              <span>Schedule &amp; Issue Room Link</span>
            </button>
          </div>
        </form>

        {/* Existing Scheduled Meetings Overview */}
        {existingMeetings.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Existing Video Appointments ({existingMeetings.length})
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {existingMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-white block">{m.title}</span>
                    <span className="text-[11px] text-purple-200">
                      With {m.participantName} • {new Date(m.scheduledDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(m.meetingRoomId)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition flex items-center gap-1 border border-white/10"
                      title="Copy meeting invite link"
                    >
                      {copiedRoomId === m.meetingRoomId ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 text-purple-300" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartVideoMeeting(m);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      <span>Start Call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
