import React, { useState } from 'react';
import { Logo } from './Logo';
import { LogoVariation } from '../../types';
import { X, ShieldCheck, Scale, AlertTriangle, FileText, Lock, Building, Mail, PhoneCall } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation?: LogoVariation;
  initialTab?: 'terms' | 'privacy' | 'disclaimers';
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  logoVariation = 'heart-cross',
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimers'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#120224] border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variation={logoVariation} size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-300" />
                <span>Legal Terms &amp; Policies</span>
              </h2>
              <p className="text-xs text-purple-200">
                Jamaica Data Protection Act 2020 &amp; Platform Operating Agreement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-black/20 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'terms'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Terms &amp; Conditions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy Policy (DPA 2020)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disclaimers')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'disclaimers'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Platform Disclaimers
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-200 leading-relaxed">
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-300" />
                  <span>We Care Jamaica Terms &amp; Conditions</span>
                </h3>
                <p>
                  Welcome to We Care Jamaica. By accessing our platform, requesting in-home nursing care, or registering as an independent healthcare practitioner, you agree to be bound by these Terms and Conditions governed under the laws of Jamaica.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  1. Platform Role &amp; Independence
                </h4>
                <p>
                  We Care Jamaica operates as a digital healthcare routing platform connecting clients with independent Registered Nurses, practical nurse aides, and certified geriatric caregivers. Practitioners are independent contractors licensed with the <strong>Nursing Council of Jamaica (NCJ)</strong>.
                </p>
                <p>
                  We Care Jamaica facilitates identity verification, escrow payment protection, and GPS dispatch coordination across St. Catherine, Kingston, St. Andrew, Portmore, and Spanish Town.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  2. Escrow &amp; Payment Settlements
                </h4>
                <p>
                  All payments are processed securely via verified Jamaican payment gateways (NCB QuikPay, Lynk Digital Wallet, Visa/Mastercard). Client payments are held in escrow and released to practitioners (85% net earnings) upon completion of clinical visit notes.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  3. Official Operating Entity
                </h4>
                <p className="text-slate-300">
                  Inquiries regarding contract enforcement, commercial accounts, or dispute arbitration should be directed in writing to:
                </p>
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 font-mono text-xs text-slate-200 space-y-0.5">
                  <div className="font-black text-white">We Care Jamaica</div>
                  <div>4 Claudete Drive</div>
                  <div>St. Catherine, Jamaica</div>
                  <div className="text-purple-300">wecareja.bookings@gmail.com</div>
                  <div className="text-emerald-300">(876) 582-7613</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Jamaica Data Protection Act (JDPA 2020) Compliance</span>
                </h3>
                <p>
                  We Care Jamaica is committed to safeguarding patient confidential medical notes, practitioner credentials, and personal health data in strict accordance with the <strong>Jamaica Data Protection Act 2020</strong>.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  Data Controller &amp; Inquiries
                </h4>
                <p>
                  The registered Data Controller for personal information processed on this platform is:
                </p>
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 font-mono text-xs text-slate-200 space-y-0.5">
                  <div className="font-black text-white">We Care Jamaica</div>
                  <div>4 Claudete Drive</div>
                  <div>St. Catherine, Jamaica</div>
                  <div className="text-purple-300">wecareja.bookings@gmail.com</div>
                  <div className="text-emerald-300">(876) 582-7613</div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  Clinical Confidentiality
                </h4>
                <p>
                  Patient vitals, medication schedules, and clinical progress logs are encrypted and accessible exclusively to the attending practitioner, assigned family delegates, and authorized clinical triage supervisors. We do not sell or monetize patient data.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PLATFORM DISCLAIMERS */}
          {activeTab === 'disclaimers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>We Care Jamaica Platform Disclosure</span>
                </h3>
                <p>
                  We Care Jamaica operates as a technology platform connecting clients with independent healthcare professionals and caregivers in Jamaica.
                </p>
                <p>
                  We Care is not a healthcare provider and does not directly provide nursing, medical, or caregiving services.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                  Provider Licensing &amp; Credentials
                </h4>
                <p>
                  All nurses on the platform are independently licensed by the <strong>Nursing Council of Jamaica (NCJ)</strong>.
                </p>
                <p>
                  Caregivers are certified through accredited vocational programs (e.g. <strong>HEART Trust / NCTVET</strong>) or verified by supervised clinical experience.
                </p>
                <p>
                  We Care conducts credential verification including NCJ license verification, government ID checks, and reference checks.
                </p>
                <p>
                  <strong>Background checks:</strong> Providers have up to <strong>60 days</strong> from approval to submit their official police record certificate from the Criminal Records Office (PICA / Jamaica Constabulary Force).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Medical &amp; Emergency Disclaimer</span>
                </h4>
                <p>
                  Wellness notes logged in the app are for care continuity and informational purposes only and do not constitute a medical diagnosis or treatment plan.
                </p>
                <p className="font-bold text-white">
                  For emergencies, always call 119.
                </p>
              </div>

              <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 font-mono text-xs text-slate-200 space-y-0.5">
                <div className="font-black text-white">We Care Jamaica Support &amp; Compliance</div>
                <div>4 Claudete Drive, St. Catherine, Jamaica</div>
                <div className="text-cyan-300 font-bold">support@wecareja.care</div>
                <div className="text-purple-300">wecareja.bookings@gmail.com</div>
                <div className="text-emerald-300">(876) 582-7613</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            4 Claudete Drive, St. Catherine, Jamaica
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
