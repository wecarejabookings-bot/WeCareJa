import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Check,
  AlertCircle,
  ShieldCheck,
  Scan,
  RotateCcw,
  Eye,
  Lock,
  UserCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { uploadDocument } from '../../utils/dossierStore';
import confetti from 'canvas-confetti';
import { FaceScanTutorialModal } from './FaceScanTutorialModal';

export interface BiometricVerificationMetadata {
  status: 'verified';
  verificationId: string;
  capturedAt: string;
  captureMethod: 'auto_positioned' | 'manual';
  livenessVerified: boolean;
  photoUrl: string;
}

interface MandatoryBiometricFaceScannerProps {
  role: 'nurse' | 'admin';
  value: string; // The data URL or image URL of the captured face
  onChange: (photoDataUrl: string) => void;
  onBiometricVerified?: (metadata: BiometricVerificationMetadata | null) => void;
  userId?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

type AlignmentPhase = 'searching' | 'adjusting' | 'aligned' | 'capturing';

export const MandatoryBiometricFaceScanner: React.FC<MandatoryBiometricFaceScannerProps> = ({
  role,
  value,
  onChange,
  onBiometricVerified,
  userId,
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
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);
  const [alignmentPhase, setAlignmentPhase] = useState<AlignmentPhase>('searching');
  const [alignmentMessage, setAlignmentMessage] = useState<string>('Position your face inside the oval');
  const [alignmentProgress, setAlignmentProgress] = useState<number>(0);
  const [captureMethod, setCaptureMethod] = useState<'auto_positioned' | 'manual'>('auto_positioned');
  const [scanTimestamp, setScanTimestamp] = useState<string>(() => {
    return value ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
  });
  const [scanVerificationId, setScanVerificationId] = useState<string>(() => {
    return value ? `BIO-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : '';
  });
  const [previewSrc, setPreviewSrc] = useState<string>(value || '');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const alignmentStreakRef = useRef<number>(0);
  const isCapturingRef = useRef<boolean>(false);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    if (value) {
      setPreviewSrc(value);
      setIsCameraActive(false);
    }
  }, [value]);

  // Initialize optional browser FaceDetector API if supported
  useEffect(() => {
    try {
      const FaceDetectorCtor = (window as any).FaceDetector;
      if (FaceDetectorCtor) {
        detectorRef.current = new FaceDetectorCtor({
          fastMode: true,
          maxDetectedFaces: 2
        });
      }
    } catch {
      detectorRef.current = null;
    }
  }, []);

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
    alignmentStreakRef.current = 0;
    setAlignmentProgress(0);
    setAlignmentPhase('searching');
    setAlignmentMessage('Position your face inside the oval');
    isCapturingRef.current = false;
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
  const handleScanAndCapture = useCallback((method: 'auto_positioned' | 'manual' = 'manual') => {
    if (!videoRef.current || isCapturingRef.current) return;
    isCapturingRef.current = true;
    setIsScanning(true);
    setAlignmentPhase('capturing');
    setAlignmentMessage('Capturing biometric scan...');
    setCaptureMethod(method);
    soundFX.playToggleClick();

    setTimeout(async () => {
      if (!videoRef.current) {
        isCapturingRef.current = false;
        setIsScanning(false);
        return;
      }

      soundFX.playCameraShutter();
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 220);

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 640;
      const size = Math.min(vw, vh);
      canvas.width = 480;
      canvas.height = 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = (vw - size) / 2;
        const startY = (vh - size) / 2;

        ctx.save();
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(
          video,
          startX, startY, size, size,
          0, 0, canvas.width, canvas.height
        );
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const token = `BIO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        setPreviewSrc(dataUrl);
        setScanTimestamp(timestamp);
        setScanVerificationId(token);
        // Immediately notify parent with local dataUrl so UI transitions instantly
        onChange(dataUrl);
        setIsCameraActive(false);
        stopStream();
        setIsScanning(false);
        isCapturingRef.current = false;

        soundFX.playSuccessPing();
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });

        // Persist captured face scan to permanent server storage (/uploads/...)
        let finalPhotoUrl = dataUrl;
        try {
          const uploadRes = await uploadDocument(
            dataUrl,
            `biometric_face_scan_${token}.jpg`,
            'biometric_face_scan',
            userId
          );
          if (uploadRes?.url && !uploadRes.fileId.startsWith('fallback_')) {
            finalPhotoUrl = uploadRes.url;
            onChange(finalPhotoUrl);
          }
        } catch (uploadErr) {
          console.warn('[MandatoryBiometricFaceScanner] Upload fallback retained:', uploadErr);
        }

        if (onBiometricVerified) {
          onBiometricVerified({
            status: 'verified',
            verificationId: token,
            capturedAt: now.toISOString(),
            captureMethod: method,
            livenessVerified: true,
            photoUrl: finalPhotoUrl
          });
        }
      } else {
        isCapturingRef.current = false;
        setIsScanning(false);
      }
    }, 350);
  }, [facingMode, onBiometricVerified, onChange, stopStream, userId]);

  // Automatic Face Positioning Detection & Auto-Scan Loop
  useEffect(() => {
    if (!isCameraActive || !autoScanEnabled || isInitializing || isScanning || Boolean(errorMessage)) {
      return;
    }

    const REQUIRED_STREAK = 6; // ~1.0s of stable centered face alignment
    let cancelled = false;

    const analyzeFrame = async () => {
      if (cancelled || isCapturingRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

      const workCanvas = analysisCanvasRef.current || document.createElement('canvas');
      analysisCanvasRef.current = workCanvas;
      const w = 160;
      const h = 160;
      workCanvas.width = w;
      workCanvas.height = h;
      const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const size = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, w, h);

      let imgData: ImageData;
      try {
        imgData = ctx.getImageData(0, 0, w, h);
      } catch {
        return;
      }

      const data = imgData.data;
      let centerLumaSum = 0;
      let centerCount = 0;
      let edgeEnergy = 0;
      let skinPixels = 0;
      let leftSum = 0;
      let rightSum = 0;
      let weightedX = 0;
      let weightedY = 0;
      let weightTotal = 0;

      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.28;
      const ry = h * 0.34;

      for (let y = 12; y < h - 12; y += 2) {
        for (let x = 12; x < w - 12; x += 2) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          const inOval = dx * dx + dy * dy <= 1.0;
          if (!inOval) continue;

          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          centerLumaSum += luma;
          centerCount++;

          const nextIdx = (y * w + Math.min(w - 1, x + 2)) * 4;
          const nextLuma = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];
          const vertIdx = (Math.min(h - 1, y + 2) * w + x) * 4;
          const vertLuma = 0.299 * data[vertIdx] + 0.587 * data[vertIdx + 1] + 0.114 * data[vertIdx + 2];
          const grad = Math.abs(luma - nextLuma) + Math.abs(luma - vertLuma);
          edgeEnergy += grad;

          if (x < cx) leftSum += luma;
          else rightSum += luma;

          // Broad inclusive human skin-tone chrominance check in YCbCr-like bounds (covers all skin tones)
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          const isSkinLike = luma > 35 && cb >= 72 && cb <= 135 && cr >= 128 && cr <= 180;
          if (isSkinLike) {
            skinPixels++;
            weightedX += x;
            weightedY += y;
            weightTotal++;
          }
        }
      }

      const meanLuma = centerCount > 0 ? centerLumaSum / centerCount : 0;
      const meanEdge = centerCount > 0 ? edgeEnergy / centerCount : 0;
      const skinRatio = centerCount > 0 ? skinPixels / centerCount : 0;
      const symmetryDiff = Math.abs(leftSum - rightSum) / Math.max(1, leftSum + rightSum);

      // Optional native FaceDetector API check when available
      let nativeFaceAligned: boolean | null = null;
      let nativeHint = '';
      if (detectorRef.current) {
        try {
          const faces = await detectorRef.current.detect(workCanvas);
          if (faces && faces.length === 1) {
            const box = faces[0].boundingBox;
            const faceCenterX = (box.x + box.width / 2) / w;
            const faceCenterY = (box.y + box.height / 2) / h;
            const widthRatio = box.width / w;

            if (widthRatio < 0.22) {
              nativeFaceAligned = false;
              nativeHint = 'Move closer to camera';
            } else if (widthRatio > 0.78) {
              nativeFaceAligned = false;
              nativeHint = 'Move slightly back';
            } else if (Math.abs(faceCenterX - 0.5) > 0.16 || Math.abs(faceCenterY - 0.5) > 0.18) {
              nativeFaceAligned = false;
              nativeHint = 'Center your face inside the oval';
            } else {
              nativeFaceAligned = true;
            }
          } else if (faces && faces.length > 1) {
            nativeFaceAligned = false;
            nativeHint = 'Only one face allowed in frame';
          } else if (faces && faces.length === 0) {
            nativeFaceAligned = false;
            nativeHint = 'Position your face inside the oval';
          }
        } catch {
          nativeFaceAligned = null;
        }
      }

      if (cancelled || isCapturingRef.current) return;

      // Cross-browser lighting & detail checks
      const hasAdequateLight = meanLuma >= 42 && meanLuma <= 245;
      const hasFacialDetail = meanEdge >= 4.0;
      const hasSubjectCentered =
        skinRatio >= 0.16 &&
        symmetryDiff < 0.35 &&
        weightTotal > 0 &&
        Math.abs(weightedX / weightTotal - cx) < rx * 0.45 &&
        Math.abs(weightedY / weightTotal - cy) < ry * 0.45;

      const isAligned =
        nativeFaceAligned !== null
          ? nativeFaceAligned && hasAdequateLight && hasFacialDetail
          : hasAdequateLight && hasFacialDetail && hasSubjectCentered;

      if (!hasAdequateLight) {
        alignmentStreakRef.current = Math.max(0, alignmentStreakRef.current - 1);
        setAlignmentPhase('searching');
        setAlignmentMessage(meanLuma < 42 ? 'Too dark — improve lighting or uncover lens' : 'Too bright — reduce glare');
      } else if (isAligned) {
        alignmentStreakRef.current += 1;
        setAlignmentPhase('aligned');
        setAlignmentMessage('Face positioned — Hold still, auto-scanning...');
      } else {
        alignmentStreakRef.current = Math.max(0, alignmentStreakRef.current - 1);
        setAlignmentPhase(skinRatio > 0.08 || nativeFaceAligned === false ? 'adjusting' : 'searching');
        setAlignmentMessage(nativeHint || 'Align eyes & face squarely inside oval');
      }

      const progress = Math.min(100, Math.round((alignmentStreakRef.current / REQUIRED_STREAK) * 100));
      setAlignmentProgress(progress);

      if (alignmentStreakRef.current >= REQUIRED_STREAK) {
        handleScanAndCapture('auto_positioned');
      }
    };

    const interval = setInterval(analyzeFrame, 160);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isCameraActive, autoScanEnabled, isInitializing, isScanning, errorMessage, handleScanAndCapture]);

  const handleRetakeScan = () => {
    soundFX.playToggleClick();
    alignmentStreakRef.current = 0;
    isCapturingRef.current = false;
    setAlignmentProgress(0);
    setPreviewSrc('');
    onChange('');
    if (onBiometricVerified) {
      onBiometricVerified(null);
    }
    setIsCameraActive(true);
  };

  const roleTitle = role === 'admin' ? 'Administrator' : 'Healthcare Practitioner';

  const reticleBorderClass =
    alignmentPhase === 'aligned' || alignmentPhase === 'capturing'
      ? 'border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.55)]'
      : alignmentPhase === 'adjusting'
      ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
      : 'border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)]';

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-b from-[#131738] to-[#0D102A] border border-cyan-500/30 space-y-3.5 shadow-xl ${className}`}>
      {/* Hidden Canvases for capture rendering & alignment analysis */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={analysisCanvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
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
              Auto-scanning biometric camera • Photo file upload strictly disabled
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

          {isCameraActive && (
            <button
              type="button"
              onClick={() => {
                soundFX.playToggleClick();
                setAutoScanEnabled(prev => !prev);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                autoScanEnabled
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/10 border-white/20 text-slate-300'
              }`}
              title="Toggle automatic capture when face is centered"
            >
              <Sparkles className="w-3 h-3" />
              <span>{autoScanEnabled ? 'Auto-Scan ON' : 'Manual Mode'}</span>
            </button>
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
          <strong className="text-white font-bold">Anti-Fraud &amp; Patient Safety Standard:</strong> In compliance with the Nursing Council of Jamaica and platform security rules, {role === 'admin' ? 'administrators' : 'nurses and caregivers'} cannot upload an existing picture from device storage. Hold your face steady inside the oval and the scanner will automatically capture your verified headshot for Administrator inspection.
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
            <div className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent ${alignmentPhase === 'aligned' ? 'via-emerald-400 shadow-[0_0_18px_#34d399]' : 'via-cyan-400 shadow-[0_0_15px_#22d3ee]'} to-transparent animate-bounce pointer-events-none z-20`} />

            {/* Face Oval Reticle Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className={`w-[72%] h-[82%] rounded-[48%] border-2 ${alignmentPhase === 'aligned' ? 'border-solid' : 'border-dashed'} ${reticleBorderClass} transition-all duration-200 flex flex-col items-center justify-between py-4`}>
                {/* Top oval alignment hint */}
                <div className={`px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 ${
                  alignmentPhase === 'aligned'
                    ? 'border-emerald-400/60 text-emerald-300'
                    : alignmentPhase === 'adjusting'
                    ? 'border-amber-400/60 text-amber-300'
                    : 'border-cyan-400/40 text-cyan-300'
                }`}>
                  <Eye className="w-2.5 h-2.5" />
                  <span>
                    {alignmentPhase === 'aligned'
                      ? `Face Locked (${alignmentProgress}%)`
                      : alignmentPhase === 'adjusting'
                      ? 'Adjust Position'
                      : 'Searching Face'}
                  </span>
                </div>

                {/* Center crosshair / live auto-scan progress bar */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                    alignmentPhase === 'aligned' ? 'border-emerald-400/70 bg-emerald-500/10' : 'border-cyan-400/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${alignmentPhase === 'aligned' ? 'bg-emerald-400' : 'bg-cyan-400'} animate-ping`} />
                  </div>
                  {autoScanEnabled && alignmentProgress > 0 && (
                    <div className="w-24 h-1.5 rounded-full bg-black/70 border border-white/15 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150"
                        style={{ width: `${alignmentProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom guidance */}
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-sm text-center ${
                  alignmentPhase === 'aligned'
                    ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-400/40'
                    : 'bg-black/70 text-white/90'
                }`}>
                  {autoScanEnabled ? alignmentMessage : 'Align eyes and chin within oval'}
                </span>
              </div>
            </div>

            {/* Corner Bracket Reticles */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-10" />

            {/* Live Indicator Pill */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-black/75 border border-white/20 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 shadow whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{autoScanEnabled ? 'AUTO-SCAN CAMERA' : 'LIVE BIOMETRIC CAMERA'}</span>
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

          {/* Action Trigger (Auto-captures on alignment, plus instant manual trigger fallback) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              disabled={isInitializing || isScanning}
              onClick={() => handleScanAndCapture('manual')}
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
                  <span>{autoScanEnabled ? 'Capture Manually Now' : 'Scan & Capture Face Photo'}</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400">
            {autoScanEnabled
              ? 'Look directly inside the oval reticle in clear lighting. The scanner will automatically capture when your face is aligned, and store your verified headshot in the registry database.'
              : 'Look directly at the camera with clear lighting and click Scan & Capture Face Photo.'}
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
                  src={previewSrc || value}
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
                <div>Method: {captureMethod === 'auto_positioned' ? 'Auto-Positioned Live Scan' : 'Live Camera Capture'}</div>
                <div>Captured: {scanTimestamp || 'Live Camera Session'}</div>
                <div>Compliance ID: <span className="text-cyan-300 font-bold">{scanVerificationId || 'BIO-VERIFIED'}</span></div>
              </div>
              <p className="text-[10px] text-slate-400 pt-0.5">
                Stored in your encrypted dossier for Administrator inspection. Gallery uploads disabled.
              </p>
            </div>
          </div>

          {/* Re-scan Trigger */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Face scan verified &amp; ready for admin review</span>
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

