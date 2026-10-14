import React, { useState } from 'react';
import { MessageSquare, Phone, Check, Edit2, ShieldCheck, Sparkles, BellRing } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface WhatsAppSettingsCardProps {
  currentPhone?: string;
  isOptedIn?: boolean;
  onToggleOptIn?: (optIn: boolean) => void;
  onUpdatePhone?: (phone: string) => void;
  compact?: boolean;
}

export const WhatsAppSettingsCard: React.FC<WhatsAppSettingsCardProps> = ({
  currentPhone = '+1 (876) 942-3311',
  isOptedIn = true,
  onToggleOptIn,
  onUpdatePhone,
  compact = false
}) => {
  const [optIn, setOptIn] = useState(isOptedIn);
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(currentPhone);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleToggle = () => {
    const nextVal = !optIn;
    setOptIn(nextVal);
    soundFX.playToggleClick();
    if (onToggleOptIn) {
      onToggleOptIn(nextVal);
    }
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPhone.trim()) return;
    setPhoneNumber(tempPhone);
    setIsEditingPhone(false);
    soundFX.playSuccessPing();
    if (onUpdatePhone) {
      onUpdatePhone(tempPhone);
    }
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className={`rounded-2xl border transition ${
      optIn 
        ? 'bg-gradient-to-r from-emerald-950/40 via-[#075E54]/25 to-black/50 border-emerald-500/40' 
        : 'bg-white/[0.03] border-white/10'
    } ${compact ? 'p-3.5' : 'p-4 sm:p-5'} text-white`}>
      {/* Header & Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            optIn 
              ? 'bg-[#25D366] text-slate-950 shadow-md shadow-[#25D366]/20' 
              : 'bg-white/10 text-slate-400'
          }`}>
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white">WhatsApp Updates</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                optIn ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'bg-white/10 text-slate-400'
              }`}>
                {optIn ? 'Active • Opted-In' : 'Disabled'}
              </span>
            </div>

            {/* Display / Edit Phone Number */}
            <div className="flex items-center gap-2 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              {isEditingPhone ? (
                <form onSubmit={handleSavePhone} className="flex items-center gap-1.5">
                  <input
                    type="tel"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="+1 (876) 555-0100"
                    className="px-2 py-0.5 rounded bg-black/60 border border-emerald-500/50 text-xs text-white font-mono focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditingPhone(false); setTempPhone(phoneNumber); }}
                    className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {phoneNumber || '876-XXX-XXXX'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-0.5"
                    title="Edit WhatsApp phone number"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>[Edit]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          role="switch"
          aria-checked={optIn}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            optIn ? 'bg-[#25D366]' : 'bg-white/20'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              optIn ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Helper Text (Verbatim as required) */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p>
            Get booking codes, receipts, and SOS alerts on WhatsApp. Works without internet. Standard WhatsApp rates apply.
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Meta WhatsApp Cloud API Verified via Official We Care Business Number (+1 876-555-CARE).
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showSavedToast && (
        <div className="mt-2 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp notification preferences updated successfully</span>
        </div>
      )}
    </div>
  );
};
