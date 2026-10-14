import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  X, 
  AlertTriangle, 
  Package, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface SuppliesChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOpenStore: () => void;
  serviceName?: string;
}

export const SuppliesChecklistModal: React.FC<SuppliesChecklistModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenStore,
  serviceName
}) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleToggle = () => {
    soundFX.playToggleClick();
    setIsAcknowledged(!isAcknowledged);
  };

  const handleProceed = () => {
    if (!isAcknowledged) return;
    soundFX.playSuccessPing();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1C1434] via-[#120B24] to-[#0A0614] border-2 border-amber-500/50 shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Required Home Supplies Checklist</h3>
              <p className="text-xs text-amber-300 font-medium">
                Mandatory Verification for {serviceName || 'Home Clinical Visit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Important Prompt */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-950/40 to-slate-900 border border-amber-400/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Have you bought all required supplies?</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              To ensure safe, aseptic, and unhindered care, please confirm your home is stocked with necessary clinical supplies prior to the attending nurse's arrival.
            </p>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Essential Caregiver Item Checklist:
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <strong className="text-white block">Sterile Nitrile Gloves &amp; PPE</strong>
                  <span className="text-slate-400 text-[11px]">Latex-free disposable examination gloves for the attending nurse.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <strong className="text-white block">First Aid Kit &amp; Antiseptic Sanitizer</strong>
                  <span className="text-slate-400 text-[11px]">Rubbing alcohol (70%+), antiseptic wash, clean towels, and hand sanitizer.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <strong className="text-white block">Specific Dressings or Catheter / Infusion Supplies</strong>
                  <span className="text-slate-400 text-[11px]">Sterile gauze, surgical tape, prescribed meds, or catheters (if undergoing wound/infusion care).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick link to Store */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Need supplies delivered to your door?</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Order directly from our Kingston Medical Supplies Store with standard dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStore();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <span>Visit Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mandatory Checkbox */}
          <div
            onClick={handleToggle}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
              isAcknowledged
                ? 'bg-emerald-500/15 border-emerald-400 text-white'
                : 'bg-white/[0.03] border-white/15 text-slate-300 hover:border-amber-400/50'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isAcknowledged ? (
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="text-xs space-y-1">
              <strong className="block text-white leading-snug">
                I have verified and prepared all required medical supplies &amp; dressings for this home visit.
              </strong>
              <p className="text-[11px] text-slate-400">
                (This acknowledgement will be recorded as <code className="font-mono text-emerald-300">supplies_checklist_ack: true</code> on the Supabase booking record).
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#0E081D] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!isAcknowledged}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Confirm &amp; Complete Booking</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
