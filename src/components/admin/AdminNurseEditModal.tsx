import React, { useState } from 'react';
import { NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  Check, 
  Stethoscope, 
  Phone, 
  MapPin, 
  Award, 
  Image, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface AdminNurseEditModalProps {
  nurse: NurseProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNurse: NurseProfile) => void;
}

export const AdminNurseEditModal: React.FC<AdminNurseEditModalProps> = ({
  nurse,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !nurse) return null;

  const [name, setName] = useState(nurse.name);
  const [ncjLicense, setNcjLicense] = useState(nurse.nursingCouncilLicense || '');
  const [phone, setPhone] = useState(nurse.phone || '');
  const [email, setEmail] = useState(nurse.email || '');
  const [parish, setParish] = useState(nurse.geofenceActiveParish || (nurse.zones && nurse.zones[0]) || 'Kingston & St Andrew');
  const [skillsStr, setSkillsStr] = useState((nurse.specialties || []).join(', '));
  const [photoUrl, setPhotoUrl] = useState(nurse.photoUrl || '');
  const [policeRecordStatus, setPoliceRecordStatus] = useState<NurseProfile['policeRecordStatus']>(
    nurse.policeRecordStatus || 'verified'
  );
  const [policeRecordUrl, setPoliceRecordUrl] = useState(nurse.policeRecordUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playStepComplete();
    const updated: NurseProfile = {
      ...nurse,
      name: name.trim(),
      nursingCouncilLicense: ncjLicense.trim(),
      phone: phone.trim(),
      email: email.trim(),
      geofenceActiveParish: parish.trim(),
      zones: [parish.trim(), ...(nurse.zones || []).filter(z => z !== parish.trim())],
      specialties: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
      photoUrl: photoUrl.trim() || nurse.photoUrl,
      policeRecordStatus,
      policeRecordUrl: policeRecordUrl.trim() || nurse.policeRecordUrl
    };
    onSave(updated);
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-400/40 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Edit Nurse Profile</h2>
              <p className="text-xs text-slate-300 font-mono">NCJ: {nurse.nursingCouncilLicense}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Full Name &amp; Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Nursing Council License (NCJ)</label>
              <input
                type="text"
                required
                value={ncjLicense}
                onChange={e => setNcjLicense(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-purple-200 font-mono font-bold focus:border-purple-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Phone Number (Jamaica)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(876) 555-0192"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Primary Parish / Dispatch Zone</label>
              <select
                value={parish}
                onChange={e => setParish(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              >
                <option value="Kingston & St Andrew">Kingston &amp; St Andrew</option>
                <option value="New Kingston">New Kingston</option>
                <option value="Liguanea & Mona">Liguanea &amp; Mona</option>
                <option value="Constant Spring & Manor Park">Constant Spring &amp; Manor Park</option>
                <option value="St. Catherine">St. Catherine</option>
                <option value="Portmore">Portmore</option>
                <option value="Spanish Town">Spanish Town</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Police Record 60-Day Status</label>
              <select
                value={policeRecordStatus}
                onChange={e => setPoliceRecordStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              >
                <option value="verified">Verified (Approved)</option>
                <option value="due_soon">Due Soon (In Grace Period)</option>
                <option value="not_uploaded">Not Uploaded</option>
                <option value="overdue_suspended">Overdue / Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Specialized Skills &amp; Clinical Badges (Comma-separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={e => setSkillsStr(e.target.value)}
              placeholder="e.g. Elderly Respite, IV Therapy, Wound Dressing, Medication Mgmt"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-400 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Nurse Photo URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-[11px] focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Police Record Document URL</label>
              <input
                type="text"
                value={policeRecordUrl}
                onChange={e => setPoliceRecordUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-[11px] focus:border-purple-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#1E1B4B] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Save Nurse Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
