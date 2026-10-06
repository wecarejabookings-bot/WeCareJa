import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  MessageCircle, 
  Send, 
  Gift, 
  Sparkles, 
  Users, 
  Stethoscope, 
  Heart, 
  QrCode, 
  ExternalLink 
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { LogoVariation } from '../../types';
import { Logo } from './Logo';
import confetti from 'canvas-confetti';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
  userName?: string;
  userRole?: 'client' | 'nurse' | 'admin';
  logoVariation?: LogoVariation;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  referralCode = 'WECARE-JAM-2026',
  userName = 'WeCare Member',
  userRole = 'client',
  logoVariation
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'client_referral' | 'nurse_invite'>('client_referral');

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wecarejamaica.app';
  const shareUrl = `${originUrl}?ref=${referralCode}&source=${userRole}`;

  const clientShareText = `🏥 Book licensed Jamaican home nurses with WeCare Jamaica! Get JMD $500 off your first in-home visit for elderly care, post-op recovery, wound care or vital checks: ${shareUrl}`;
  const nurseShareText = `🩺 Join WeCare Jamaica as a Licensed Home Nurse and earn 85% net payouts with flexible local bookings in Kingston & St. Catherine! Sign up here: ${shareUrl}&role=nurse`;

  const currentShareText = activeTab === 'client_referral' ? clientShareText : nurseShareText;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    soundFX.playSuccessPing();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WeCare Jamaica - Licensed Home Nursing',
          text: currentShareText,
          url: shareUrl,
        });
        soundFX.playSuccessPing();
      } catch {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(currentShareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    soundFX.playSuccessPing();
  };

  const handleSMSShare = () => {
    const encoded = encodeURIComponent(currentShareText);
    window.open(`sms:?&body=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e0730] to-[#0e0219] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7209B7]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E63946]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7209B7] to-[#E63946] flex items-center justify-center text-white shadow-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Share WeCare Jamaica</h3>
              <p className="text-xs text-purple-300">Invite friends, family, and nurses to earn health credits</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 p-6 space-y-5">
          {/* Target Audience Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black/40 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('client_referral')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'client_referral'
                  ? 'bg-gradient-to-r from-[#7209B7] to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Refer Patient / Client</span>
            </button>

            <button
              onClick={() => setActiveTab('nurse_invite')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'nurse_invite'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Invite a Nurse</span>
            </button>
          </div>

          {/* Reward Perks Card */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">
                {activeTab === 'client_referral'
                  ? 'Give JMD $500 • Get JMD $500 Care Credit'
                  : 'Nurse Referral Reward • 90% Net Payout Boost'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {activeTab === 'client_referral'
                  ? 'Your invited friend gets JMD $500 off their first home nursing visit. You receive JMD $500 in account care credits once their visit is completed.'
                  : 'When your invited registered nurse is approved and completes 3 clinical visits, you both receive a special JMD $5,000 community healthcare bonus.'}
              </p>
            </div>
          </div>

          {/* Referral Code & Direct Link Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Your Personal Referral Link
            </label>
            <div className="p-2.5 pl-4 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-between gap-3">
              <div className="truncate text-xs font-mono text-purple-200">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#7209B7] hover:bg-purple-600 text-white shadow-md'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Social Sharing Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Fast 1-Click Sharing
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="p-3 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-black transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* SMS Message */}
              <button
                onClick={handleSMSShare}
                className="p-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-black transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Text / SMS</span>
              </button>

              {/* Native System Share */}
              <button
                onClick={handleNativeShare}
                className="p-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-black transition flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
              >
                <Share2 className="w-4 h-4" />
                <span>More Options</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10 text-center text-[11px] text-slate-400">
          WeCare Jamaica • Kingston, St. Andrew, Portmore &amp; Spanish Town
        </div>
      </div>
    </div>
  );
};
