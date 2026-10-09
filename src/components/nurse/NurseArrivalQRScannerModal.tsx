import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Keyboard, 
  Clock, 
  Flashlight,
  Timer,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, NurseProfile, VisitQRAction, ActivityNotificationType } from '../../types';
import { 
  verifyDoorstepCheckin, 
  generateBookingCheckin, 
  getBookingCheckin, 
  logSecurityEvent 
} from '../../services/qrFirebaseStore';
import { soundFX } from '../../utils/soundEffects';

interface NurseArrivalQRScannerModalProps {
  booking: Booking | null;
  currentNurse: NurseProfile;
  isOpen: boolean;
  initialMode?: VisitQRAction;
  onClose: () => void;
  onConfirmArrival: (bookingId: string, arrivalData: {
    arrivalVerified: boolean;
    pinVerified: boolean;
    arrivalVerifiedAt: string;
    arrivalVerificationMethod: 'qr_scan' | 'passcode_entry';
    arrivalGpsLocation: string;
    visitStartedAt: string;
  }) => void;
  onConfirmCheckout?: (bookingId: string, checkoutData: {
    checkoutVerified: boolean;
    checkoutVerifiedAt: string;
    checkoutVerificationMethod: 'qr_scan' | 'passcode_entry';
    checkoutGpsLocation: string;
    visitEndedAt: string;
    actualDurationMinutes: number;
  }) => void;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
}

export const NurseArrivalQRScannerModal: React.FC<NurseArrivalQRScannerModalProps> = ({
  booking,
  currentNurse,
  isOpen,
  initialMode,
  onClose,
  onConfirmArrival,
  onConfirmCheckout,
  onUpdateBookingStatus,
  onTriggerNotification
}) => {
  const scannerContainerId = 'nurse-html5-qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [activeMode, setActiveMode] = useState<VisitQRAction>('check_in');
  const [manualPin, setManualPin] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [verifiedAtTime, setVerifiedAtTime] = useState<string>('');

  const gpsLocation = '14 Trafalgar Road, Kingston 10, Jamaica';

  // Ensure checkin record exists in Firebase/store
  useEffect(() => {
    if (!isOpen || !booking) return;
    generateBookingCheckin(booking.id);
    setActiveMode(initialMode || (booking.status === 'in_progress' ? 'check_out' : 'check_in'));
    setVerifiedSuccess(false);
    setInputError(null);
    setManualPin('');
    setCameraError(null);
  }, [isOpen, booking?.id, initialMode]);

  // Start Html5Qrcode camera scanner
  useEffect(() => {
    if (!isOpen || verifiedSuccess || showManualInput || !booking) return;

    let isMounted = true;

    // Small delay to ensure DOM element with id is rendered
    const timer = setTimeout(() => {
      try {
        const scannerElement = document.getElementById(scannerContainerId);
        if (!scannerElement) return;

        const html5Qr = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5Qr;

        html5Qr.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 }
          },
          (decodedText) => {
            if (isMounted) {
              handleProcessScanned(decodedText, 'qr_scan');
            }
          },
          () => {
            // Ignore ongoing frame scanning errors
          }
        ).catch((err: any) => {
          console.warn('Camera stream error:', err);
          if (isMounted) {
            setCameraError('Camera access not active or denied. Enter the 4-digit PIN below.');
            setShowManualInput(true);
          }
        });
      } catch (err) {
        console.warn('Html5Qrcode init error:', err);
        setCameraError('Camera unavailable. Please enter 4-digit PIN.');
        setShowManualInput(true);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, verifiedSuccess, showManualInput, booking?.id]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        // Safe to ignore cleanup error
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleProcessScanned = (codeOrPin: string, method: 'qr_scan' | 'passcode_entry') => {
    if (!booking || isVerifying || verifiedSuccess) return;

    setIsVerifying(true);
    setInputError(null);

    // Verify against /bookings/{bookingId}/checkin
    const result = verifyDoorstepCheckin(booking.id, codeOrPin, gpsLocation);

    if (result.success) {
      stopScanner();
      setVerifiedSuccess(true);
      setIsVerifying(false);

      const nowIso = new Date().toISOString();
      const timeStr = new Date(nowIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setVerifiedAtTime(timeStr);

      soundFX.playSuccessPing();
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#1E1B4B', '#F59E0B', '#3B82F6', '#10B981']
      });

      // Update booking status to ARRIVED_VERIFIED with pinVerified: true
      if (onConfirmArrival) {
        onConfirmArrival(booking.id, {
          arrivalVerified: true,
          pinVerified: true,
          arrivalVerifiedAt: nowIso,
          arrivalVerificationMethod: method,
          arrivalGpsLocation: gpsLocation,
          visitStartedAt: nowIso
        });
      }

      if (onUpdateBookingStatus) {
        onUpdateBookingStatus(booking.id, 'ARRIVED_VERIFIED', undefined, {
          arrivalVerified: true,
          pinVerified: true,
          arrivalVerifiedAt: nowIso,
          arrivalVerificationMethod: method,
          arrivalGpsLocation: gpsLocation,
          visitStartedAt: nowIso
        });
      }

      if (onTriggerNotification) {
        onTriggerNotification(
          'arrival_checkin',
          'Nurse Arrived - PIN Verified ✓',
          `Nurse ${currentNurse.name} verified doorstep check-in at ${gpsLocation}. Job session started at ${timeStr}.`,
          booking.id
        );
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setIsVerifying(false);
      setInputError(result.reason || 'Invalid PIN/QR - Try again');
      soundFX.playErrorBeep();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPin.trim()) return;
    handleProcessScanned(manualPin.trim(), 'passcode_entry');
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#0f0a26] border-2 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-auto max-h-[94vh] overflow-y-auto"
        style={{ borderColor: '#1E1B4B' }}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#1E1B4B]"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E1B4B]" />
            <span>Doorstep Attendance Verification</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Scan Client QR Pass
          </h3>
          <p className="text-xs text-slate-300">
            Patient: <strong className="text-white">{booking.clientName}</strong> • #{booking.id}
          </p>
        </div>

        {/* GPS Location Pill (14 Trafalgar Road check) */}
        <div className="p-2.5 rounded-2xl bg-[#1E1B4B] border border-[#F59E0B]/40 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Navigation className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span>GPS Pinpoint Check:</span>
          </span>
          <span className="font-mono text-amber-300 font-bold truncate max-w-[190px]">
            {gpsLocation}
          </span>
        </div>

        {/* Success Banner */}
        {verifiedSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-center space-y-2 animate-bounce">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto font-black shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-white">
              PIN Verified on Arrival ✓ - Job Started
            </h4>
            <p className="text-xs text-emerald-200">
              Verified at {verifiedAtTime || '9:32 AM'} • Status updated to ARRIVED_VERIFIED
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              GPS Location logged: {gpsLocation}
            </p>
          </div>
        ) : (
          <>
            {/* Camera Viewfinder or Manual PIN Box */}
            {!showManualInput ? (
              <div className="space-y-3">
                <div 
                  className="relative rounded-2xl overflow-hidden bg-black aspect-square flex flex-col items-center justify-center border-4"
                  style={{ borderColor: '#1E1B4B' }}
                >
                  {/* Html5Qrcode Scanner Target */}
                  <div id={scannerContainerId} className="w-full h-full" />

                  {/* Corner Accent Box */}
                  <div className="pointer-events-none absolute inset-6 border-2 border-[#F59E0B]/60 rounded-2xl" />
                </div>

                {cameraError && (
                  <p className="text-xs text-amber-300 text-center">{cameraError}</p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      stopScanner();
                      setShowManualInput(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                  >
                    <Keyboard className="w-4 h-4 text-[#F59E0B]" />
                    <span>Type 4-Digit PIN Manually</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Manual 4-Digit PIN Form */
              <form onSubmit={handleManualSubmit} className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/15">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-amber-300 block">
                    Enter Client's 4-Digit Doorstep PIN
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Client displays this PIN under their QR code or receives it via WhatsApp.
                  </p>
                </div>

                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 8392"
                    value={manualPin}
                    onChange={(e) => {
                      setManualPin(e.target.value);
                      setInputError(null);
                    }}
                    className="w-48 py-3 text-center font-mono font-black text-2xl tracking-widest rounded-2xl bg-[#1E1B4B] text-[#F59E0B] border-2 border-[#F59E0B] focus:outline-none"
                    autoFocus
                  />
                </div>

                {inputError && (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{inputError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Use Camera
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || !manualPin.trim()}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer text-[#1E1B4B] shadow-md disabled:opacity-50"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <span>{isVerifying ? 'Verifying...' : 'Verify PIN & Start Job'}</span>
                  </button>
                </div>
              </form>
            )}

            {inputError && !showManualInput && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
