import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Stethoscope, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface MarketingCampaign {
  id: string;
  name: string;
  targetUrl: string;
  badge: string;
  headline: string;
  subheadline: string;
  benefits: string[];
  callToAction: string;
}

const CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'nurse',
    name: 'Nurse & Midwife Recruitment',
    targetUrl: 'https://wecareja.care/nurse-signup',
    badge: 'HEALTHCARE PRACTITIONERS WANTED',
    headline: 'Join Jamaica’s Premier Private-Duty Nursing Network',
    subheadline: 'Open, free practitioner registration. Set your own schedule, work close to home in your parish, and keep 85% of your hourly rate.',
    benefits: [
      'Earn J$7,000 - J$8,500/hr based on specialty',
      'Weekly automated payouts directly to NCB, Scotia, JN Bank, or Lynk',
      'Doorstep arrival verification & 119 emergency coverage',
      'Free registration with active NCJ license'
    ],
    callToAction: 'Scan with your camera to sign up free in 2 minutes'
  },
  {
    id: 'client',
    name: 'Patient & Family Caregiver Booking',
    targetUrl: 'https://wecareja.care/client-signup',
    badge: 'COMPASSIONATE HOME HEALTHCARE',
    headline: 'Book Licensed Jamaican Nurses Directly to Your Doorstep',
    subheadline: 'Verified clinical homecare, elderly assistance, wound dressing, and vitals surveillance across all 14 parishes.',
    benefits: [
      '100% NCJ-registered, background-vetted practitioners',
      'Doorstep arrival authentication with real-time passkeys',
      'Flexible hourly and recurring shift homecare packages',
      'Free family account setup with zero hidden membership fees'
    ],
    callToAction: 'Scan with your camera to create your family care account'
  },
  {
    id: 'general',
    name: 'We Care Jamaica Main Portal',
    targetUrl: 'https://wecareja.care/',
    badge: 'HEALTHCARE DISPATCH JAMAICA',
    headline: 'Private-Duty Clinical Care & Medical Registry',
    subheadline: 'Connecting Jamaican families with compassionate registered nurses, midwives, and specialized medical care.',
    benefits: [
      '24/7 Clinical Emergency SOS Assistance',
      'On-demand medical supply orders & doorstep delivery',
      'Parish-wide coverage from Kingston to Montego Bay',
      'Trusted by hundreds of families islandwide'
    ],
    callToAction: 'Scan to explore services or sign up today'
  }
];

interface AdminMarketingQRGeneratorProps {
  onBackToPortal?: () => void;
}

export const AdminMarketingQRGenerator: React.FC<AdminMarketingQRGeneratorProps> = ({
  onBackToPortal
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('nurse');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const activeCampaign = CAMPAIGNS.find(c => c.id === selectedCampaignId) || CAMPAIGNS[0];

  useEffect(() => {
    QRCode.toDataURL(activeCampaign.targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1E1B4B',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate marketing QR:', err));
  }, [activeCampaign.targetUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeCampaign.targetUrl);
    setCopied(true);
    soundFX.playSuccessPing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `wecareja-qr-${activeCampaign.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundFX.playSuccessPing();
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* Top Controls & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToPortal && (
            <button
              type="button"
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
              title="Return to Portal"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                Marketing Ad Flyers
              </span>
              <span className="text-xs text-emerald-400 font-bold">100% Public • Zero Invite Codes</span>
            </div>
            <h2 className="text-lg font-black text-white">Public QR Code &amp; Flyer Generator</h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
            <span>{copied ? 'Link Copied' : 'Copy URL'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black text-[#1E1B4B] shadow-lg transition flex items-center gap-1.5 cursor-pointer hover:opacity-95"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Flyer</span>
          </button>
        </div>
      </div>

      {/* Campaign Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CAMPAIGNS.map((c) => {
          const isSelected = c.id === selectedCampaignId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCampaignId(c.id);
                soundFX.playToggleClick();
              }}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                  : 'bg-slate-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">{c.name}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <span className="text-[11px] font-mono text-amber-300 mt-1 truncate block">
                {c.targetUrl}
              </span>
            </button>
          );
        })}
      </div>

      {/* Printable Flyer Preview Area */}
      <div className="flex justify-center">
        <div 
          ref={flyerRef}
          className="w-full max-w-2xl bg-white text-slate-950 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-[#F59E0B] space-y-6 print:m-0 print:border-none print:shadow-none"
        >
          {/* Flyer Top Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1B4B] flex items-center justify-center text-amber-400 shadow-md">
                <Heart className="w-7 h-7 fill-[#F59E0B] text-[#F59E0B]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight leading-none">
                  We Care Jamaica
                </h1>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
                  Clinical Homecare &amp; Nurse Dispatch Network
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                100% Free Sign-Up
              </span>
              <span className="text-xs font-bold text-slate-600 block mt-1">Kingston &amp; Islandwide</span>
            </div>
          </div>

          {/* Campaign Headline */}
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {activeCampaign.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] leading-tight">
              {activeCampaign.headline}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {activeCampaign.subheadline}
            </p>
          </div>

          {/* Center Content: QR Code + Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
            {/* QR Code Container */}
            <div className="sm:col-span-5 flex flex-col items-center text-center p-4 rounded-3xl bg-slate-50 border-2 border-amber-400 shadow-sm">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Public Marketing QR Code" 
                  className="w-48 h-48 rounded-xl shadow-inner"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl" />
              )}
              <span className="text-xs font-black text-[#1E1B4B] mt-2 block">
                {activeCampaign.callToAction}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 block truncate max-w-full">
                {activeCampaign.targetUrl}
              </span>
            </div>

            {/* Benefits List */}
            <div className="sm:col-span-7 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Program Highlights &amp; Guarantee:
              </h4>
              <ul className="space-y-2">
                {activeCampaign.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-medium leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Flyer Footer */}
          <div className="border-t-2 border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="font-bold text-[#1E1B4B]">🌐 wecareja.care</span>
              <span>📞 (876) 582-7613</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Public Registration • Zero Invite Codes Needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketingQRGenerator;
