import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Scan, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  AlertCircle, 
  PhoneCall, 
  Camera, 
  Smartphone, 
  ArrowRight, 
  Volume2, 
  Sparkles, 
  Lock, 
  Check, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { WeCareTrackLogo } from './WeCareTrackLogo';

export interface EasyQRCheckInGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
  onOpenVideoTour?: () => void;
}

export const EasyQRCheckInGuideModal: React.FC<EasyQRCheckInGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
  onOpenVideoTour
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulator'>('guide');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate realistic demo QR Code for the interactive simulator
  useEffect(() => {
    if (!isOpen) return;

    const samplePayload = JSON.stringify({
      app: 'WeCareTrack-Jamaica',
      bookingId: 'BK-JAM-8842',
      nurseId: 'nurse-ncj-942',
      nurseName: 'Nurse Althea Sterling, RN',
      licenseNCJ: 'NCJ-8942-B',
      parish: 'Kingston & St. Andrew',
      procedure: 'Post-Op Sterile Wound Dressing',
      timestamp: new Date().toISOString()
    });

    QRCode.toDataURL(samplePayload, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.warn('QR generation error in guide:', err);
    });
  }, [isOpen]);

  const handleRunDemoScan = () => {
    setIsScanning(true);
    setScanSuccess(false);
    soundFX.playToggleClick();

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      soundFX.playDoorbellAlert(true);
    }, 1800);
  };

  const handleResetDemo = () => {
    setIsScanning(false);
    setScanSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#0b102c] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Cardiac Gradient Accent */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Easy QR Doorstep Check-in Guide
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                  Anti-Fraud Protocol
                </span>
              </div>
              <p className="text-xs text-slate-300">
                How clients verify nurse arrival in 3 seconds for instant clinical &amp; safety logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Zero-pill discipline: Segmented controls) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Step-by-Step Instructions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive QR Simulator</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Escrow &amp; GPS Locked</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-950/30 to-black/40 border border-blue-500/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">
                    Why Every Visit Requires Doorstep QR Verification
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under Jamaican Ministry of Health &amp; NCJ patient safety standards, your payment stays safe in platform escrow until the attending nurse physically arrives at your residence. The QR scan matches your GPS location and establishes an official clinical time-stamp.
                  </p>
                </div>
              </div>

              {/* 4 Interactive Visual Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
                      01
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Step 1</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Nurse Arrives &amp; Shows QR</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When your licensed nurse arrives at your gate or doorstep, they open their official We Care Jamaica Nurse App to present their encrypted <strong>Arrival QR Badge</strong>.
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                    💡 Tip: The nurse will also display their physical NCJ photo ID badge.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-400/40 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 font-mono font-black text-xs flex items-center justify-center border border-blue-500/30">
                      02
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Step 2</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Open Camera or Client App</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open your <strong>We Care Jamaica</strong> client screen or simply point your mobile phone camera directly at the QR code displayed on the nurse's device.
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                    💡 No app installed? Any standard smartphone camera automatically detects the secure check-in link.
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs flex items-center justify-center border border-emerald-500/30">
                      03
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Step 3</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Audible Chime &amp; Instant Match</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Both devices instantly play a confirmation chime. The visit status updates from <strong>"En Route"</strong> to <strong>"Arrived &amp; In Progress"</strong>.
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                    💡 GPS anti-fraud verifies the nurse is within 100 meters of your registered parish address.
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-black text-xs flex items-center justify-center border border-purple-500/30">
                      04
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Step 4</span>
                  </div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Care Starts &amp; Timer Begins</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your nurse begins procedure care (wound dressing, IV line, vitals). When care is finished, a second checkout QR scan logs departure and generates your itemized insurance receipt.
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                    💡 100% itemized for Jamaican health insurance reimbursement (Sagicor, Medecus, Guardian).
                  </div>
                </div>
              </div>

              {/* What if my camera isn't working? (Backup 4-Digit PIN) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300">Offline or Camera Issue?</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-bold">Backup PIN</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    If your phone camera is damaged or low on battery, your nurse can verbally confirm your booking's secure <strong>4-digit check-in PIN</strong> displayed directly on their visit dispatch ticket.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-md"
                >
                  Try Interactive Demo →
                </button>
              </div>
            </div>
          ) : (
            /* INTERACTIVE QR SIMULATOR TAB */
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h4 className="text-base font-black text-white">
                  Practice Scanning a Nurse Arrival QR Code
                </h4>
                <p className="text-xs text-slate-300">
                  See exactly how the doorstep check-in operates in real life.
                </p>
              </div>

              {/* Simulated Dual Device Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Nurse's Simulated Screen with Arrival QR Badge */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 relative shadow-xl space-y-4 text-center">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Nurse Screen</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      BK-JAM-8842
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-sm">Nurse Althea Sterling, RN</h5>
                    <p className="text-[11px] text-emerald-400 font-mono">NCJ License #8942-B • Kingston 6</p>
                    <p className="text-[11px] text-slate-300">Procedure: Post-Op Wound Care &amp; Dressing</p>
                  </div>

                  {/* QR Code Container with Scanner Laser Effect */}
                  <div className="relative w-48 h-48 mx-auto p-2 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="Demo Arrival QR Code" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-slate-800 text-xs font-mono font-bold animate-pulse">
                        Generating QR...
                      </div>
                    )}

                    {/* Scanning Laser Line when scanning is active */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-bounce shadow-md shadow-rose-500/80" />
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Fallback PIN: <span className="text-amber-300 font-bold tracking-widest">7491</span>
                  </div>
                </div>

                {/* Right: Client Scanner / Verification Result Screen */}
                <div className="p-5 rounded-3xl bg-black/60 border border-white/15 relative shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Client Smartphone</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Live Telemetry</span>
                  </div>

                  {!scanSuccess && !isScanning && (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400/60 flex items-center justify-center text-amber-400 bg-amber-500/10 animate-pulse">
                        <Scan className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-bold text-white text-sm">Point Camera at Nurse's QR</h5>
                        <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                          Click below to test the automatic doorstep scan and chime confirmation.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRunDemoScan}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition cursor-pointer flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Simulate Test Scan</span>
                      </button>
                    </div>
                  )}

                  {isScanning && (
                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
                      <h5 className="font-bold text-amber-300 text-sm">Reading Encrypted Booking Token...</h5>
                      <p className="text-xs text-slate-400 font-mono">Checking GPS Proximity (Kingston &amp; St. Andrew)...</p>
                    </div>
                  )}

                  {scanSuccess && (
                    <div className="py-4 space-y-3 animate-fadeIn">
                      <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 space-y-2 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h5 className="font-black text-emerald-300 text-sm">
                          Doorstep Arrival Verified!
                        </h5>
                        <p className="text-xs text-slate-200">
                          Audible medical chime triggered. Visit timer and clinical charting started.
                        </p>
                      </div>

                      {/* Verified details card */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>Attending Nurse:</span>
                          <span className="font-bold text-white">Nurse Althea Sterling, RN</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Verification Time:</span>
                          <span className="font-mono text-emerald-400">10:45 AM (GPS Matched)</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Escrow Status:</span>
                          <span className="font-bold text-amber-300">Held in Escrow (Protected)</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleResetDemo}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Test Again</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Direct Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Questions? 24/7 Support: support@wecareja.care</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onOpenVideoTour && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVideoTour();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Watch Video Tour
              </button>
            )}

            {onOpenBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Book a Nurse Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
