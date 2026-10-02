import React, { useState } from 'react';
import { UserAccount } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  Check, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  ShieldAlert, 
  UserCheck,
  Building
} from 'lucide-react';

interface AdminClientModalProps {
  client?: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<UserAccount>) => void;
}

export const AdminClientModal: React.FC<AdminClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!client;

  const [fullName, setFullName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [gateCode, setGateCode] = useState(client?.gateCode || '');
  const [zone, setZone] = useState(client?.zone || 'St. Andrew');
  const [emergencyContact, setEmergencyContact] = useState(client?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(client?.emergencyContact?.phone || '');
  const [trn, setTrn] = useState(client?.trn || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    soundFX.playStepComplete();

    const clientPayload: Partial<UserAccount> = {
      ...(client || {}),
      id: client?.id || `client-${Date.now()}`,
      username: client?.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      gateCode: gateCode.trim(),
      zone: zone.trim(),
      emergencyContact: emergencyContact.trim()
        ? {
            name: emergencyContact.trim(),
            phone: emergencyPhone.trim(),
            relation: 'Emergency Contact'
          }
        : undefined,
      trn: trn.trim(),
      role: 'client',
      approvalStatus: client?.approvalStatus || 'approved'
    };

    onSave(clientPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#0A0E1A] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              {isEditing ? <UserCheck className="w-5 h-5" /> : <Building className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {isEditing ? `Edit Client: ${client?.name}` : 'Register New Client'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing 
                  ? 'Update residence, emergency contacts and gate access credentials' 
                  : 'Onboard a patient or caregiver household to the We Care Jamaica registry'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">
                Client / Patient Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g., Beverly Campbell"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(876) 555-0192"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Parish / Service Zone</label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              >
                <option value="Kingston">Kingston</option>
                <option value="St. Andrew">St. Andrew</option>
                <option value="St. Catherine">St. Catherine</option>
                <option value="St. James">St. James (Montego Bay)</option>
                <option value="Manchester">Manchester (Mandeville)</option>
                <option value="Clarendon">Clarendon</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">TRN (Optional)</label>
              <input
                type="text"
                value={trn}
                onChange={e => setTrn(e.target.value)}
                placeholder="123-456-789"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              >
              </input>
            </div>

            {/* Address & Gate Code */}
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">
                Residential Address & Community <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 14 Norbrook Mews, Manor Park, Kingston 8"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-amber-300 font-bold block mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Gate Code / Complex Security Access Instructions</span>
              </label>
              <input
                type="text"
                value={gateCode}
                onChange={e => setGateCode(e.target.value)}
                placeholder="e.g. Call guard on arrival / Dial #402 at intercom / Keypad code 8821#"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-100 font-medium focus:border-amber-400 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Visible to dispatched visiting nurses on their mobile transit sheet.
              </p>
            </div>

            {/* Emergency Contacts */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Contact Person</label>
              <div className="relative">
                <ShieldAlert className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Daughter - Michelle Campbell"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                placeholder="(876) 555-8910"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
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
              <span>{isEditing ? 'Save Client Profile' : 'Register Client Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
