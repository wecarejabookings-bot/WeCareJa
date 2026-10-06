import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Percent, 
  Clock, 
  ShieldAlert, 
  Check, 
  X, 
  Edit2, 
  Save, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Sun,
  Moon,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { INITIAL_SERVICES } from '../../data/mockData';
import { ServiceItem } from '../../types';
import { 
  savePlatformFinancialSettings, 
  loadPlatformFinancialSettings 
} from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';
import { getCorrectItemImage } from '../../utils/productImages';

interface AdminRatesPricingManagerProps {
  onPricingUpdated?: () => void;
}

export const AdminRatesPricingManager: React.FC<AdminRatesPricingManagerProps> = ({
  onPricingUpdated
}) => {
  // Global Platform Financial Rates
  const [rates, setRates] = useState(() => loadPlatformFinancialSettings());
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Services list with Hourly, Daily (8h), and Overnight (12h) pricing
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('wecare_custom_services_catalog');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SERVICES;
  });

  // Inline Service Rate Editing
  // key format: `${serviceId}_${rateType}` where rateType = 'priceJMD' | 'hourly' | 'daily' | 'overnight'
  const [editingServiceKey, setEditingServiceKey] = useState<string | null>(null);
  const [editingServiceValue, setEditingServiceValue] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper calculation for Hourly/Daily/Overnight rates if not explicitly customized
  const getServiceRates = (service: ServiceItem) => {
    const base = service.priceJMD;
    const hourly = (service as any).hourlyPriceJMD || Math.round(base * 0.7);
    const daily = (service as any).dailyPriceJMD || Math.round(base * 4.5);
    const overnight = (service as any).overnightPriceJMD || Math.round(base * 6.5);
    return { base, hourly, daily, overnight };
  };

  // Save Platform Global Rate
  const handleSaveGlobalRate = async (fieldName: string) => {
    const val = parseFloat(editInputValue);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    soundFX.playToggleClick();
    const updatedRates = { ...rates, [fieldName]: val };
    setRates(updatedRates);
    setEditingField(null);
    await savePlatformFinancialSettings(updatedRates);
    soundFX.playSuccessPing();
    showToast(`Updated ${fieldName} to ${val.toLocaleString()} in Supabase & system`);
    if (onPricingUpdated) onPricingUpdated();
  };

  // Save Service Rate
  const handleSaveServiceRate = (serviceId: string, rateType: 'priceJMD' | 'hourly' | 'daily' | 'overnight') => {
    const val = parseFloat(editingServiceValue);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid price in JMD');
      return;
    }
    soundFX.playToggleClick();

    const updated = services.map(s => {
      if (s.id === serviceId) {
        if (rateType === 'priceJMD') {
          return { ...s, priceJMD: val };
        } else if (rateType === 'hourly') {
          return { ...s, hourlyPriceJMD: val };
        } else if (rateType === 'daily') {
          return { ...s, dailyPriceJMD: val };
        } else if (rateType === 'overnight') {
          return { ...s, overnightPriceJMD: val };
        }
      }
      return s;
    });

    setServices(updated);
    localStorage.setItem('wecare_custom_services_catalog', JSON.stringify(updated));
    setEditingServiceKey(null);
    soundFX.playSuccessPing();
    showToast(`Saved ${rateType.toUpperCase()} for service to $${val.toLocaleString()} JMD`);
    if (onPricingUpdated) onPricingUpdated();
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-emerald-950/40 border border-purple-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </span>
            <h3 className="text-xl font-black text-white">Platform Rates &amp; Service Pricing Control</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Universal inline price editor for all administrators. Edit service rates (hourly/daily/overnight), staff pay, commission %, platform fee %, cancellation fees, and overtime rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Admins Authorized</span>
          </span>
        </div>
      </div>

      {/* Section 1: Global Platform Financial Rates */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider text-purple-300">
          <Percent className="w-4 h-4 text-purple-400" />
          <span>1. Platform Rates, Fees &amp; Staff Compensation</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Commission % */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Commission % (Platform)</span>
              <Percent className="w-4 h-4 text-purple-400" />
            </div>
            {editingField === 'commissionPercent' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-black/60 border border-purple-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-300">%</span>
                <button
                  onClick={() => handleSaveGlobalRate('commissionPercent')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-purple-300">
                  {rates.commissionPercent}%
                </span>
                <button
                  onClick={() => {
                    setEditingField('commissionPercent');
                    setEditInputValue(rates.commissionPercent.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Commission %"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Deduction rate applied to gross bookings</p>
          </div>

          {/* Platform Fee % */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Platform Fee %</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            {editingField === 'platformFeePercent' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-black/60 border border-emerald-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-300">%</span>
                <button
                  onClick={() => handleSaveGlobalRate('platformFeePercent')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {rates.platformFeePercent}%
                </span>
                <button
                  onClick={() => {
                    setEditingField('platformFeePercent');
                    setEditInputValue(rates.platformFeePercent.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Platform Fee %"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Escrow and processing fee percentage</p>
          </div>

          {/* Cancellation Fee (JMD) */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Cancellation Fee</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            {editingField === 'cancellationFeeJMD' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-black/60 border border-rose-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveGlobalRate('cancellationFeeJMD')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-rose-300">
                  ${rates.cancellationFeeJMD.toLocaleString()} <span className="text-xs text-slate-300 font-normal">JMD</span>
                </span>
                <button
                  onClick={() => {
                    setEditingField('cancellationFeeJMD');
                    setEditInputValue(rates.cancellationFeeJMD.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Cancellation Fee"
                >
                  <Edit2 className="w-3.5 h-3.5 text-rose-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Charged on short-notice client cancellations</p>
          </div>

          {/* Overtime Rate (Hourly JMD) */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Overtime Hourly Rate</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            {editingField === 'overtimeRateHourlyJMD' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-black/60 border border-amber-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveGlobalRate('overtimeRateHourlyJMD')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-amber-300">
                  ${rates.overtimeRateHourlyJMD.toLocaleString()} <span className="text-xs text-slate-300 font-normal">JMD/hr</span>
                </span>
                <button
                  onClick={() => {
                    setEditingField('overtimeRateHourlyJMD');
                    setEditInputValue(rates.overtimeRateHourlyJMD.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Overtime Rate"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Additional hourly charge past booked visit time</p>
          </div>

          {/* Staff Pay Rate (Base Hourly) */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Staff Pay Rate (Hourly)</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            {editingField === 'adminStaffHourlyJMD' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-black/60 border border-cyan-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveGlobalRate('adminStaffHourlyJMD')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-cyan-300">
                  ${rates.adminStaffHourlyJMD.toLocaleString()} <span className="text-xs text-slate-300 font-normal">JMD/hr</span>
                </span>
                <button
                  onClick={() => {
                    setEditingField('adminStaffHourlyJMD');
                    setEditInputValue(rates.adminStaffHourlyJMD.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Staff Hourly Pay Rate"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Baseline hourly admin/dispatcher compensation</p>
          </div>

          {/* Staff Pay Rate (Weekly Standard) */}
          <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Staff Pay Rate (Weekly Base)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            {editingField === 'adminWeeklySalaryJMD' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-black/60 border border-emerald-400 text-white font-mono text-sm font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveGlobalRate('adminWeeklySalaryJMD')}
                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition cursor-pointer"
                  title="Save to Supabase"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-black font-mono text-emerald-300">
                  ${rates.adminWeeklySalaryJMD.toLocaleString()} <span className="text-xs text-slate-300 font-normal">JMD/wk</span>
                </span>
                <button
                  onClick={() => {
                    setEditingField('adminWeeklySalaryJMD');
                    setEditInputValue(rates.adminWeeklySalaryJMD.toString());
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Edit Staff Weekly Pay Rate"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Default Monday accrual per active administrator</p>
          </div>
        </div>
      </div>

      {/* Section 2: Service Prices (Hourly, Daily, Overnight, Base) */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider text-emerald-300">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>2. Service Pricing: Hourly, Daily &amp; Overnight Rates</span>
          </h4>
          <span className="text-xs text-slate-400 font-bold">
            {services.length} Registered Clinical &amp; Homecare Services
          </span>
        </div>

        <div className="space-y-3">
          {services.map(service => {
            const { base, hourly, daily, overnight } = getServiceRates(service);

            return (
              <div
                key={service.id}
                className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all space-y-3 shadow-lg"
              >
                {/* Header: Picture + Name + Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCorrectItemImage(service)}
                      alt={service.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0 bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/first_aid_kit.jpg';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-black text-white text-sm">{service.name}</h5>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{service.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Duration</span>
                    <span className="font-mono font-bold text-xs text-purple-200">
                      {service.durationMinutes} mins
                    </span>
                  </div>
                </div>

                {/* 4 Editable Rates: Base Price, Hourly Rate, Daily Rate (8h), Overnight Rate (12h) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* Rate 1: Base Procedure Price */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> Base Visit
                      </span>
                    </div>
                    {editingServiceKey === `${service.id}_priceJMD` ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={editingServiceValue}
                          onChange={(e) => setEditingServiceValue(e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-black border border-amber-400 text-white font-mono text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveServiceRate(service.id, 'priceJMD')}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                          title="Save to Supabase"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingServiceKey(null)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-black text-amber-300 text-sm">
                          ${base.toLocaleString()} <span className="text-[10px] text-slate-400">JMD</span>
                        </span>
                        <button
                          onClick={() => {
                            setEditingServiceKey(`${service.id}_priceJMD`);
                            setEditingServiceValue(base.toString());
                          }}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Edit Base Visit Price"
                        >
                          <Edit2 className="w-3 h-3 text-amber-300" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rate 2: Hourly Rate */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Hourly Rate
                      </span>
                    </div>
                    {editingServiceKey === `${service.id}_hourly` ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={editingServiceValue}
                          onChange={(e) => setEditingServiceValue(e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-black border border-cyan-400 text-white font-mono text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveServiceRate(service.id, 'hourly')}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                          title="Save to Supabase"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingServiceKey(null)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-black text-cyan-300 text-sm">
                          ${hourly.toLocaleString()} <span className="text-[10px] text-slate-400">/hr</span>
                        </span>
                        <button
                          onClick={() => {
                            setEditingServiceKey(`${service.id}_hourly`);
                            setEditingServiceValue(hourly.toString());
                          }}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Edit Hourly Rate"
                        >
                          <Edit2 className="w-3 h-3 text-cyan-300" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rate 3: Daily Rate (8-Hour Shift) */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-emerald-400" /> Daily Rate (8h)
                      </span>
                    </div>
                    {editingServiceKey === `${service.id}_daily` ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={editingServiceValue}
                          onChange={(e) => setEditingServiceValue(e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-black border border-emerald-400 text-white font-mono text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveServiceRate(service.id, 'daily')}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                          title="Save to Supabase"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingServiceKey(null)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-black text-emerald-300 text-sm">
                          ${daily.toLocaleString()} <span className="text-[10px] text-slate-400">/day</span>
                        </span>
                        <button
                          onClick={() => {
                            setEditingServiceKey(`${service.id}_daily`);
                            setEditingServiceValue(daily.toString());
                          }}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Edit Daily Rate"
                        >
                          <Edit2 className="w-3 h-3 text-emerald-300" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rate 4: Overnight Rate (12-Hour Shift) */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3 text-purple-400" /> Overnight (12h)
                      </span>
                    </div>
                    {editingServiceKey === `${service.id}_overnight` ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={editingServiceValue}
                          onChange={(e) => setEditingServiceValue(e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-black border border-purple-400 text-white font-mono text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveServiceRate(service.id, 'overnight')}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                          title="Save to Supabase"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingServiceKey(null)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-black text-purple-300 text-sm">
                          ${overnight.toLocaleString()} <span className="text-[10px] text-slate-400">/night</span>
                        </span>
                        <button
                          onClick={() => {
                            setEditingServiceKey(`${service.id}_overnight`);
                            setEditingServiceValue(overnight.toString());
                          }}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Edit Overnight Rate"
                        >
                          <Edit2 className="w-3 h-3 text-purple-300" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
