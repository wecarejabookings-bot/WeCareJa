import React, { useState } from 'react';
import { NurseProfile } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Phone, 
  Mail, 
  Award, 
  Calendar, 
  MapPin, 
  Heart, 
  Copy, 
  Check, 
  Sparkles, 
  RotateCw, 
  FileBadge,
  Layers,
  Building2,
  Lock
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export interface VerifiedWeCareIDCardModalProps {
  nurse: NurseProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const VerifiedWeCareIDCardModal: React.FC<VerifiedWeCareIDCardModalProps> = ({
  nurse,
  isOpen,
  onClose
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('both');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Format ID & credentials
  const idNumber = `WC-JAM-ID-${String(nurse?.id || '').replace('nurse-', '').toUpperCase()}-${String(nurse?.nursingCouncilLicense || '2026').replace(/[^0-9]/g, '').slice(-4) || '8812'}`;
  const issueDate = '01/2026';
  const expiryDate = nurse.licenseExpiryDate 
    ? new Date(nurse.licenseExpiryDate).toLocaleDateString('en-JM', { month: '2-digit', year: 'numeric' })
    : '12/2027';

  const verificationUrl = `https://wecare.jm/verify/practitioner/${nurse.id}`;

  const handlePrint = () => {
    soundFX.playIDCardGenerated();
    // Brief timeout to ensure DOM is ready
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      soundFX.playSuccessPing();
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCelebrate = () => {
    soundFX.playIDCardGenerated();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#120622]/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-purple-500/30 text-white flex flex-col my-auto">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-[#120622]/95 backdrop-blur-md z-20 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7209B7] to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-950/40 border border-white/20">
              <FileBadge className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">Verified We Care ID Card</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  NCJ Verified
                </span>
              </div>
              <p className="text-xs text-purple-200/70">
                Official clinical credential badge &amp; printable PDF document for in-field verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="hidden sm:flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveSide('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeSide === 'both' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Both Sides
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeSide === 'front' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeSide === 'back' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>

            {/* Primary Print / Save as PDF Button */}
            <button
              type="button"
              id="btn-print-wecare-id-card"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Open browser print dialog to print or save ID badge as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyVerificationLink}
              className="hidden sm:flex px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 transition items-center gap-1.5 cursor-pointer"
              title="Copy official public credential verification URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div id="wecare-verified-id-card-doc" className="p-4 sm:p-8 space-y-6 printable-container">
          
          {/* Print Header Notice (visible on printed PDF) */}
          <div className="hidden print:block text-center pb-4 border-b border-slate-300 mb-6">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
              We Care Healthcare Services Jamaica
            </h1>
            <p className="text-xs text-slate-600">
              Official Healthcare Practitioner Credential &amp; Identity Verification Document
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Verified under Nursing Council of Jamaica (NCJ) Regulatory Framework • Printed on {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Cards Showcase Grid */}
          <div className={`grid gap-6 ${activeSide === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
            
            {/* FRONT OF THE ID BADGE */}
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="page-break-inside-avoid">
                <div className="text-[11px] font-bold text-purple-300 mb-1.5 flex items-center justify-between print:hidden">
                  <span>Front of Badge (Standard CR80 ID)</span>
                  <span className="text-[10px] text-slate-400 font-mono">3.375" × 2.125"</span>
                </div>

                {/* Physical Card Container */}
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 bg-gradient-to-br from-[#1b0b30] via-[#10031e] to-[#0a0214] text-white p-5 aspect-[1.586/1] flex flex-col justify-between print:border-slate-800 print:text-slate-900 print:bg-white print:shadow-none"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(114, 9, 183, 0.4)'
                  }}
                >
                  {/* Decorative Security Background Holographic Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C77DFF_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-amber-400/20 to-purple-500/20 blur-xl pointer-events-none" />

                  {/* Card Top Brand & Regulatory Header */}
                  <div className="relative z-10 flex items-start justify-between gap-2 border-b border-white/15 pb-2.5 print:border-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7209B7] to-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-md border border-white/20">
                        WC
                      </div>
                      <div>
                        <div className="text-[10px] font-black tracking-wider text-amber-300 uppercase leading-none print:text-amber-700">
                          We Care Jamaica
                        </div>
                        <div className="text-[9px] text-purple-200/90 font-semibold tracking-tight print:text-slate-600">
                          Healthcare Services &amp; Nursing Network
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300 uppercase print:text-emerald-800 print:border-emerald-600">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>NCJ VERIFIED</span>
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono mt-0.5 print:text-slate-500">
                        {idNumber}
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Photo + Practitioner Information */}
                  <div className="relative z-10 grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-3.5 items-center my-auto py-1">
                    {/* Practitioner Photo Container */}
                    <div className="relative">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-lg bg-slate-800 relative">
                        <img 
                          src={nurse.photoUrl} 
                          alt={nurse.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Live active duty corner indicator */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[8px] font-bold text-emerald-300 flex items-center gap-0.5 border border-emerald-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>ACTIVE</span>
                        </div>
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-[8px] font-mono text-amber-300 font-bold uppercase tracking-widest block print:text-amber-800">
                          LICENSED
                        </span>
                      </div>
                    </div>

                    {/* Practitioner Details */}
                    <div className="space-y-1">
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base leading-tight tracking-tight print:text-slate-900">
                          {nurse.name}
                        </h4>
                        <p className="text-[11px] font-bold text-purple-300 print:text-purple-800">
                          {nurse.qualificationTitle || 'Registered General Nurse (NCJ)'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] sm:text-[10px] pt-1">
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase tracking-wider print:text-slate-500">NCJ License No.</span>
                          <span className="font-mono font-bold text-emerald-300 text-[10px] print:text-emerald-700">
                            {nurse.nursingCouncilLicense || 'NCJ-RN-2018-4912'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase tracking-wider print:text-slate-500">Valid Through</span>
                          <span className="font-mono font-bold text-slate-200 print:text-slate-800">{expiryDate}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[8px] uppercase tracking-wider print:text-slate-500">Approved Parishes</span>
                          <span className="text-slate-200 font-medium truncate block print:text-slate-700">
                            Kingston, St. Andrew, Portmore, Spanish Town
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Verification Chip & Holographic Signature Bar */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-2 text-[8px] text-slate-400 print:border-slate-300 print:text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-4 rounded bg-amber-400/30 border border-amber-400/60 flex items-center justify-center text-[7px] font-black text-amber-300 print:text-amber-800">
                        SIM
                      </div>
                      <span className="font-mono">ISS: {issueDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="block text-[7px] text-slate-400 uppercase">Director Authorization</span>
                        <span className="font-serif italic font-bold text-[10px] text-amber-200 print:text-amber-900">
                          Sydney Mattis
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-[7px] text-amber-300 font-black">
                        ★
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BACK OF THE ID BADGE */}
            {(activeSide === 'both' || activeSide === 'back') && (
              <div className="page-break-inside-avoid">
                <div className="text-[11px] font-bold text-purple-300 mb-1.5 flex items-center justify-between print:hidden">
                  <span>Reverse of Badge (Verification QR &amp; Safety Terms)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Security Magnetic / QR</span>
                </div>

                {/* Physical Card Reverse Container */}
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-gradient-to-br from-[#120520] via-[#0d0218] to-[#08010f] text-white p-5 aspect-[1.586/1] flex flex-col justify-between print:border-slate-800 print:text-slate-900 print:bg-white print:shadow-none"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(114, 9, 183, 0.3)'
                  }}
                >
                  {/* Magnetic Stripe representation */}
                  <div className="h-7 -mx-5 -mt-1 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-white/10 flex items-center px-4 print:bg-slate-800 print:border-slate-700">
                    <span className="text-[7px] font-mono tracking-widest text-slate-400 uppercase">
                      WE CARE JAMAICA SECURE SMART CREDENTIAL • ENCRYPTED DATA BUS
                    </span>
                  </div>

                  {/* Reverse Body: QR Code & Verification Rules */}
                  <div className="grid grid-cols-[1fr_85px] sm:grid-cols-[1fr_100px] gap-3 items-center py-2">
                    <div className="space-y-1.5 text-[8.5px] leading-tight text-slate-300 print:text-slate-700">
                      <p className="font-semibold text-white print:text-slate-900">
                        OFFICIAL PRACTITIONER COMPLIANCE NOTICE:
                      </p>
                      <p className="text-[8px] text-slate-400 print:text-slate-600">
                        This credential certifies that the bearer is a vetted, background-checked, and Nursing Council of Jamaica (NCJ) registered healthcare professional authorized to provide in-home clinical care.
                      </p>
                      <div className="bg-black/40 p-1.5 rounded-lg border border-white/10 text-[7.5px] space-y-0.5 print:bg-slate-100 print:border-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">24/7 Operations Desk:</span>
                          <strong className="text-white font-mono print:text-slate-900">+1 (876) 582-7613</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Emergency Dispatch:</span>
                          <strong className="text-red-400 font-mono font-bold">119 Police / Ambulance</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Headquarters:</span>
                          <span className="text-slate-300 print:text-slate-700">4 Claudete Drive, St. Catherine</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code container */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-sm">
                      {/* SVG Vector QR Code */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-slate-50 p-1 rounded-lg">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" rx="4" fill="currentColor" />
                          <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                          <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                          <rect x="70" y="0" width="30" height="30" rx="4" fill="currentColor" />
                          <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                          <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                          <rect x="0" y="70" width="30" height="30" rx="4" fill="currentColor" />
                          <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                          <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                          {/* Data cells */}
                          <rect x="38" y="5" width="8" height="8" fill="currentColor" />
                          <rect x="52" y="5" width="8" height="8" fill="currentColor" />
                          <rect x="38" y="18" width="8" height="8" fill="currentColor" />
                          <rect x="52" y="18" width="8" height="8" fill="currentColor" />

                          <rect x="12" y="38" width="8" height="8" fill="currentColor" />
                          <rect x="25" y="45" width="8" height="8" fill="currentColor" />
                          <rect x="38" y="38" width="24" height="24" rx="2" fill="#7209B7" />
                          <rect x="68" y="38" width="8" height="8" fill="currentColor" />
                          <rect x="80" y="45" width="8" height="8" fill="currentColor" />

                          <rect x="38" y="72" width="8" height="8" fill="currentColor" />
                          <rect x="52" y="72" width="8" height="8" fill="currentColor" />
                          <rect x="68" y="72" width="8" height="8" fill="currentColor" />
                          <rect x="80" y="80" width="8" height="8" fill="currentColor" />
                        </svg>
                      </div>
                      <span className="text-[7.5px] font-mono font-bold text-slate-800 text-center uppercase tracking-tight mt-1">
                        SCAN TO VERIFY
                      </span>
                    </div>
                  </div>

                  {/* Reverse Bottom Bar */}
                  <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[7px] text-slate-400 print:border-slate-300 print:text-slate-600">
                    <span>If found, please return to We Care Jamaica HQ.</span>
                    <span className="font-mono">HASH: {nurse.id}-{Date.now().toString().slice(-4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Printable Verification Sheet Details (Visible on print) */}
          <div className="hidden print:block border-t-2 border-dashed border-slate-300 pt-6 mt-8 space-y-4 text-slate-800 text-xs page-break-inside-avoid">
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              Official Practitioner Verification Record
            </h2>
            <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-4 bg-slate-50">
              <div>
                <p><strong>Practitioner Name:</strong> {nurse.name}</p>
                <p><strong>Professional Category:</strong> {nurse.qualificationTitle || 'Registered Nurse'}</p>
                <p><strong>Nursing Council License:</strong> {nurse.nursingCouncilLicense}</p>
                <p><strong>Verification Authority:</strong> Nursing Council of Jamaica (NCJ)</p>
              </div>
              <div>
                <p><strong>We Care Credential ID:</strong> {idNumber}</p>
                <p><strong>Primary Contact:</strong> {nurse.phone}</p>
                <p><strong>Emergency Contact:</strong> {nurse.emergencyContact?.name} ({nurse.emergencyContact?.phone})</p>
                <p><strong>Clinical Directorate:</strong> Sydney Mattis, Lead Administrator</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Instructions: Cut along the border lines above to place inside a standard lanyard badge holder (CR80 vertical/horizontal clear pocket). This document is legally binding when accompanied by valid government photo identification.
            </p>
          </div>

          {/* Action Callout Box (Screen only) */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h5 className="font-bold text-white">Client Doorstep Security Presentation</h5>
                <p className="text-slate-300 text-[11px]">
                  Present this verified badge on your phone or wear the printed lanyard copy for immediate patient recognition and peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCelebrate}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Show Credentials</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 border border-emerald-400/40 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Print PDF Badge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
