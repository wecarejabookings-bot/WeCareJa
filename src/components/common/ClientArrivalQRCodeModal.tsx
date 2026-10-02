import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Sparkles,
  LogIn,
  LogOut,
  Timer,
  UserCheck,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking, VisitQRAction } from '../../types';
import { 
  generateVisitQRPayload, 
  getArrivalPassCode, 
  getCheckoutPassCode,
  getZoneGpsDescription
} from '../../utils/arrivalVerification';
import { soundFX } from '../../utils/soundEffects';
import { PPESafetyNotice } from './PPESafetyNotice';

interface ClientArrivalQRCodeModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateNurseArrival?: (bookingId: string) => void;
  onSimulateNurseCheckout?: (bookingId: string) => void;
  initialTab?: VisitQRAction;
}

export const ClientArrivalQRCodeModal: React.FC<ClientArrivalQRCodeModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSimulateNurseArrival,
  onSimulateNurseCheckout,
  initialTab
}) => {
  // Determine initial active tab based on visit state
  const defaultTab: VisitQRAction = initialTab || (booking?.status === 'in_progress' ? 'check_out' : 'check_in');
  const [activeTab, setActiveTab] = useState<VisitQRAction>(defaultTab);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Sync tab when booking or initialTab changes
  useEffect(() => {
    if (booking) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (booking.status === 'in_progress') {
        setActiveTab('check_out');
      } else {
        setActiveTab('check_in');
      }
    }
  }, [booking?.id, booking?.status, initialTab]);

  if (!isOpen || !booking) return null;

  const isCheckIn = activeTab === 'check_in';
  const checkInPassCode = getArrivalPassCode(booking);
  const checkOutPassCode = getCheckoutPassCode(booking);
  const activePassCode = isCheckIn ? checkInPassCode : checkOutPassCode;
  
  const qrPayload = generateVisitQRPayload(booking, activeTab);
  const isArrivalVerified = Boolean(booking.arrivalVerified);
  const isCheckoutVerified = Boolean(booking.checkoutVerified || booking.status === 'completed');

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activePassCode);
      setCopiedCode(true);
      soundFX.playSuccessPing();
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    try {
      const svgElement = qrContainerRef.current?.querySelector('svg');
      if (!svgElement) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgElement);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wecare-visit-${booking.id}-${activeTab}-pass.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      soundFX.playSuccessPing();
    } catch (err) {
      console.warn('Error downloading QR pass:', err);
    }
  };

  const zoneGps = getZoneGpsDescription(booking.zone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1b1033] via-[#120a26] to-[#0a0518] border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-900/60 text-white space-y-4 my-auto">
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5 text-purple-300" />
            <span>Visit Attendance &amp; Sign-Off Pass</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Nurse-Client Visit QR Generator
          </h3>
          <p className="text-xs text-purple-200">
            {booking.serviceName} • Visit <span className="font-mono text-white font-bold">#{booking.id}</span>
          </p>
        </div>

        {/* Dual Mode Switcher Tabs: Check-In vs Check-Out */}
        <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('check_in');
              soundFX.playFilterSelect();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'check_in'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>1. Check-In (Initiate)</span>
            {isArrivalVerified ? (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" title="Arrival Verified" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('check_out');
              soundFX.playFilterSelect();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'check_out'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>2. Check-Out (Complete)</span>
            {isCheckoutVerified ? (
              <span className="w-2 h-2 rounded-full bg-emerald-300" title="Visit Complete" />
            ) : booking.status === 'in_progress' ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 text-[9px] font-bold">
                Active
              </span>
            ) : null}
          </button>
        </div>

        {/* Dynamic Status Card for Selected Tab */}
        {isCheckIn ? (
          isArrivalVerified ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-start gap-3 shadow-lg shadow-emerald-950/40">
              <span className="p-2 rounded-xl bg-emerald-500 text-slate-950 shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div className="space-y-0.5 text-left text-xs">
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  Doorstep Check-In Verified ✓
                </span>
                <h4 className="font-bold text-white">
                  Care Visit Initiated by {booking.nurseName || 'Attending Nurse'}
                </h4>
                <p className="text-emerald-100 text-[11px]">
                  {booking.arrivalVerifiedAt 
                    ? `Checked in at ${new Date(booking.arrivalVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Attendance verified via QR scan'}
                </p>
                {booking.arrivalGpsLocation && (
                  <p className="text-[10px] text-emerald-200/80 flex items-center gap-1 font-mono pt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{booking.arrivalGpsLocation}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-3 text-left">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </span>
              <div className="space-y-0.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Ready for Doorstep Check-In
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  Present this QR pass to <strong>{booking.nurseName || 'the caregiver'}</strong> upon doorstep arrival to verify attendance and start the visit clock.
                </p>
              </div>
            </div>
          )
        ) : (
          /* Check-Out Status Card */
          isCheckoutVerified ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-start gap-3 shadow-lg shadow-emerald-950/40">
              <span className="p-2 rounded-xl bg-emerald-500 text-slate-950 shrink-0 font-bold">
                <FileCheck className="w-5 h-5" />
              </span>
              <div className="space-y-0.5 text-left text-xs">
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  Care Visit Completed &amp; Signed Off ✓
                </span>
                <h4 className="font-bold text-white">
                  Check-Out Confirmed with {booking.nurseName || 'Attending Nurse'}
                </h4>
                <p className="text-emerald-100 text-[11px]">
                  {booking.checkoutVerifiedAt || booking.visitEndedAt
                    ? `Completed at ${new Date(booking.checkoutVerifiedAt || booking.visitEndedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Visit finished'}
                  {booking.actualDurationMinutes ? ` • Duration: ${booking.actualDurationMinutes} mins` : ''}
                </p>
                <p className="text-[10px] text-emerald-200/90 font-medium pt-0.5">
                  Escrow clearing authorized • Itemized invoice receipt &amp; Medical Summary available
                </p>
              </div>
            </div>
          ) : booking.status === 'in_progress' ? (
            <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-start gap-3 text-left">
              <span className="p-2 rounded-xl bg-purple-500/30 text-purple-200 border border-purple-400/40 shrink-0">
                <Timer className="w-5 h-5 animate-spin" />
              </span>
              <div className="space-y-0.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Visit In Progress ⏱️
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  When your care session is concluding, present this Check-Out QR code to <strong>{booking.nurseName || 'the nurse'}</strong> to record visit completion, lock clinical telemetry, and release escrow.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 flex items-start gap-3 text-left">
              <span className="p-2 rounded-xl bg-white/5 text-slate-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div className="space-y-0.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Check-Out Pending Visit Start
                </span>
                <p className="text-slate-300 text-[11px]">
                  Please complete the Check-In scan first when your nurse arrives. Check-Out can then be scanned when the visit concludes.
                </p>
              </div>
            </div>
          )
        )}

        {/* On-Arrival Personal Protection & PPE Reminder */}
        <PPESafetyNotice variant="on_arrival" userRole="client" />

        {/* QR Code Canvas Frame */}
        <div 
          ref={qrContainerRef}
          className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white shadow-xl space-y-3 relative overflow-hidden text-slate-900"
        >
          {/* Subtle Jamaican Flag Accent Stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-yellow-400 to-black" />
          
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            <span>{isCheckIn ? '🟢 Step 1: Doorstep Check-In' : '🟣 Step 2: Departure Check-Out'}</span>
          </div>

          <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-200">
            <QRCodeSVG
              value={qrPayload}
              size={195}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="text-center space-y-1 w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              {isCheckIn ? 'Doorstep Check-In Passcode' : 'Visit Check-Out Passcode'}
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-2xl font-mono font-black tracking-widest px-4 py-1.5 rounded-xl border ${
                isCheckIn
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  : 'text-purple-900 bg-purple-50 border-purple-300'
              }`}>
                {activePassCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs transition cursor-pointer"
                title="Copy verification passcode"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Caregiver can scan the QR code above or key in this 4-digit code manually.
            </p>
          </div>
        </div>

        {/* Remote Family Member / Relative Device Access Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-blue-950/50 border border-purple-400/40 text-left space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                👨‍👩‍👧
              </div>
              <div>
                <span className="text-xs font-black text-white block">
                  Remote Family / Guardian Access
                </span>
                <span className="text-[10px] text-purple-300">
                  Client unable to use a device? Relatives elsewhere can relay the code.
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
              Remote Device OK
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            If the patient is resting, elderly, or does not own a smartphone, a family member elsewhere (e.g., son or daughter in Kingston or abroad) can access this screen on their own device and read or text this code to the caregiver at the door.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hello! Here is the We Care doorstep arrival code for ${booking.clientName}'s visit with ${booking.nurseName || 'Nurse'}: ${activePassCode}. Please scan or enter this code to start the visit.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-200 hover:text-white border border-[#25D366]/40 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>📲 Send via WhatsApp</span>
            </a>

            {booking.nursePhone && (
              <a
                href={`tel:${String(booking.nursePhone).replace(/[^0-9+]/g, '')}`}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-400/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>📞 Call Nurse ({booking.nursePhone})</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-medium transition"
            >
              {copiedCode ? '✓ Copied PIN' : 'Copy PIN for Nurse'}
            </button>
          </div>
        </div>

        {/* Geofence & Escrow Assurance */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-400/20 space-y-2 text-left text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-purple-200">
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Geofenced Address:</span>
            </span>
            <strong className="text-white truncate max-w-[210px]">
              {booking.clientAddress}, {booking.zone}
            </strong>
          </div>
          <div className="flex items-center justify-between text-slate-300 border-t border-white/10 pt-2 text-[11px]">
            <span className="flex items-center gap-1.5 text-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Guarantee:</span>
            </span>
            <span className="text-emerald-300 font-bold font-mono">
              NCJ Verified • Escrow Protected
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Quick Simulation Buttons for Demo & Testing */}
          <div className="flex items-center gap-2">
            {isCheckIn && !isArrivalVerified && onSimulateNurseArrival && (
              <button
                type="button"
                onClick={() => {
                  onSimulateNurseArrival(booking.id);
                  soundFX.playSuccessPing();
                }}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer"
                title="Simulate nurse scanning Check-In right now"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Check-In</span>
              </button>
            )}

            {!isCheckIn && !isCheckoutVerified && onSimulateNurseCheckout && (
              <button
                type="button"
                onClick={() => {
                  onSimulateNurseCheckout(booking.id);
                  soundFX.playSuccessPing();
                }}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5 cursor-pointer"
                title="Simulate nurse scanning Check-Out right now"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Simulate Check-Out</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Download QR SVG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Print QR pass"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-200 text-xs font-black shadow-md transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export alias for semantic clarity
export const BookingQRPassModal = ClientArrivalQRCodeModal;
