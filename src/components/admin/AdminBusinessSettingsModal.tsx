import React, { useState } from 'react';
import { ADMIN_PROFILE } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import { 
  Building, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Check, 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Save, 
  Globe
} from 'lucide-react';

interface AdminBusinessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBusinessSettingsModal: React.FC<AdminBusinessSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [businessName, setBusinessName] = useState('We Care Jamaica');
  const [streetAddress, setStreetAddress] = useState('4 Claudete Drive');
  const [parish, setParish] = useState('St. Catherine');
  const [country, setCountry] = useState('Jamaica');
  const [email, setEmail] = useState('wecareja.bookings@gmail.com');
  const [phone, setPhone] = useState('(876) 582-7613');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundFX.playToggleClick();
    const text = `We Care Jamaica\n4 Claudete Drive\nSt. Catherine, Jamaica\nwecareja.bookings@gmail.com\n(876) 582-7613`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playToggleClick();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Admin Settings &gt; Business Info</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Headquarters
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Official Registered Commercial Presence in St. Catherine, Jamaica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form & Map */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 font-bold animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Business Profile and Location settings saved successfully!</span>
            </div>
          )}

          {/* Official Format Display Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 font-mono text-xs">
              <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block">
                Standard Business Address Format
              </span>
              <div className="font-black text-white text-sm">We Care Jamaica</div>
              <div className="text-slate-200">4 Claudete Drive</div>
              <div className="text-slate-200">St. Catherine, Jamaica</div>
              <div className="text-purple-300">wecareja.bookings@gmail.com</div>
              <div className="text-emerald-300 font-bold">(876) 582-7613</div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Format'}</span>
            </button>
          </div>

          {/* Google Maps Embed Pin (Zoom 15, Marker title: We Care Jamaica) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Google Maps Embed (Search: 4 Claudete Drive St Catherine Jamaica)</span>
              </span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=4+Claudete+Drive+St+Catherine+Jamaica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-white flex items-center gap-1 text-[11px] font-mono underline"
              >
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-purple-500/30 relative shadow-inner bg-slate-950">
              <iframe
                title="We Care Jamaica Google Map Embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=4+Claudete+Drive,+St.+Catherine,+Jamaica&t=&z=15&ie=UTF8&iwloc=&output=embed"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-purple-400/40 px-3 py-1.5 rounded-xl shadow-xl pointer-events-none flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-black text-xs text-white">We Care Jamaica</span>
              </div>
            </div>
          </div>

          {/* Editable Business Details Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Modify Business Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Company Legal Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Parish / City</label>
                <input
                  type="text"
                  value={parish}
                  onChange={(e) => setParish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Business Info</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
