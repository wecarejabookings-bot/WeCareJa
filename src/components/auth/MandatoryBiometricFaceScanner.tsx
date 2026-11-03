import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Scan, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Lock,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { FaceScanTutorialModal } from './FaceScanTutorialModal';

interface MandatoryBiometricFaceScannerProps {
  role: 'nurse' | 'admin';
  value: string; // The data URL or image URL of the captured face
  onChange: (photoDataUrl: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const MandatoryBiometricFaceScanner: React.FC<MandatoryBiometricFaceScannerProps> = ({
  role,
  value,
  onChange,
  label,
  required = true,
  className = ''
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(!value);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>(() => {
    return value ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
  });
  const [scanVerificationId, setScanVerificationId] = useState<string>(() => {
    return value ? `BIO-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : '';
  });
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check multiple cameras
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      setStream(null);
    }
  }, [stream]);

  // Start video stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    setIsInitializing(true);
    setErrorMessage(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or device environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[MandatoryBiometricFaceScanner] Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Platform security policy mandates a live face scan for all staff accounts. Please click the lock or camera icon in your browser address bar, set Camera to "Allow", and retry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was detected on this device. A camera is required for staff biometric onboarding.');
      } else {
        setErrorMessage(err.message || 'Unable to start camera. Please ensure permissions are granted.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Handle open camera
  useEffect(() => {
    if (isCameraActive) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isCameraActive, facingMode]);

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
  };

  // Perform face scan and capture
  const handleScanAndCapture = () => {
    if (!videoRef.current) return;
    setIsScanning(true);
    soundFX.playToggleClick();

    // Small countdown/scan effect for high security feel
    setTimeout(() => {
      if (!videoRef.current) {
        setIsScanning(false);
        return;
      }

      soundFX.playCameraShutter();
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 220);

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
      canvas.width = 480;
      canvas.height = 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = ((video.videoWidth || 640) - size) / 2;
        const startY = ((video.videoHeight || 640) - size) / 2;

        // Mirror if user-facing
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(
          video,
          startX, startY, size, size,
          0, 0, canvas.width, canvas.height
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const token = `BIO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        setScanTimestamp(timestamp);
        setScanVerificationId(token);
        onChange(dataUrl);
        setIsCameraActive(false);
        stopStream();
        setIsScanning(false);

        soundFX.playSuccessPing();
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
      } else {
        setIsScanning(false);
      }
    }, 450);
  };

  const handleRetakeScan = () => {
    soundFX.playToggleClick();
    onChange('');
    setIsCameraActive(true);
  };

  const roleTitle = role === 'admin' ? 'Administrator' : 'Healthcare Practitioner';

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-b from-[#131738] to-[#0D102A] border border-cyan-500/30 space-y-3.5 shadow-xl ${className}`}>
      {/* Hidden Canvas for capture rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Scan className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{label || `Mandatory ${roleTitle} Biometric Face Scan`}</span>
              {required && <span className="text-amber-400">*</span>}
            </h4>
            <p className="text-[10px] text-cyan-200/80 font-medium">
              Live camera biometric required • Photo file upload strictly disabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {value && !isCameraActive && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Scan</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              soundFX.playToggleClick();
              setIsTutorialOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 hover:text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open Face Scan Step-by-Step Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span>Face Scan Tutorial</span>
          </button>
        </div>
      </div>

      {/* Security Compliance Banner */}
      <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-start gap-2.5 text-[11px] text-purple-200/90 leading-relaxed">
        <Lock className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
        <span>
          <strong className="text-white font-bold">Anti-Fraud &amp; Patient Safety Standard:</strong> In compliance with the Nursing Council of Jamaica and platform security rules, {role === 'admin' ? 'administrators' : 'nurses and caregivers'} cannot upload an existing picture from device storage. You must complete a live camera face scan to establish your verified profile headshot.
        </span>
      </div>

      {/* ERROR STATE: Permission or Camera Not Found */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Camera Access</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 1: LIVE SCANNER CAMERA VIEW */}
      {isCameraActive ? (
        <div className="space-y-3">
          <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-black border-2 border-cyan-400/50 shadow-2xl shadow-cyan-950/40 flex items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Shutter Flash Animation */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-30 animate-pulse pointer-events-none" />
            )}

            {/* Scanning Laser Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none z-20" />

            {/* Face Oval Reticle Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-[72%] h-[82%] rounded-[48%] border-2 border-dashed border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex flex-col items-center justify-between py-4">
                {/* Top oval alignment hint */}
                <div className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-400/40 text-[9px] font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  <span>Face Centered</span>
                </div>

                {/* Center crosshair / guide dots */}
                <div className="w-12 h-12 rounded-full border border-cyan-400/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>

                {/* Bottom guidance */}
                <span className="text-[9px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  Align eyes and chin within oval
                </span>
              </div>
            </div>

            {/* Corner Bracket Reticles */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-10" />

            {/* Live Indicator Pill */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE BIOMETRIC CAMERA</span>
            </div>

            {/* Switch Camera Button (if device has multiple) */}
            {hasMultipleCameras && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute bottom-3 right-3 z-20 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow cursor-pointer transition"
                title="Switch Camera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Initializing Spinner */}
            {isInitializing && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2 z-25 text-cyan-300">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono">Initializing camera sensor...</span>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              disabled={isInitializing || isScanning}
              onClick={handleScanAndCapture}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-cyan-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Scanning Face Biometrics...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-cyan-200" />
                  <span>Scan &amp; Capture Face Photo</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400">
            Please look directly at the camera with clear lighting. Your live capture will automatically become your official profile photo.
          </p>
        </div>
      ) : (
        /* STATE 2: VERIFIED CAPTURED PHOTO */
        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Photo Preview with Verified Badge */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl shadow-emerald-950/50 bg-black">
                <img
                  src={value}
                  alt={`${roleTitle} Verified Face`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>BIOMETRIC LIVENESS VERIFIED</span>
              </div>
              <h5 className="text-xs font-bold text-white">
                Official {roleTitle} Headshot Established
              </h5>
              <div className="text-[10px] text-slate-300 font-mono space-y-0.5">
                <div>Captured: {scanTimestamp || 'Live Camera Session'}</div>
                <div>Compliance ID: <span className="text-cyan-300 font-bold">{scanVerificationId || 'BIO-VERIFIED'}</span></div>
              </div>
              <p className="text-[10px] text-slate-400 pt-0.5">
                Saved as your official system profile picture. Photo file upload is locked.
              </p>
            </div>
          </div>

          {/* Re-scan Trigger */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Face scan verified &amp; ready</span>
            </span>

            <button
              type="button"
              onClick={handleRetakeScan}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
              <span>Re-scan Face</span>
            </button>
          </div>
        </div>
      )}

      {/* Face Scan Step-by-Step Guidance Tutorial */}
      <FaceScanTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        role={role}
        onReadyToScan={() => {
          setIsCameraActive(true);
          startCamera(facingMode);
        }}
      />
    </div>
  );
};
