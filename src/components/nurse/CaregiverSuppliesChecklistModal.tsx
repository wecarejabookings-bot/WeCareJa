import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  CheckSquare, 
  Square, 
  X, 
  AlertCircle, 
  Package, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface CaregiverSuppliesChecklistModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirmAccept: (booking: Booking) => void;
  onOpenStore?: () => void;
}

const CAREGIVER_SUPPLIES_TO_BRING = [
  {
    id: 'gloves',
    name: 'Hospital-Grade Nitrile Examination Gloves',
    desc: 'Powder-free, sterile/clean nitrile gloves for aseptic patient procedures & wound care.',
    category: 'PPE & Infection Control'
  },
  {
    id: 'antiseptic',
    name: 'Clinical Antiseptic Wash & Skin Prep Swabs',
    desc: 'Chlorhexidine gluconate or 70% isopropyl alcohol swabs for skin sanitization.',
    category: 'Antiseptics'
  },
  {
    id: 'dressings',
    name: 'Sterile Gauze Dressings & Surgical Micropore Tape',
    desc: 'Island dressings, gauze sponges, and gentle paper tape for post-procedure care.',
    category: 'Wound Care'
  },
  {
    id: 'diagnostics',
    name: 'Diagnostic Kit (BP Cuff, Stethoscope, Pulse Oximeter & Thermometer)',
    desc: 'Calibrated diagnostic instruments to record initial and exit vitals for clinical chart.',
    category: 'Diagnostics'
  },
  {
    id: 'sanitizer_mask',
    name: 'Medical Hand Sanitizer Gel & N95 / Surgical Mask',
    desc: '70% ethyl alcohol sanitizer for doorstep hand hygiene protocol before touching patient.',
    category: 'PPE & Infection Control'
  },
  {
    id: 'waste_disposal',
    name: 'Clinical Biohazard Waste Bag & Sharps Box',
    desc: 'Safe disposal containers for used needles, lancets, soiled swabs, and catheter lines.',
    category: 'Biohazard Safety'
  }
];

export const CaregiverSuppliesChecklistModal: React.FC<CaregiverSuppliesChecklistModalProps> = ({
  isOpen,
  booking,
  onClose,
  onConfirmAccept,
  onOpenStore
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CAREGIVER_SUPPLIES_TO_BRING.forEach(item => {
      initial[item.id] = true; // Pre-checked for convenience
    });
    return initial;
  });

  const [allConfirmed, setAllConfirmed] = useState(true);

  if (!isOpen || !booking) return null;

  const toggleItem = (id: string) => {
    soundFX.playToggleClick();
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    setAllConfirmed(Object.values(updated).every(Boolean));
  };

  const handleSelectAll = (select: boolean) => {
    soundFX.playToggleClick();
    const updated: Record<string, boolean> = {};
    CAREGIVER_SUPPLIES_TO_BRING.forEach(item => {
      updated[item.id] = select;
    });
    setCheckedItems(updated);
    setAllConfirmed(select);
  };

  const handleConfirm = () => {
    if (!allConfirmed) {
      soundFX.playWarningSound();
      return;
    }
    soundFX.playSuccessPing();
    onConfirmAccept(booking);
  };

  const earnings = booking.nurseEarningsJMD || Math.round((booking.priceJMD || 7500) * 0.85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#1C1033] via-[#140826] to-[#0A0314] border-2 border-[#7C3AED]/50 shadow-2xl overflow-hidden flex flex-col text-white my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-950/50 shrink-0 border border-purple-400/40">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Caregiver Supplies Checklist
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 font-bold">
                  Mandatory
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-purple-300">
                Verify clinical supplies to bring before accepting this visit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Card Summary */}
        <div className="p-4 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>{booking.serviceName || 'Home Nursing Visit'}</span>
              <span className="font-mono text-purple-300 text-xs">#{booking.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-[11px] mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {booking.zone || 'Kingston & St. Andrew'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Immediate Dispatch'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Your Net Earnings (85%)</span>
            <span className="text-sm font-black text-emerald-300">
              JMD ${earnings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Instructions banner */}
          <div className="p-3.5 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/40 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-purple-200">
                Ministry of Health &amp; NCJ Standard Pre-Visit Checklist
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Confirm that you have packed each essential clinical supply item into your mobile nurse kit. All items must be sterile, intact, and ready for doorstep inspection.
              </p>
            </div>
          </div>

          {/* Quick toggle all */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Supplies to Bring Checklist ({Object.values(checkedItems).filter(Boolean).length}/{CAREGIVER_SUPPLIES_TO_BRING.length} Ready):
            </span>
            <button
              type="button"
              onClick={() => handleSelectAll(!allConfirmed)}
              className="text-[11px] font-bold text-purple-300 hover:text-white transition cursor-pointer"
            >
              {allConfirmed ? 'Deselect All' : 'Select All Ready'}
            </button>
          </div>

          {/* List of items */}
          <div className="space-y-2">
            {CAREGIVER_SUPPLIES_TO_BRING.map((item) => {
              const isChecked = Boolean(checkedItems[item.id]);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-sm'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-80'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition ${
                    isChecked 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' 
                      : 'border-slate-500 bg-white/5'
                  }`}>
                    {isChecked ? <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">{item.name}</span>
                      <span className="text-[10px] text-purple-300 uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need supplies callout */}
          {onOpenStore && (
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 text-[11px]">Running low on PPE or dressings?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStore();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Order from Supplies Store</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!allConfirmed}
            className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              allConfirmed
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-[#7C3AED] hover:opacity-95 text-white shadow-emerald-950/60'
                : 'bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>
              {allConfirmed 
                ? `Confirm Supplies Ready & Accept Job (JMD $${earnings.toLocaleString()})` 
                : 'Verify All Supplies Above to Accept'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
