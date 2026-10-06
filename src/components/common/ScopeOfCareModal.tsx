import React from 'react';
import { 
  X, 
  ShieldCheck, 
  HeartHandshake, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  Stethoscope, 
  Info, 
  Sparkles, 
  HelpCircle,
  Clock,
  Heart
} from 'lucide-react';
import { NurseProfile } from '../../types';

interface ScopeOfCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNurse?: NurseProfile | null;
}

export const ScopeOfCareModal: React.FC<ScopeOfCareModalProps> = ({
  isOpen,
  onClose,
  selectedNurse
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#140526] border border-purple-500/30 text-white shadow-2xl overflow-hidden my-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-6 bg-gradient-to-r from-purple-950/60 via-[#1e0838] to-slate-900/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Caregiver Tiers, Scope &amp; Pay Rates</h3>
              <p className="text-xs text-purple-200">
                Understanding Non-NCJ Geriatric Aides vs. NCJ Registered Clinical Nurses in Jamaica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Important Regulatory Context */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Why are Geriatric Aides Not Required to Register with NCJ?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-200">
              Under Jamaican healthcare regulations, only healthcare practitioners performing <strong>invasive clinical nursing procedures</strong> (such as IV cannulation, controlled drug administration, surgical wound debridement, and diagnostic catheterization) are required to hold a practicing license from the <strong>Nursing Council of Jamaica (NCJ)</strong>.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-200">
              <strong>Certified Geriatric Care Aides &amp; Practical Caregivers</strong> (trained through institutions such as HEART/NTA, Red Cross, or accredited caregiving academies) provide essential <strong>non-invasive, Activities of Daily Living (ADLs), hygiene, and companion assistance</strong> for seniors and recovering clients who require minimal to moderate physical care at an affordable rate.
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TIER 1: Geriatric & Practical Caregivers */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Minimal / ADL Care</span>
                  <h4 className="font-extrabold text-white text-sm">Geriatric Care Aide / Practical Caregiver</h4>
                </div>
                <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Heart className="w-4 h-4" />
                </span>
              </div>

              {/* Pay Rate */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-300/80 uppercase font-bold block">Standard Pay Rate</span>
                <span className="text-base font-black text-cyan-300">JMD $2,800 – $3,800</span>
                <span className="text-[10px] text-slate-400"> / hour or visit</span>
              </div>

              {/* Care They CAN Provide */}
              <div>
                <span className="text-[11px] font-bold text-emerald-300 block mb-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  Care They CAN Provide:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Personal hygiene, sponge bathing, shower assistance, dressing &amp; grooming</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Mobility assistance, wheelchair transfer, bed repositioning &amp; fall prevention</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Routine vital signs recording (Blood pressure, pulse, temp, glucose checks)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Medication reminders from pre-filled pill organizers (supervised self-administration)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Meal preparation, assisted feeding, diabetic/low-sodium meal support &amp; hydration</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Senior companionship, cognitive activities, conversation &amp; family respite relief</span>
                  </li>
                </ul>
              </div>

              {/* Scope Limits */}
              <div className="pt-2 border-t border-cyan-500/20">
                <span className="text-[10px] font-bold text-amber-300 block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Cannot Provide (Needs Registered Nurse):
                </span>
                <p className="text-[10px] text-slate-400">
                  No IV insertions/infusions, no complex sterile surgical wound debridement, no physician-prescribed drug dosage titrations.
                </p>
              </div>
            </div>

            {/* TIER 2: Registered Nurses */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Clinical &amp; Invasive Care</span>
                  <h4 className="font-extrabold text-white text-sm">Registered General Nurse (RN / BSN / RM)</h4>
                </div>
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              {/* Pay Rate */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-300/80 uppercase font-bold block">Standard Pay Rate</span>
                <span className="text-base font-black text-emerald-300">JMD $6,500 – $10,500</span>
                <span className="text-[10px] text-slate-400"> / hour or procedure</span>
              </div>

              {/* Care They CAN Provide */}
              <div>
                <span className="text-[11px] font-bold text-emerald-300 block mb-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  Licensed Clinical Scope:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>IV Cannulation, fluid therapy, electrolyte infusion &amp; injectable medications</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Sterile post-op surgical wound dressing, suture removal &amp; infection inspection</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Urinary Foley catheter insertion, stoma/colostomy care &amp; tube flushes</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Postnatal maternal C-section recovery, newborn umbilical cord care &amp; lactation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Palliative symptom management, oxygen protocol titration &amp; pain assessments</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-300 block mb-1">
                  Registration Requirement:
                </span>
                <p className="text-[10px] text-slate-400">
                  Mandatory active registration &amp; annual practicing license with the <strong>Nursing Council of Jamaica (NCJ)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Transparent Escrow Split Info */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block text-xs">Transparent Escrow Model</span>
              <span className="text-[11px] text-slate-400">
                All caregivers and nurses receive <strong>85% direct earnings</strong>. 15% platform fee covers 24/7 119 emergency dispatch, insurance &amp; GPS dispatch.
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-[#C77DFF]">85% Practitioner Split</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] text-white font-bold text-xs hover:opacity-95 transition shadow-lg"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};
