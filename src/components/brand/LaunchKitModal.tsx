import React, { useState } from 'react';
import { LogoVariation } from '../../types';
import { Logo } from '../common/Logo';
import { NOTIFICATION_TEMPLATES, FAQ_ITEMS, ADMIN_PROFILE } from '../../data/mockData';
import { 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  MessageSquare, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface LaunchKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation: LogoVariation;
}

export const LaunchKitModal: React.FC<LaunchKitModalProps> = ({
  isOpen,
  onClose,
  logoVariation
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'spec' | 'nurse_script' | 'client_script' | 'notifications' | 'faq'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0F172A]/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/15 p-6 md:p-8 flex flex-col text-white">
        {/* Modal Toolbar (Non-printable) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> 1-Page PDF Launch Kit
            </span>
            <span className="text-xs text-slate-400 font-medium">Phase 1 Official Documentation</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-white/10 print:hidden text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'all' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            Full Launch Kit (All)
          </button>
          <button
            onClick={() => setActiveTab('spec')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'spec' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            1. Product Spec
          </button>
          <button
            onClick={() => setActiveTab('nurse_script')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'nurse_script' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            2. Nurse Script
          </button>
          <button
            onClick={() => setActiveTab('client_script')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'client_script' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            3. Client Script
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'notifications' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            4. 10 SMS/WhatsApp Templates
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'faq' ? 'bg-[#1E1B4B] text-white font-bold shadow-md shadow-purple-950/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            5. FAQs
          </button>
        </div>

        {/* Printable Kit Content */}
        <div className="mt-4 space-y-8 print:p-0">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Logo variation={logoVariation} size="lg" />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                We Care App – Phase 1 Launch Kit
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span>📍 Service Area: <strong className="text-white">Kingston, St. Andrew, Portmore, and Spanish Town</strong></span>
                <span className="text-slate-600">•</span>
                <span>🎨 Brand Colors: <strong className="text-indigo-400">Navy #1E1B4B</strong> + <strong className="text-blue-400">Bright Blue #3B82F6</strong> + <strong className="text-amber-400">Accent Orange #F59E0B</strong></span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-md shrink-0 text-right backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Launch Status</span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                ● Ready for Deployment
              </span>
            </div>
          </div>

          {/* 1. Product Spec */}
          {(activeTab === 'all' || activeTab === 'spec') && (
            <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-xs font-bold">1</span>
                  Product Specification (Phase 1)
                </h3>
                <span className="text-xs text-slate-400 font-mono">Scope: Kingston, St. Andrew, Portmore, and Spanish Town</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#C77DFF]" /> Roles &amp; Auth
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Roles:</strong> Client, Nurse, Admin (<strong>{ADMIN_PROFILE.name}</strong>, Office: <span className="font-mono text-purple-200">{ADMIN_PROFILE.officeNumber}</span>).<br/>
                    <strong>Auth:</strong> Jamaican Phone (+1 876) OTP for both. Nurses submit Gov ID + Nursing Council of Jamaica license number for mandatory manual Admin review.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" /> Booking &amp; Dispatch
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Client selects service &amp; neighborhood (Kingston, St. Andrew, Portmore, Spanish Town) → sees nearby licensed nurses → Nurse accepts/declines → in-app messaging unlocks. <strong>Free cancellation up to 2 hours before visit</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Payments &amp; Escrow
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Card / Stripe / Lynk Mobile Money. <strong>Guaranteed escrow protection</strong> with net earnings paid out weekly every Friday to nurses.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" /> Closeout &amp; Safety
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Nurse completes clinical vitals &amp; care summary notes → Client rates 1-5 stars. <strong>Safety:</strong> Emergency contact + Panic Button speed-dialing <strong>119</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
                <span><strong>Phase 2 Roadmap:</strong> Live GPS real-time route tracking + Automated NCJ license database API synchronization.</span>
              </div>
            </section>
          )}

          {/* 2. Nurse Onboarding Script */}
          {(activeTab === 'all' || activeTab === 'nurse_script') && (
            <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-xs font-bold">2</span>
                  Nurse Onboarding Script
                </h3>
                <button
                  onClick={() => copyText(`Hi, thanks for applying to We Care! We connect licensed nurses with clients in Kingston, St. Andrew, Portmore, and Spanish Town.\n\nActivate: Verify phone/email, upload photo, ID, Nursing Council license #. Admin approves manually.\n\nHow it works: Get request → Accept → See details + chat → Complete + notes → Get rated → Weekly payout. Guaranteed escrow payouts direct to your bank.\n\nYou are an independent contractor. Panic button available for client emergencies.\nSubmit docs in app to start.`, 'nurse-script')}
                  className="flex items-center gap-1 text-xs font-bold text-[#C77DFF] hover:underline"
                >
                  {copiedId === 'nurse-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'nurse-script' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto border border-white/10">
                <p className="text-purple-300 font-semibold mb-2">
                  // Nurse Welcome &amp; Activation Protocol
                </p>
                <p className="mb-2 text-white">
                  "Hi, thanks for applying to We Care! We connect licensed nurses with clients in Kingston, St. Andrew, Portmore, and Spanish Town."
                </p>
                <p className="mb-2 text-slate-300">
                  <strong className="text-white">Activate:</strong> Verify phone/email, upload photo, ID, Nursing Council license #. Admin approves manually.
                </p>
                <p className="mb-2 text-slate-300">
                  <strong className="text-white">How it works:</strong> Get request → Accept → See details + chat → Complete + notes → Get rated → Weekly payout. Guaranteed escrow payouts direct to your bank.
                </p>
                <p className="text-slate-300">
                  "You are an independent contractor. Panic button available for client emergencies. Submit docs in app to start."
                </p>
              </div>
            </section>
          )}

          {/* 3. Client Onboarding Script */}
          {(activeTab === 'all' || activeTab === 'client_script') && (
            <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-xs font-bold">3</span>
                  Client Onboarding Script
                </h3>
                <button
                  onClick={() => copyText(`Welcome to We Care! Trusted in-home nurse visits in Kingston, St. Andrew, Portmore, and Spanish Town.\n\nBook in 3 steps: Choose service + time → Pick nurse → Pay in app.\nChat with nurse. Rate after visit.\n\nSafety: Add emergency contact + use panic button to call 119.\nNeed help? Message us here.`, 'client-script')}
                  className="flex items-center gap-1 text-xs font-bold text-[#F59E0B] hover:underline"
                >
                  {copiedId === 'client-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'client-script' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto border border-white/10">
                <p className="text-red-300 font-semibold mb-2">
                  // Client Onboarding &amp; Welcome Protocol
                </p>
                <p className="mb-2 text-white">
                  "Welcome to We Care! Trusted in-home nurse visits in Kingston, St. Andrew, Portmore, and Spanish Town."
                </p>
                <p className="mb-2 text-slate-300">
                  <strong className="text-white">Book in 3 steps:</strong> Choose service + time → Pick nurse → Pay in app. Chat with nurse. Rate after visit.
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">Safety:</strong> Add emergency contact + use panic button to call 119. Need help? Message us here.
                </p>
              </div>
            </section>
          )}

          {/* 4. Notification Templates */}
          {(activeTab === 'all' || activeTab === 'notifications') && (
            <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-xs font-bold">4</span>
                  All 10 SMS &amp; WhatsApp Notification Templates
                </h3>
                <span className="text-xs text-slate-400">10 Automated Triggers</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NOTIFICATION_TEMPLATES.map((tmpl) => (
                  <div key={tmpl.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tmpl.channel === 'WhatsApp' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          tmpl.channel === 'SMS' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {tmpl.channel}
                        </span>
                        <span className="text-xs font-bold text-white">{tmpl.title}</span>
                      </div>
                      <button
                        onClick={() => copyText(tmpl.messageBody, tmpl.id)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy message body"
                      >
                        {copiedId === tmpl.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-200 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      {tmpl.messageBody}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
                      Trigger: {tmpl.trigger}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. FAQs */}
          {(activeTab === 'all' || activeTab === 'faq') && (
            <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-xs font-bold">5</span>
                  Client &amp; Nurse Frequently Asked Questions
                </h3>
                <span className="text-xs text-slate-400">Kingston, St. Andrew, Portmore &amp; Spanish Town Guidelines</span>
              </div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((faq) => (
                  <div key={faq.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-purple-200 uppercase">
                        {faq.category}
                      </span>
                      <h4 className="text-xs font-bold text-white">{faq.question}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>We Care Healthcare Ltd. • Kingston, St. Andrew, Portmore, and Spanish Town, Jamaica</span>
            <span className="block text-[11px] text-slate-500 mt-0.5">Admin in Command: <strong>{ADMIN_PROFILE.name}</strong> • Office Direct: <strong className="font-mono text-purple-300">{ADMIN_PROFILE.officeNumber}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] text-white font-bold hover:bg-[#5A0694] transition shadow-lg shadow-purple-950/50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
