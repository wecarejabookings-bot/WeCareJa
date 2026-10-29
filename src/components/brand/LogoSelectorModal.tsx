import React, { useState } from 'react';
import { LogoVariation } from '../../types';
import { Logo } from '../common/Logo';
import { Check, Heart, Sparkles, Download, Copy, Shield, Layers } from 'lucide-react';

interface LogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariation: LogoVariation;
  onSelectVariation: (variation: LogoVariation) => void;
}

export const LogoSelectorModal: React.FC<LogoSelectorModalProps> = ({
  isOpen,
  onClose,
  currentVariation,
  onSelectVariation
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const variations: {
    id: LogoVariation;
    name: string;
    description: string;
    tag: string;
    bestFor: string;
  }[] = [
    {
      id: 'heart-cross',
      name: 'Heart + Cross Edition',
      tag: 'Medical Authority & Compassion',
      description: 'A vibrant red & purple gradient heart enclosing a crisp clinical white medical cross with a ruby care node.',
      bestFor: 'Primary Web & Mobile Brand identity, Clinical Credibility'
    },
    {
      id: 'hands-heart',
      name: 'Hands + Heart Edition',
      tag: 'Tender Homecare & Warmth',
      description: 'Two deep purple hands gently cradling an active vital heart with an internal pulse wave.',
      bestFor: 'In-Home Caregiving, Palliative & Elderly Comfort'
    },
    {
      id: 'icon-appstore',
      name: 'Icon Only (App Store Squircle)',
      tag: 'App Store & Home Screen Tile',
      description: 'Bold monogram "W" seamlessly integrated with a health beacon on a rich gradient squircle.',
      bestFor: 'iOS / Android App Store Icon, Favicon, Push Notifications'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15 p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-[#C77DFF] border border-purple-500/30">
                Brand Identity Studio
              </span>
              <span className="text-xs text-slate-400">Kingston, St. Andrew, Portmore &amp; Spanish Town</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">
              Select Your We Care Logo Style
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Test and compare all 3 custom brand logo variations. Switching updates the header and whole platform in real time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Brand Palette Bar */}
        <div className="my-6 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Brand Colors:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => copyHex('#1E1B4B')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 shadow-sm hover:border-indigo-400 transition group"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#1E1B4B] border border-white/20 shadow-sm" />
                <span className="text-xs font-mono font-bold text-white">#1E1B4B</span>
                <span className="text-[10px] text-indigo-300 group-hover:text-white">
                  {copiedColor === '#1E1B4B' ? 'Copied!' : 'Primary Navy'}
                </span>
              </button>

              <button
                onClick={() => copyHex('#3B82F6')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 shadow-sm hover:border-blue-400 transition group"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] shadow-sm" />
                <span className="text-xs font-mono font-bold text-white">#3B82F6</span>
                <span className="text-[10px] text-blue-300 group-hover:text-white">
                  {copiedColor === '#3B82F6' ? 'Copied!' : 'Bright Blue'}
                </span>
              </button>

              <button
                onClick={() => copyHex('#F59E0B')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 shadow-sm hover:border-amber-400 transition group"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] shadow-sm" />
                <span className="text-xs font-mono font-bold text-white">#F59E0B</span>
                <span className="text-[10px] text-amber-300 group-hover:text-white">
                  {copiedColor === '#F59E0B' ? 'Copied!' : 'Accent Orange (SOS/CTA)'}
                </span>
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-300">Service Area: <strong className="text-white">Kingston, St. Andrew, Portmore, and Spanish Town</strong></span>
        </div>

        {/* 3 Variations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {variations.map((v) => {
            const isSelected = currentVariation === v.id;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVariation(v.id)}
                className={`relative rounded-3xl p-5 border-2 transition cursor-pointer flex flex-col justify-between backdrop-blur-xl ${
                  isSelected
                    ? 'border-[#C77DFF] bg-purple-500/15 shadow-xl ring-2 ring-[#1E1B4B]/40'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#1E1B4B] text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                    <Check className="w-3 h-3" /> Active Brand
                  </div>
                )}

                <div>
                  {/* Large Icon Preview Showcase */}
                  <div className="h-28 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-4 transition group-hover:scale-105">
                    <Logo variation={v.id} size="xl" showText={false} />
                  </div>

                  <div className="mb-2">
                    <span className="text-[11px] font-bold tracking-wide text-[#C77DFF] uppercase">
                      {v.tag}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{v.name}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {v.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-[11px] font-medium text-slate-400 block mb-2">
                    Recommended: <span className="text-slate-200 font-semibold">{v.bestFor}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVariation(v.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1E1B4B] text-white shadow-lg shadow-purple-950/50'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    {isSelected ? 'Selected Active Logo' : 'Set as Active Logo'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive App Store & Banner Preview */}
        <div className="mt-6 p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/15 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
              <Logo variation={currentVariation} size="lg" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">We Care App – iOS &amp; Android Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B] text-white font-bold">Phase 1</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Kingston &amp; St Andrew home nurse dispatch service. Red &amp; Purple brand identity applied across all roles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs shrink-0 shadow-lg"
          >
            Apply &amp; Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
