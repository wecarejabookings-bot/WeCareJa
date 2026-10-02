import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle, Sparkles, SwitchCamera, Upload } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  title = 'Take Profile Picture'
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize camera stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializing(true);
    setErrorMessage(null);
    setCapturedImage(null);

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
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
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please allow camera permissions in your browser or upload an image file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device was detected on your system. You can upload a photo from your files.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera. Please upload an image file instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      // Clean up stream on modal close
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
      setErrorMessage(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    soundFX.playCameraShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    // Square dimensions for profile avatar
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = 480;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const startX = ((video.videoWidth || 640) - size) / 2;
      const startY = ((video.videoHeight || 640) - size) / 2;

      // If front camera, mirror horizontally for natural mirror feel
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        video,
        startX, startY, size, size,
        0, 0, canvas.width, canvas.height
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);

      // Stop camera stream now that we have the capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      soundFX.playSuccessPing();
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultUrl = event.target.result as string;
          setCapturedImage(resultUrl);
          soundFX.playSuccessPing();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c082b] to-[#0d0217] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[11px] text-purple-300 font-medium">Capture or upload your profile picture</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="relative w-72 h-72 rounded-full overflow-hidden bg-black/60 border-4 border-purple-500/40 shadow-inner flex items-center justify-center">
            {/* Camera Shutter Flash Effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90" />
            )}

            {/* Circular Target Overlay Guide */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-300/30 pointer-events-none z-10" />

            {/* 1. Live Video Stream */}
            {!capturedImage && !errorMessage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                onLoadedMetadata={() => videoRef.current?.play()}
              />
            )}

            {/* 2. Captured Image Preview */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured profile preview"
                className="w-full h-full object-cover"
              />
            )}

            {/* 3. Loading State */}
            {isInitializing && !capturedImage && !errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-purple-300">
                <RefreshCw className="w-8 h-8 animate-spin text-[#C77DFF]" />
                <span className="text-xs font-semibold">Starting camera...</span>
              </div>
            )}

            {/* 4. Error State */}
            {errorMessage && !capturedImage && (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 leading-tight">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Hidden Canvas & File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Helper instructions */}
          <p className="text-[11px] text-slate-400 text-center mt-3 max-w-xs">
            {capturedImage
              ? 'Review your photo. Click "Use Photo" or retake if you want another shot.'
              : 'Center your face within the circle in good lighting.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              {/* File upload fallback button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                title="Upload image from computer/phone files"
              >
                <Upload className="w-4 h-4 text-purple-300" />
                <span className="hidden sm:inline">Upload File</span>
              </button>

              {/* Center capture button */}
              <div className="flex items-center gap-2 mx-auto">
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isInitializing || Boolean(errorMessage)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-950/60 transition flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>

              {/* Switch camera button if multiple exist */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition"
                  title="Switch Front/Back Camera"
                >
                  <SwitchCamera className="w-4 h-4 text-purple-300" />
                </button>
              )}
            </>
          ) : (
            <>
              {/* Retake */}
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              {/* Confirm & Set as Profile Picture */}
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5 hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Use as Profile Picture</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
