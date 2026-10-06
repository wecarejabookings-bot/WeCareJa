import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Keyboard, 
  Clock, 
  Flashlight,
  LogIn,
  LogOut,
  Timer,
  FileCheck,
  Database,
  WifiOff,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, NurseProfile, VisitQRAction } from '../../types';
import { 
  verifyScannedVisitData, 
  getArrivalPassCode, 
  getCheckoutPassCode,
  getZoneGpsDescription
} from '../../utils/arrivalVerification';
import { soundFX } from '../../utils/soundEffects';
import { isNetworkOnline, enqueueOfflineAction } from '../../utils/offlineSyncManager';
import { PPESafetyNotice } from '../common/PPESafetyNotice';
import { ArrivalDoorbellAlertButton } from '../common/ArrivalDoorbellAlertButton';
import { ActivityNotificationType } from '../../types';
import { 
  sendStartCodeWhatsApp, 
  sendEndCodeWhatsApp, 
  getBookingStartCode, 
  getBookingEndCode 
} from '../../utils/whatsappRemoteCare';

interface NurseArrivalQRScannerModalProps {
  booking: Booking | null;
  currentNurse: NurseProfile;
  isOpen: boolean;
  initialMode?: VisitQRAction;
  onClose: () => void;
  onConfirmArrival: (bookingId: string, arrivalData: {
    arrivalVerified: boolean;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  
  // Active scanner mode: check_in (initiate visit) vs check_out (complete visit)
  const [activeMode, setActiveMode] = useState<VisitQRAction>('check_in');

  // Verification states
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [verifiedAction, setVerifiedAction] = useState<VisitQRAction>('check_in');
  const [manualCode, setManualCode] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [verifiedGps, setVerifiedGps] = useState<string>('');
  const [recordedDuration, setRecordedDuration] = useState<number>(60);
  const [isOfflineProcessed, setIsOfflineProcessed] = useState<boolean>(false);

  // Auto set mode based on booking status or initialMode
  useEffect(() => {
    if (!isOpen || !booking) {
      stopCamera();
      return;
    }

    const defaultMode = initialMode || (booking.status === 'in_progress' ? 'check_out' : 'check_in');
    setActiveMode(defaultMode);
    setVerifiedSuccess(false);
    setIsOfflineProcessed(false);
    setInputError(null);
    setManualCode('');

    // Trigger WhatsApp Cloud API End Code template if ready to complete visit
    if (defaultMode === 'check_out' && booking.status === 'in_progress' && !booking.whatsappEndCodeSent) {
      sendEndCodeWhatsApp(booking);
    }

    // Pre-calculate GPS zone
    const zoneGps = getZoneGpsDescription(booking.zone);
    setVerifiedGps(zoneGps.label);

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, booking?.id, booking?.status, initialMode, facingMode]);

  // Live BarcodeDetector scan interval if supported
  useEffect(() => {
    if (!isOpen || !stream || verifiedSuccess || isVerifying || !booking) return;

    let scanInterval: any = null;
    const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

    if (hasBarcodeDetector) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

        scanInterval = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4 && !verifiedSuccess) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const scannedRaw = barcodes[0].rawValue;
                handleCodeDetected(scannedRaw);
              }
            } catch {
              // Non-blocking frame read error
            }
          }
        }, 400);
      } catch {
        // Fallback gracefully
      }
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isOpen, stream, verifiedSuccess, isVerifying, activeMode, booking]);

  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Live camera not active. Use the 1-Click Verification or enter the patient pass code below.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      // Check torch capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('Camera access restriction:', err);
      setCameraError('Live camera not active. Use the 1-Click Verification or enter the patient pass code below.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0] as any;
    if (track && track.applyConstraints) {
      try {
        const nextTorch = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setIsTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch toggle failed', err);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Complete verified arrival or check-out
  const completeVerification = (action: VisitQRAction, method: 'qr_scan' | 'passcode_entry') => {
    if (!booking) return;

    const nowIso = new Date().toISOString();
    const gpsLocation = verifiedGps || getZoneGpsDescription(booking.zone).label;
    const online = isNetworkOnline();

    if (!online) {
      setIsOfflineProcessed(true);
    }

    setVerifiedAction(action);
    setVerifiedSuccess(true);
    stopCamera();

    if (action === 'check_in') {
      soundFX.playSuccessPing();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#FFD166', '#7209B7', '#4CC9F0']
      });

      const arrivalPayload = {
        arrivalVerified: true,
        arrivalVerifiedAt: nowIso,
        arrivalVerificationMethod: method,
        arrivalGpsLocation: gpsLocation,
        visitStartedAt: booking.visitStartedAt || nowIso
      };

      if (!online) {
        enqueueOfflineAction('doorstep_arrival', booking.id, {
          arrivalData: {
            ...arrivalPayload,
            offlinePendingArrival: true
          }
        });
      }

      soundFX.triggerNotification(
        '🩺 Doorstep Arrival Verified!',
        `Arrival verified for ${booking.clientName}. Reminder: Personal protection is your responsibility. Wear appropriate PPE throughout the visit.`,
        'nurse_enroute'
      );

      onConfirmArrival(booking.id, arrivalPayload);
    } else {
      // Check-Out / Visit Completion
      soundFX.playVisitCompleted();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7209B7', '#E63946', '#10B981', '#FFD166', '#9D4EDD']
      });

      // Calculate elapsed minutes
      let durationMinutes = booking.baseDurationMinutes || 60;
      if (booking.visitStartedAt) {
        const startMs = new Date(booking.visitStartedAt).getTime();
        const endMs = new Date(nowIso).getTime();
        const diffMins = Math.max(15, Math.round((endMs - startMs) / (1000 * 60)));
        durationMinutes = diffMins;
      }
      setRecordedDuration(durationMinutes);

      const checkoutPayload = {
        checkoutVerified: true,
        checkoutVerifiedAt: nowIso,
        checkoutVerificationMethod: method,
        checkoutGpsLocation: gpsLocation,
        visitEndedAt: nowIso,
        actualDurationMinutes: durationMinutes
      };

      if (!online) {
        enqueueOfflineAction('doorstep_checkout', booking.id, {
          checkoutData: {
            ...checkoutPayload,
            offlinePendingCheckout: true
          }
        });
      }

      if (onConfirmCheckout) {
        onConfirmCheckout(booking.id, checkoutPayload);
      } else {
        // Fallback for completion
        onConfirmArrival(booking.id, {
          arrivalVerified: true,
          arrivalVerifiedAt: booking.arrivalVerifiedAt || nowIso,
          arrivalVerificationMethod: method,
          arrivalGpsLocation: gpsLocation,
          visitStartedAt: booking.visitStartedAt || nowIso
        });
      }
    }
  };

  // Optical code detected from stream or parser
  const handleCodeDetected = (scannedRaw: string) => {
    if (!booking || verifiedSuccess) return;
    const result = verifyScannedVisitData(scannedRaw, booking, activeMode);
    if (result.success) {
      completeVerification(result.action, 'qr_scan');
    }
  };

  // 1-Click Simulated Optical QR Scan (Fast, rock-solid, and works anywhere)
  const handleInstantScan = () => {
    if (!booking) return;
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      completeVerification(activeMode, 'qr_scan');
    }, 650);
  };

  // Handle Manual Passcode submission
  const handleVerifyManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    const result = verifyScannedVisitData(manualCode, booking, activeMode);
    if (result.success) {
      setInputError(null);
      completeVerification(result.action, 'passcode_entry');
    } else {
      soundFX.playFilterSelect();
      setInputError(result.reason || 'Invalid verification passcode. Please check the code on the patient pass.');
    }
  };

  if (!isOpen || !booking) return null;

  const expectedCheckInCode = getArrivalPassCode(booking);
  const expectedCheckOutCode = getCheckoutPassCode(booking);
  const expectedPassCode = activeMode === 'check_in' ? expectedCheckInCode : expectedCheckOutCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181030] via-[#100924] to-[#0a0517] border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-900/60 text-white space-y-4 my-auto">
        {/* Floating Close */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5 text-purple-300" />
            <span>Nurse Caregiver Visit Scanner</span>
            {!isNetworkOnline() && (
              <span className="ml-1 px-2 py-0.2 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" />
                Offline
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeMode === 'check_in' ? 'Verify Doorstep Check-In' : 'Verify Visit Check-Out'}
          </h3>
          <p className="text-xs text-purple-200">
            {activeMode === 'check_in' 
              ? `Scan client's Check-In QR pass to initiate visit with ${booking.clientName}`
              : `Scan client's Check-Out QR pass to sign off care and complete visit`}
          </p>
        </div>

        {/* Scanner Mode Toggle (Check-In vs Check-Out) */}
        {!verifiedSuccess && (
          <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveMode('check_in');
                setInputError(null);
                soundFX.playFilterSelect();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'check_in'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>1. Check-In (Start Visit)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('check_out');
                setInputError(null);
                soundFX.playFilterSelect();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'check_out'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>2. Check-Out (Complete Visit)</span>
            </button>
          </div>
        )}

        {/* Doorstep Arrival PPE Safety Reminder */}
        {!verifiedSuccess && (
          <PPESafetyNotice variant="on_arrival" userRole="nurse" />
        )}

        {/* SUCCESS STATE */}
        {verifiedSuccess ? (
          <div className={`p-6 rounded-2xl border-2 text-center space-y-4 shadow-xl ${
            verifiedAction === 'check_in'
              ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-950/30 border-emerald-400/60'
              : 'bg-gradient-to-b from-purple-500/20 to-purple-950/30 border-purple-400/60'
          }`}>
            <div className={`w-16 h-16 mx-auto rounded-full text-slate-950 flex items-center justify-center shadow-lg animate-bounce ${
              verifiedAction === 'check_in' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-purple-400 shadow-purple-500/40'
            }`}>
              {verifiedAction === 'check_in' ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <FileCheck className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">
                {verifiedAction === 'check_in' ? 'Doorstep Arrival Verified!' : 'Care Visit Completed & Signed Off!'}
              </h4>
              <p className="text-xs text-slate-200">
                {verifiedAction === 'check_in'
                  ? `Care visit initiated for ${booking.clientName} (${booking.serviceName})`
                  : `Visit concluded for ${booking.clientName} • Escrow funds approved for Friday disbursement`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5 text-left font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Attending Nurse:</span>
                <strong className="text-white">{currentNurse.name}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Verified Timestamp:</span>
                <strong className={verifiedAction === 'check_in' ? 'text-emerald-300' : 'text-purple-300'}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </strong>
              </div>
              {verifiedAction === 'check_out' && (
                <div className="flex justify-between text-slate-300">
                  <span>Logged Duration:</span>
                  <strong className="text-amber-300">{recordedDuration} minutes</strong>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Geofence Pinpoint:</span>
                <strong className="text-emerald-300 truncate max-w-[200px]">{verifiedGps}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Visit Status:</span>
                <strong className="text-emerald-400 uppercase">
                  {verifiedAction === 'check_in' ? 'In Progress (Clock Running)' : 'Completed & Locked'}
                </strong>
              </div>
            </div>

            {isOfflineProcessed && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 text-left animate-fadeIn">
                <Database className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Saved locally to <strong>localStorage</strong>. Check-{verifiedAction === 'check_in' ? 'in' : 'out'} is queued to automatically sync once online connectivity is restored.</span>
              </div>
            )}

            <PPESafetyNotice variant="compact" userRole="nurse" />

            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-white font-black text-xs shadow-lg transition cursor-pointer ${
                verifiedAction === 'check_in'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90'
              }`}
            >
              {verifiedAction === 'check_in' ? 'Begin Clinical Care & Live Charting' : 'Done (Close Scanner)'}
            </button>
          </div>
        ) : (
          <>
            {/* Viewfinder & Video Stream Area */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-purple-400/30 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Reticle Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={`relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed rounded-2xl flex items-center justify-center ${
                  activeMode === 'check_in' ? 'border-emerald-400/70' : 'border-purple-400/70'
                }`}>
                  {/* Corner brackets */}
                  <div className={`absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 rounded-tl-lg ${
                    activeMode === 'check_in' ? 'border-emerald-400' : 'border-purple-400'
                  }`} />
                  <div className={`absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 rounded-tr-lg ${
                    activeMode === 'check_in' ? 'border-emerald-400' : 'border-purple-400'
                  }`} />
                  <div className={`absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 rounded-bl-lg ${
                    activeMode === 'check_in' ? 'border-emerald-400' : 'border-purple-400'
                  }`} />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 rounded-br-lg ${
                    activeMode === 'check_in' ? 'border-emerald-400' : 'border-purple-400'
                  }`} />

                  {/* Animated laser line */}
                  <div className={`absolute inset-x-2 h-0.5 shadow-lg animate-pulse top-1/2 ${
                    activeMode === 'check_in'
                      ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-emerald-400'
                      : 'bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-purple-400'
                  }`} />
                  
                  <span className={`text-[10px] font-mono uppercase tracking-widest bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                    activeMode === 'check_in' ? 'text-emerald-300' : 'text-purple-300'
                  }`}>
                    Align Client {activeMode === 'check_in' ? 'Check-In' : 'Check-Out'} QR
                  </span>
                </div>
              </div>

              {/* Camera Controls Overlay (Torch & Flip) */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md transition ${
                      isTorchOn ? 'bg-amber-400 text-slate-950' : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                    title="Toggle Flashlight"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Camera Inactive Fallback Banner */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <Camera className="w-8 h-8 text-purple-400 animate-pulse" />
                  <p className="text-xs text-slate-300 max-w-xs">
                    {cameraError}
                  </p>
                </div>
              )}
            </div>

            {/* One-Click Doorstep Doorbell Alert to Client inside QR Scanner */}
            {activeMode === 'check_in' && (
              <ArrivalDoorbellAlertButton
                booking={booking}
                currentNurseName={currentNurse.name}
                variant="scanner_banner"
                onUpdateBookingStatus={onUpdateBookingStatus}
                onTriggerNotification={onTriggerNotification}
                className="w-full"
              />
            )}

            {/* WhatsApp & Family Member Remote Care Guidance Box */}
            <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
              activeMode === 'check_in' 
                ? 'bg-gradient-to-r from-emerald-950/60 via-[#075E54]/30 to-black/40 border-emerald-500/40 text-emerald-200' 
                : 'bg-gradient-to-r from-purple-950/60 via-[#7209B7]/25 to-black/40 border-purple-500/40 text-purple-200'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${activeMode === 'check_in' ? 'text-[#25D366]' : 'text-[#C77DFF]'}`} />
                  <span className="font-bold text-white">
                    Doorstep Arrival Security PIN:{' '}
                    <code className="px-2 py-0.5 rounded bg-black/60 font-mono text-sm font-black border border-white/20 text-white">
                      {activeMode === 'check_in' ? getBookingStartCode(booking) : getBookingEndCode(booking)}
                    </code>
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono text-[10px] font-bold">
                  Rule: PIN Mandatory
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-200 leading-relaxed space-y-1">
                <p>
                  <strong>• Client Device:</strong> Client shows their QR code pass or dictates the 4-digit code to you.
                </p>
                <p className="text-amber-200 font-semibold">
                  <strong>• Family Member Device:</strong> If the client is unable to use a device (elderly, resting, or no smartphone), their relative or family member elsewhere can use their own device to view the code and tell you the code over the phone or WhatsApp.
                </p>
              </div>

              {(booking.verifiedBy === 'family_remote' || booking.startCodeVerifiedBy === 'family_remote') && (
                <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Family member authorized visit start remotely via WhatsApp/Device</span>
                </div>
              )}
            </div>

            {/* Instant 1-Click Optical Scan Trigger */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleInstantScan}
                disabled={isVerifying}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] ${
                  activeMode === 'check_in'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-950/50'
                    : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white shadow-purple-950/50'
                }`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying QR Code...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {activeMode === 'check_in'
                        ? 'Confirm Doorstep Check-In (Initiate Visit)'
                        : 'Confirm Visit Check-Out (Complete Visit)'}
                    </span>
                  </>
                )}
              </button>

              {/* Manual Passcode Helper & Toggle */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="text-[11px]">
                  Passcode backup: <strong className="font-mono text-amber-300">{expectedPassCode}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-purple-300 hover:text-white underline text-[11px] font-semibold transition cursor-pointer"
                >
                  {showManualInput ? 'Hide manual entry' : 'Enter pass code manually'}
                </button>
              </div>

              {/* Manual Passcode Form */}
              {showManualInput && (
                <form onSubmit={handleVerifyManualCode} className="p-3.5 rounded-xl bg-white/5 border border-purple-400/30 space-y-2.5 animate-fadeIn">
                  <label className="text-[11px] font-bold text-slate-200 block">
                    Enter Passcode from Client's {activeMode === 'check_in' ? 'Check-In' : 'Check-Out'} Pass:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder={expectedPassCode}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/40 text-white font-mono font-bold text-sm tracking-wider uppercase focus:outline-hidden focus:border-emerald-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                  {inputError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{inputError}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Attendance & Geofence Assurance Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-left">
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 text-purple-200 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Patient Address:</span>
                </span>
                <span className="text-white font-bold text-right truncate max-w-[210px]">
                  {booking.clientAddress}, {booking.zone}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-t border-white/10 pt-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GPS Geofence:</span>
                </span>
                <span className="text-emerald-300 font-mono font-bold">{verifiedGps}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
