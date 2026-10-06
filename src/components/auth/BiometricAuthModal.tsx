import React, { useState, useEffect } from 'react';
import { UserAccount, BiometricCredentialRecord } from '../../types';
import { 
  getStoredBiometricCredentials, 
  authenticateWithWebAuthn, 
  detectPlatformBiometrics,
  isWebAuthnSupported
} from '../../utils/biometricAuth';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Fingerprint, 
  Scan, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Smartphone, 
  Laptop, 
  Lock, 
  Sparkles, 
  RefreshCw,
  RotateCcw,
  Eye,
  Check
} from 'lucide-react';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAccounts: UserAccount[];
  onAuthenticated: (user: UserAccount) => void;
  onSwitchToPasswordLogin?: () => void;
  preSelectedUserId?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  allAccounts,
  onAuthenticated,
  onSwitchToPasswordLogin,
  preSelectedUserId
}) => {
  const [credentials, setCredentials] = useState<BiometricCredentialRecord[]>([]);
  const [enteredUsername, setEnteredUsername] = useState<string>('');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<number>(0);
  const [isWebAuthnAvailable, setIsWebAuthnAvailable] = useState<boolean>(true);
  const [platformInfo, setPlatformInfo] = useState<{ deviceLabel: string; sensorName: string; biometricType: string }>({
    deviceLabel: 'Device Authenticator',
    sensorName: 'Touch ID / Face ID',
    biometricType: 'fingerprint'
  });

  // Reload registered credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      const creds = getStoredBiometricCredentials();
      setCredentials(creds);

      const plat = detectPlatformBiometrics();
      setPlatformInfo(plat);
      setIsWebAuthnAvailable(isWebAuthnSupported());

      // Pre-fill username if specified by preSelectedUserId
      if (preSelectedUserId) {
        const foundUser = allAccounts.find(u => u.id === preSelectedUserId);
        if (foundUser) {
          setEnteredUsername(foundUser.username);
        }
      }

      setScanState('idle');
      setErrorMessage(null);
      setRetryAttempts(0);
    }
  }, [isOpen, preSelectedUserId, allAccounts]);

  if (!isOpen) return null;

  const handleStartBiometricVerification = async (isRetry: boolean = false) => {
    const rawUsername = enteredUsername.trim().toLowerCase();
    
    if (!rawUsername) {
      setErrorMessage('Please enter your username to authenticate with biometrics.');
      soundFX.playWarningSound();
      return;
    }

    if (isRetry) {
      setRetryAttempts(prev => prev + 1);
    }

    // Find user in system
    const targetUser = allAccounts.find(
      u => u.username.toLowerCase() === rawUsername || u.email?.toLowerCase() === rawUsername
    );

    if (!targetUser) {
      setErrorMessage(`Account "@${enteredUsername.trim()}" not recognized. Please check your username.`);
      soundFX.playWarningSound();
      return;
    }

    if (targetUser.approvalStatus === 'pending_approval') {
      setErrorMessage('Your account is pending administrator approval. Please wait for activation.');
      soundFX.playWarningSound();
      return;
    }

    // Check or find credential saved in Settings
    const targetCredential = credentials.find(
      c => c.userId === targetUser.id || c.username.toLowerCase() === targetUser.username.toLowerCase()
    );

    // Biometric should ONLY work after user saves it in Settings. If not saved, reject.
    const isEnrolled = typeof window !== 'undefined' && localStorage.getItem('weCare_biometricEnrolled') === 'true';
    if (!isEnrolled || !targetCredential) {
      setScanState('error');
      setErrorMessage(
        `Biometric passkey has not been saved in Settings for @${targetUser.username}. Please set up biometric in Settings first.`
      );
      soundFX.playWarningSound();
      return;
    }

    setScanState('scanning');
    setErrorMessage(null);
    soundFX.playToggleClick();

    // Small delay to render high-tech scanner animation
    await new Promise((resolve) => setTimeout(resolve, 750));
    setScanState('verifying');

    try {
      const result = await authenticateWithWebAuthn(targetCredential, allAccounts);

      if (result.success && result.userAccount) {
        setScanState('success');
        // Play dedicated biometric success audio chime & tactile haptic confirmation pattern
        soundFX.playBiometricSuccess();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([45, 55, 95]);
          } catch {}
        }

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Auto close and complete login after success animation
        setTimeout(() => {
          onAuthenticated(result.userAccount!);
          onClose();
        }, 900);
      } else {
        setScanState('error');
        setRetryAttempts(prev => prev + 1);
        setErrorMessage(result.error || 'Biometric verification did not match registered passkey.');
        soundFX.playBiometricRetry();
      }
    } catch (err: any) {
      setScanState('error');
      setRetryAttempts(prev => prev + 1);
      setErrorMessage(err?.message || 'Biometric authentication was canceled or timed out.');
      soundFX.playBiometricRetry();
    }
  };

  const currentBiometricType = platformInfo.biometricType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Scoped Mobile Media Query */}
      <style>{`
        @media (max-width: 640px) {
          .biometric-modal-dialog {
            width: 100% !important;
            max-width: 100% !important;
            padding: 1.25rem 1rem !important;
          }
          .biometric-touch-target {
            min-height: 48px !important;
            min-width: 48px !important;
          }
          .biometric-input {
            width: 100% !important;
            min-height: 48px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
      <div 
        className="biometric-modal-dialog relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c082b] via-[#130320] to-[#0d0117] border border-purple-500/30 p-5 sm:p-7 text-white shadow-2xl shadow-purple-950/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="biometric-touch-target absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] shadow-lg shadow-purple-900/40 border border-white/15 mx-auto">
            {currentBiometricType === 'face_id' ? (
              <Scan className="w-7 h-7 text-white animate-pulse" />
            ) : (
              <Fingerprint className="w-7 h-7 text-white animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
              <span>Biometric Passkey Sign-In</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 font-bold">
                Passkey
              </span>
            </h3>
            <p className="text-xs text-purple-200/80 max-w-xs mx-auto">
              Hardware verification via {platformInfo.sensorName} for clients &amp; registered practitioners.
            </p>
          </div>
        </div>

        {/* Enter Username Form - Users must remember and enter their own account */}
        <div className="space-y-2 mb-5 w-full">
          <label className="text-xs font-bold text-slate-300 block">
            Your Account Username or Email
          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={enteredUsername}
              onChange={(e) => {
                setEnteredUsername(e.target.value);
                setScanState('idle');
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleStartBiometricVerification();
                }
              }}
              placeholder="Enter your username (e.g. sydney)"
              className="biometric-input w-full min-h-[48px] px-3.5 py-3 pr-10 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-base sm:text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <User className="w-5 h-5 text-purple-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[10px] text-slate-400">
            Enter your remembered username to authenticate with your device's biometric sensor.
          </p>
        </div>

        {/* Central Interactive Biometric Scanner */}
        <div className="relative p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
          {/* Animated Scanning Circle */}
          <div className="relative">
            {/* Pulsing Concentric Scan Rings */}
            {scanState === 'scanning' && (
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-purple-500/50 animate-ping pointer-events-none" />
            )}
            {scanState === 'verifying' && (
              <div className="absolute inset-0 -m-3 rounded-full border border-emerald-400/60 animate-spin pointer-events-none" />
            )}

            <button
              type="button"
              onClick={() => handleStartBiometricVerification(scanState === 'error')}
              disabled={scanState === 'scanning' || scanState === 'verifying' || !enteredUsername.trim()}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                scanState === 'scanning'
                  ? 'bg-gradient-to-tr from-purple-600 to-pink-600 scale-105 shadow-purple-500/50'
                  : scanState === 'verifying'
                  ? 'bg-gradient-to-tr from-blue-600 to-emerald-500 animate-pulse scale-105'
                  : scanState === 'success'
                  ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/50'
                  : scanState === 'error'
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/60 ring-2 ring-rose-400/50 hover:scale-105'
                  : 'bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] hover:scale-105 shadow-purple-900/50 text-white'
              }`}
              title={scanState === 'error' ? 'Click to retry biometric verification' : 'Click to authenticate via Fingerprint or Facial Recognition'}
            >
              {scanState === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
              ) : scanState === 'error' ? (
                <div className="flex flex-col items-center justify-center">
                  <RotateCcw className="w-9 h-9 text-white animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white mt-1">Retry</span>
                </div>
              ) : currentBiometricType === 'face_id' ? (
                <Scan className={`w-11 h-11 ${scanState === 'scanning' ? 'animate-spin' : ''}`} />
              ) : (
                <Fingerprint className={`w-11 h-11 ${scanState === 'scanning' ? 'animate-pulse' : ''}`} />
              )}
            </button>
          </div>

          {/* Status Text */}
          <div className="space-y-1 w-full">
            {scanState === 'idle' && (
              <>
                <p className="text-xs font-bold text-white">
                  Tap sensor to verify {currentBiometricType === 'face_id' ? 'Face ID' : 'Fingerprint'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Touch the sensor or look at your camera to sign in
                </p>
              </>
            )}

            {scanState === 'scanning' && (
              <>
                <p className="text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  Scanning Biometric Sensor...
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Listening for hardware authenticator signature
                </p>
              </>
            )}

            {scanState === 'verifying' && (
              <>
                <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  Verifying WebAuthn Cryptographic Assertion...
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Validating public key assertion with platform key
                </p>
              </>
            )}

            {scanState === 'success' && (
              <>
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Biometric Match Verified! Signing in...
                </p>
                <p className="text-[10px] text-slate-300">
                  Authentication confirmed via hardware authenticator
                </p>
              </>
            )}

            {scanState === 'error' && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-rose-200">Biometric Verification Incomplete</span>
                  {retryAttempts > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 font-mono text-[10px] border border-rose-500/40">
                      Attempt {retryAttempts}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-rose-200/90 max-w-xs mx-auto">
                  {errorMessage || 'Verification did not match. Please tap Retry below.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Trigger / Retry Buttons */}
          {scanState !== 'success' && (
            <div className="w-full space-y-2 pt-1">
              {scanState === 'error' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartBiometricVerification(true)}
                    disabled={!enteredUsername.trim()}
                    className="biometric-touch-target w-full py-3.5 px-5 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-xs shadow-lg shadow-rose-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry Biometric Scan {retryAttempts > 0 ? `(Attempt ${retryAttempts + 1})` : ''}</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setScanState('idle');
                        setErrorMessage(null);
                        setEnteredUsername('');
                      }}
                      className="text-xs text-purple-300 hover:text-white underline underline-offset-2 flex items-center gap-1.5 cursor-pointer py-1 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Try Different Username</span>
                    </button>
                  </div>
                </>
              ) : (
                (() => {
                  const isEnrolledFlag = typeof window !== 'undefined' && localStorage.getItem('weCare_biometricEnrolled') === 'true';
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEnrolledFlag) {
                          setScanState('error');
                          setErrorMessage('Please set up biometric in Settings first.');
                          soundFX.playWarningSound();
                          return;
                        }
                        handleStartBiometricVerification(false);
                      }}
                      disabled={scanState === 'scanning' || scanState === 'verifying' || !enteredUsername.trim()}
                      className={`biometric-touch-target w-full py-3.5 px-5 min-h-[48px] rounded-xl font-extrabold text-sm sm:text-xs transition flex items-center justify-center gap-2 ${
                        !isEnrolledFlag
                          ? 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white shadow-md shadow-purple-950/40 cursor-pointer'
                      }`}
                      title={!isEnrolledFlag ? 'Please set up biometric in Settings first' : `Verify with ${currentBiometricType === 'face_id' ? 'Face ID' : 'Touch ID'}`}
                    >
                      <Fingerprint className={`w-5 h-5 sm:w-4 sm:h-4 ${!isEnrolledFlag ? 'text-slate-500' : ''}`} />
                      <span>
                        Verify with {currentBiometricType === 'face_id' ? 'Face ID' : 'Touch ID'}
                      </span>
                    </button>
                  );
                })()
              )}
            </div>
          )}
        </div>

        {/* Device & Hardware Security Specs */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIDO2 / W3C WebAuthn Level 3</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-purple-300">
            <span>{platformInfo.deviceLabel}</span>
          </div>
        </div>

        {/* Alternative Login Link */}
        {onSwitchToPasswordLogin && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToPasswordLogin();
              }}
              className="biometric-touch-target min-h-[44px] py-2 px-3 text-xs text-purple-300 hover:text-white font-semibold underline underline-offset-4 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Or sign in with username &amp; password</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
