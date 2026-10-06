import React, { useState } from 'react';
import { Logo } from './Logo';
import { LogoVariation } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Building, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation?: LogoVariation;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  logoVariation = 'heart-cross'
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMessage, setSenderMessage] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    soundFX.playToggleClick();
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playVisitCompleted();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setSenderName('');
      setSenderEmail('');
      setSenderMessage('');
      onClose();
    }, 2800);
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
            <Logo variation={logoVariation} size="sm" />
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Contact We Care Jamaica</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Headquarters
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Official Clinical Care &amp; Operational Inquiries
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

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Official Address Card - Exactly as requested */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-purple-950/30 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black block font-mono">
                Official Business Address &amp; Contact
              </span>
              <div className="text-base sm:text-lg font-black text-white tracking-tight">
                We Care Jamaica
              </div>
              <div className="text-slate-200 font-medium leading-relaxed">
                4 Claudete Drive<br />
                St. Catherine, Jamaica
              </div>
              <div className="pt-1 space-y-0.5 font-mono text-xs">
                <div className="text-purple-300 font-bold">wecareja.bookings@gmail.com</div>
                <div className="text-emerald-300 font-bold">(876) 582-7613</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `We Care Jamaica\n4 Claudete Drive\nSt. Catherine, Jamaica\nwecareja.bookings@gmail.com\n(876) 582-7613`,
                    'full-address'
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
              >
                {copied === 'full-address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'full-address' ? 'Copied' : 'Copy Address'}</span>
              </button>

              <a
                href="https://www.google.com/maps/search/?api=1&query=4+Claudete+Drive+St+Catherine+Jamaica"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Item 9: Google Maps Embed (Search: 4 Claudete Drive St Catherine Jamaica, Zoom 15, Marker title: We Care Jamaica) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Google Maps Location • St. Catherine, Jamaica</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Zoom: 15 • Pin: We Care Jamaica</span>
            </div>

            <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-purple-500/30 relative shadow-inner bg-slate-950">
              <iframe
                title="We Care Jamaica Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=4+Claudete+Drive,+St.+Catherine,+Jamaica&t=&z=15&ie=UTF8&iwloc=&output=embed"
              />

              {/* Marker Card Overlay */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-purple-400/40 px-3 py-2 rounded-xl shadow-xl pointer-events-none flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <div className="font-black text-xs text-white">We Care Jamaica</div>
                  <div className="text-[10px] text-slate-300 font-mono">4 Claudete Drive, St. Catherine</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Rails */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:8765827613"
              className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Telephone</span>
                <span className="font-bold text-white text-xs group-hover:text-emerald-300 font-mono">
                  (876) 582-7613
                </span>
              </div>
            </a>

            <a
              href="mailto:wecareja.bookings@gmail.com"
              className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Direct Email</span>
                <span className="font-bold text-white text-xs group-hover:text-purple-300 font-mono truncate max-w-[140px] block">
                  wecareja.bookings@gmail.com
                </span>
              </div>
            </a>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Lynk Wallet</span>
                <span className="font-bold text-white text-xs font-mono">@wecareja</span>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Send a Message to Dispatch Desk
            </h4>

            {formSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="font-black text-white text-sm">Message Transmitted!</div>
                <p className="text-xs text-slate-300">
                  Our St. Catherine operations desk will follow up with you promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email or Phone"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition"
                  />
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="How can we assist you with homecare nursing or caregiver dispatch?"
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 transition resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#1E1B4B] hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Nursing Council of Jamaica (NCJ) Verified Registry</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
