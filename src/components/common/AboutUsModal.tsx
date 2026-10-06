import React from 'react';
import { Logo } from './Logo';
import { LogoVariation } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { 
  X, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Users, 
  Award, 
  Building, 
  Clock, 
  PhoneCall, 
  Mail, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation?: LogoVariation;
  onOpenContact?: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  logoVariation = 'heart-cross',
  onOpenContact
}) => {
  if (!isOpen) return null;

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
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variation={logoVariation} size="sm" />
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>About We Care Jamaica</span>
              </h2>
              <p className="text-xs text-slate-300">
                Jamaica's Premier In-Home Clinical &amp; Elder Care Network
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
          {/* Mission Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/40 border border-purple-500/30 space-y-2">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black block font-mono">
              Our Clinical Care Mission
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Compassionate, NCJ-Certified Healthcare Delivered Directly to Your Home
            </h3>
            <p className="text-slate-300">
              We Care Jamaica connects Jamaican families with licensed Registered Nurses, practical nurse aides, and certified geriatric caregivers. Founded with a commitment to clinical excellence, dignity, and transparency, our platform coordinates on-demand home visits, palliative respite, wound dressing, IV therapy, and medication management across St. Catherine, Kingston, St. Andrew, Portmore, and Spanish Town.
            </p>
          </div>

          {/* Official Business Address & Contact - Exactly as required */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Headquarters &amp; Business Address</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                Registered in Jamaica 🇯🇲
              </span>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1 font-mono text-xs">
              <div className="font-black text-white text-sm">We Care Jamaica</div>
              <div className="text-slate-200">4 Claudete Drive</div>
              <div className="text-slate-200">St. Catherine, Jamaica</div>
              <div className="text-purple-300 pt-1">wecareja.bookings@gmail.com</div>
              <div className="text-emerald-300 font-bold">(876) 582-7613</div>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-white text-xs">100% NCJ Licensed</h4>
              <p className="text-[11px] text-slate-400">
                Every practitioner is verified with the Nursing Council of Jamaica before active deployment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <Heart className="w-5 h-5 text-[#F59E0B]" />
              <h4 className="font-bold text-white text-xs">Escrow Protection</h4>
              <p className="text-[11px] text-slate-400">
                Client funds are held in secure escrow and released only upon successful visit completion.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <MapPin className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-white text-xs">Islandwide Reach</h4>
              <p className="text-[11px] text-slate-400">
                Rapid response coverage across St. Catherine, Kingston, St. Andrew, Portmore, and Spanish Town.
              </p>
            </div>
          </div>

          {/* Leadership & Oversight */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
              Operations &amp; Clinical Leadership
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center font-black text-white text-sm shrink-0 border border-white/20">
                SM
              </div>
              <div>
                <div className="font-bold text-white">{ADMIN_PROFILE.name}</div>
                <div className="text-[11px] text-purple-300">{ADMIN_PROFILE.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {ADMIN_PROFILE.officeAddress} • Tel: (876) 582-7613
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenContact) onOpenContact();
            }}
            className="text-xs text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View Map &amp; Contact Desk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
