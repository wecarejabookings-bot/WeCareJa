import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, UserRole } from '../../types';
import { 
  User, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  X, 
  LogOut, 
  Sparkles, 
  Shield, 
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Camera,
  Upload,
  Clock,
  AlertTriangle,
  Fingerprint,
  Scan,
  RefreshCw,
  RotateCcw,
  Trash2,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { soundFX } from '../../utils/soundEffects';
import { 
  registerBiometricWithWebAuthn, 
  authenticateWithWebAuthn,
  getStoredCredentialForUser, 
  removeBiometricCredential, 
  getStoredBiometricCredentials, 
  detectPlatformBiometrics 
} from '../../utils/biometricAuth';
import { BiometricCredentialRecord } from '../../types';
import { WhatsAppSettingsCard } from '../whatsapp/WhatsAppSettingsCard';
import { 
  supabase,
  signInWithUsername, 
  signUpClientUser, 
  updateProfileData, 
  softDeleteAccount 
} from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  allAccounts: UserAccount[];
  isAuthenticated?: boolean;
  initialTab?: 'profile' | 'signin' | 'register';
  onSelectUser: (user: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onCreateAccount: (newAccount: UserAccount) => void;
  onSignOut?: () => void;
  onOpenBiometricAuth?: (preSelectedUserId?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allAccounts,
  isAuthenticated = true,
  initialTab = 'profile',
  onSelectUser,
  onUpdateUser,
  onCreateAccount,
  onSignOut,
  onOpenBiometricAuth
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'signin' | 'register'>(() => {
    if (isAuthenticated) return 'profile';
    return initialTab === 'profile' ? 'signin' : initialTab;
  });

  // Keep activeTab in sync with initialTab when opening
  React.useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        setActiveTab('profile');
      } else {
        setActiveTab(initialTab === 'profile' ? 'signin' : initialTab);
      }
    }
  }, [isOpen, initialTab, isAuthenticated]);
  
  // Sign-in form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('weCare_biometricEnrolled') === 'true';
    } catch {
      return false;
    }
  });

  // Keep biometric enrolled status synced with localStorage on open
  useEffect(() => {
    try {
      setIsBiometricEnrolled(localStorage.getItem('weCare_biometricEnrolled') === 'true');
    } catch {
      setIsBiometricEnrolled(false);
    }
  }, [isOpen]);

  // Edit Profile form state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editPassword, setEditPassword] = useState(currentUser?.password || 'password123');
  const [editZone, setEditZone] = useState(currentUser?.zone || 'New Kingston');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editMedicalInfo, setEditMedicalInfo] = useState(currentUser?.medical_info || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editEmergencyName, setEditEmergencyName] = useState(currentUser?.emergencyContact?.name || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentUser?.emergencyContact?.phone || '');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState(currentUser?.emergencyContact?.relation || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.full_name || currentUser.name);
      setEditEmail(currentUser.email);
      setEditPhone(currentUser.phone);
      setEditUsername(currentUser.username);
      setEditPassword(currentUser.password || 'password123');
      setEditZone(currentUser.zone || 'New Kingston');
      setEditAddress(currentUser.address || '');
      setEditMedicalInfo(currentUser.medical_info || '');
      setEditAvatarUrl(currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
      setEditEmergencyName(currentUser.emergencyContact?.name || '');
      setEditEmergencyPhone(currentUser.emergencyContact?.phone || '');
      setEditEmergencyRelation(currentUser.emergencyContact?.relation || '');
    }
  }, [currentUser]);

  // Biometric passkey state
  const [userBiometricRecord, setUserBiometricRecord] = useState<BiometricCredentialRecord | null>(() => {
    return currentUser ? getStoredCredentialForUser(currentUser.id) : null;
  });
  const [isRegisteringBiometric, setIsRegisteringBiometric] = useState(false);
  const [biometricSuccessMsg, setBiometricSuccessMsg] = useState<string | null>(null);
  const [biometricErrorMsg, setBiometricErrorMsg] = useState<string | null>(null);
  const [regEnableBiometrics, setRegEnableBiometrics] = useState(true);

  // Refresh biometric status on modal open or user change
  React.useEffect(() => {
    if (currentUser) {
      const record = getStoredCredentialForUser(currentUser.id);
      setUserBiometricRecord(record);
    }
  }, [currentUser, isOpen]);

  // Register device biometrics via WebAuthn
  const handleRegisterBiometrics = async (type: 'fingerprint' | 'face_id' = 'fingerprint') => {
    if (!currentUser) return;
    setIsRegisteringBiometric(true);
    setBiometricErrorMsg(null);
    setBiometricSuccessMsg(null);
    soundFX.playToggleClick();

    try {
      const res = await registerBiometricWithWebAuthn(currentUser, type);
      if (res.success && res.credential) {
        setUserBiometricRecord(res.credential);
        try {
          localStorage.setItem('weCare_biometricEnrolled', 'true');
          setIsBiometricEnrolled(true);
        } catch {}
        const updated: UserAccount = {
          ...currentUser,
          biometricsEnabled: true,
          biometricCredentialId: res.credential.id,
          biometricType: res.credential.biometricType,
          biometricDeviceName: res.credential.deviceName,
          biometricRegisteredAt: res.credential.createdAt
        };
        onUpdateUser(updated);
        soundFX.playSuccessPing();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setBiometricSuccessMsg(`Successfully registered ${res.credential.biometricType === 'face_id' ? 'Face ID' : 'Fingerprint'} passkey on this device!`);
        setTimeout(() => setBiometricSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setBiometricErrorMsg(err?.message || 'Biometric registration failed.');
      soundFX.playWarningSound();
    } finally {
      setIsRegisteringBiometric(false);
    }
  };

  const handleRemoveBiometrics = () => {
    if (!currentUser) return;
    removeBiometricCredential(currentUser.id);
    setUserBiometricRecord(null);
    try {
      localStorage.removeItem('weCare_biometricEnrolled');
      setIsBiometricEnrolled(false);
    } catch {}
    const updated: UserAccount = {
      ...currentUser,
      biometricsEnabled: false,
      biometricCredentialId: undefined,
      biometricType: undefined,
      biometricDeviceName: undefined,
      biometricRegisteredAt: undefined
    };
    onUpdateUser(updated);
    soundFX.playToggleClick();
    setBiometricSuccessMsg('Biometric passkey removed from this device.');
    setTimeout(() => setBiometricSuccessMsg(null), 3000);
  };

  // Register form state
  const [regRole, setRegRole] = useState<UserRole>('client');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regZone, setRegZone] = useState('New Kingston');
  const [regError, setRegError] = useState('');
  const [pendingNoticeAccount, setPendingNoticeAccount] = useState<UserAccount | null>(null);
  const [pendingRegistrationAccount, setPendingRegistrationAccount] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedInput = loginUsername.trim();
    const enteredPassword = loginPassword.trim();

    if (!trimmedInput) {
      setLoginError('Please enter your username (e.g., "sydney").');
      soundFX.playWarningSound();
      return;
    }

    if (!enteredPassword) {
      setLoginError('Please enter your account password.');
      soundFX.playWarningSound();
      return;
    }

    setIsSubmittingAuth(true);
    try {
      try {
        const res = await signInWithUsername(trimmedInput, enteredPassword);
        if (res?.profile) {
          if (res.profile.id) {
            try {
              await supabase.functions.invoke('confirm-user', { body: { user_id: res.profile.id } });
            } catch (fnErr) {
              console.warn('confirm-user invoke error:', fnErr);
            }
            // Self-heal profile using ONLY existing columns: id, full_name, role, phone, address, trn
            try {
              await supabase.from('profiles').upsert({
                id: res.profile.id,
                full_name: res.profile.full_name || res.profile.name || 'WeCare Practitioner',
                role: res.profile.role || 'nurse',
                phone: res.profile.phone || '',
                address: res.profile.address || '',
                trn: (res.profile as any).trn || ''
              }, { onConflict: 'id' });
            } catch (upErr) {
              console.warn('profiles upsert note:', upErr);
            }
          }
          soundFX.playSuccessPing();
          onSelectUser(res.profile);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth sign-in warning:', err);
        const errMsg = err?.message || '';

        // Handle "Email not confirmed" error on login page and show "Check your email"
        if (errMsg.toLowerCase().includes('email not confirmed')) {
          setLoginError('Email not confirmed. Please check your email inbox to confirm your account.');
          soundFX.playWarningSound();
          return;
        }

        // If not Sydney fallback, display error message
        if (trimmedInput.toLowerCase() !== 'sydney') {
          setLoginError(errMsg || 'Invalid username or password. Please verify your credentials.');
          soundFX.playWarningSound();
          return;
        }
      }

      // Fallback for Master Admin Sydney Mattis
      if (trimmedInput.toLowerCase() === 'sydney' && enteredPassword === '12345678') {
        const fallbackAdmin: UserAccount = allAccounts.find(a => a.username.toLowerCase() === 'sydney') || {
          id: 'user-admin-01',
          name: 'Sydney Mattis',
          full_name: 'Sydney Mattis',
          username: 'sydney',
          email: 'wecareja.bookings@gmail.com',
          phone: '(876) 582-7613',
          role: 'admin',
          title: 'Lead Operations Director & Master Administrator',
          zone: 'St. Catherine & Kingston',
          address: '4 Claudete Drive, St. Catherine, Jamaica',
          createdAt: new Date().toISOString()
        };
        soundFX.playSuccessPing();
        onSelectUser(fallbackAdmin);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onClose();
        return;
      }

      setLoginError('Invalid username or password. Please verify your credentials.');
      soundFX.playWarningSound();
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Primary Passkey Sign-In logic integrated for all users
  const handlePasskeySignIn = async (targetUser?: UserAccount) => {
    setLoginError('');

    // Biometric Passkey Sign-In should ONLY work if user has previously set it up in Settings
    const isEnrolled = typeof window !== 'undefined' && localStorage.getItem('weCare_biometricEnrolled') === 'true';
    if (!isEnrolled) {
      setLoginError('Please set up biometric in Settings first');
      soundFX.playWarningSound();
      return;
    }

    soundFX.playToggleClick();

    // Determine target user from parameter or typed username
    let userToAuth = targetUser;
    if (!userToAuth && loginUsername.trim()) {
      userToAuth = allAccounts.find(
        acc => acc.username.toLowerCase() === loginUsername.trim().toLowerCase()
      ) || null;
      if (!userToAuth) {
        setLoginError(`Username "${loginUsername}" not recognized. Please check your username.`);
        soundFX.playWarningSound();
        return;
      }
    }

    // If no user specified yet, check if any credentials exist
    if (!userToAuth) {
      const storedCreds = getStoredBiometricCredentials();
      if (!storedCreds || storedCreds.length === 0) {
        setLoginError('Please set up biometric in Settings first');
        soundFX.playWarningSound();
        return;
      }
      if (onOpenBiometricAuth) {
        onOpenBiometricAuth();
        onClose();
        return;
      }
      setLoginError('Please enter your username first to authenticate with your Passkey.');
      soundFX.playWarningSound();
      return;
    }

    if (userToAuth.approvalStatus === 'pending_approval') {
      setPendingNoticeAccount(userToAuth);
      return;
    }

    // Biometric should ONLY work after user saves it in Settings
    const cred = getStoredCredentialForUser(userToAuth.id);
    if (!cred) {
      setLoginError('Please set up biometric in Settings first');
      soundFX.playWarningSound();
      return;
    }

    setIsVerifyingPasskey(true);

    try {
      const result = await authenticateWithWebAuthn(cred, allAccounts);
      if (result.success && result.userAccount) {
        soundFX.playBiometricSuccess();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([45, 55, 95]);
          } catch {}
        }
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onSelectUser(result.userAccount);
        onClose();
        return;
      } else {
        setLoginError(result.error || 'Passkey verification failed or cancelled. Please retry or enter password.');
        soundFX.playBiometricRetry();
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Biometric passkey sign-in failed.');
      soundFX.playBiometricRetry();
    } finally {
      setIsVerifyingPasskey(false);
    }
  };

  const handleApproveAndSignIn = (acc: UserAccount) => {
    const approvedAcc: UserAccount = {
      ...acc,
      approvalStatus: 'approved'
    };
    onUpdateUser(approvedAcc);
    onSelectUser(approvedAcc);
    setPendingNoticeAccount(null);
    setPendingRegistrationAccount(null);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateProfileData(currentUser.id, {
        full_name: editName,
        phone: editPhone,
        address: editAddress,
        medical_info: editMedicalInfo
      });
    } catch (err) {
      console.warn('Could not sync profile to Supabase:', err);
    }

    const updated: UserAccount = {
      ...currentUser,
      name: editName,
      full_name: editName,
      phone: editPhone,
      address: editAddress,
      medical_info: editMedicalInfo,
      zone: editZone
    };

    onUpdateUser(updated);
    setProfileSuccessMsg(true);
    soundFX.playSuccessPing();
    setTimeout(() => setProfileSuccessMsg(false), 2500);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeletingAccount(true);
    try {
      await softDeleteAccount(currentUser.id);
      soundFX.playCancellation();
      onSignOut?.();
      onClose();
    } catch (err: any) {
      alert('Failed to deactivate account: ' + err?.message);
    } finally {
      setIsDeletingAccount(false);
      setIsConfirmingDelete(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim() || !regEmail.trim()) {
      setRegError('Please complete all required fields.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const res = await signUpClientUser({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        fullName: regName.trim(),
        phone: regPhone.trim(),
        address: regZone.trim()
      });

      const userId = res?.profile?.id || (res as any)?.user?.id;
      if (userId) {
        // Call confirm-user edge function
        try {
          await supabase.functions.invoke('confirm-user', { body: { user_id: userId } });
        } catch (fnErr) {
          console.warn('confirm-user invoke error:', fnErr);
        }

        // After signUp ALWAYS upsert profiles using existing columns only
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: regName.trim(),
            role: res.profile?.role || 'client',
            phone: regPhone.trim(),
            address: regZone.trim(),
            trn: ''
          }, { onConflict: 'id' });
        } catch (upErr) {
          console.warn('profiles upsert note:', upErr);
        }
      }

      soundFX.playSuccessPing();
      onCreateAccount(res.profile);
      onSelectUser(res.profile);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      onClose();
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please check your information and try again.');
      soundFX.playWarningSound();
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn auth-modal-backdrop">
      {/* Scoped Media Query for Mobile Screen Full-Width & High Touch Accessibility */}
      <style>{`
        @media (max-width: 640px) {
          .auth-modal-backdrop {
            padding: 0 !important;
            align-items: stretch !important;
          }
          .auth-modal-dialog {
            width: 100vw !important;
            max-width: 100vw !important;
            min-height: 100dvh !important;
            height: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .auth-modal-body {
            flex: 1 1 auto !important;
            max-height: none !important;
            padding: 1.25rem 1rem !important;
          }
          .auth-modal-biometric-banner,
          .auth-modal-form,
          .auth-form-container {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .auth-modal-input {
            width: 100% !important;
            min-height: 48px !important;
            font-size: 16px !important;
            box-sizing: border-box !important;
          }
          .auth-touch-target {
            min-height: 48px !important;
            min-width: 48px !important;
          }
          .auth-modal-tabs button {
            min-height: 48px !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          .auth-action-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .auth-action-buttons button {
            width: 100% !important;
            min-height: 48px !important;
          }
        }
      `}</style>
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-3xl rounded-none bg-[#140526] border-0 sm:border border-purple-500/30 text-white shadow-2xl overflow-hidden my-0 sm:my-8 auth-modal-dialog flex flex-col justify-between sm:justify-start">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-b from-purple-950/50 to-transparent border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">We Care Jamaica Access Portal</h3>
              <p className="text-[11px] sm:text-xs text-purple-300">
                User Authentication &amp; Credential Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer auth-touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex border-b border-white/10 bg-black/30 px-3 sm:px-6 pt-2 sm:pt-3 gap-2 overflow-x-auto auth-modal-tabs">
          {isAuthenticated && currentUser ? (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="min-h-[48px] py-3 px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 border-[#C77DFF] text-white auth-touch-target"
            >
              <User className="w-4 h-4" />
              <span>My Profile ({currentUser.name.split(' ')[0]})</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`min-h-[48px] py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 flex-1 sm:flex-initial auth-touch-target cursor-pointer ${
                  activeTab === 'signin'
                    ? 'border-[#C77DFF] text-white bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`min-h-[48px] py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 flex-1 sm:flex-initial auth-touch-target cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-[#C77DFF] text-white bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="relative z-10 p-4 sm:p-6 space-y-5 max-h-[580px] overflow-y-auto auth-modal-body">
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            (!isAuthenticated || !currentUser) ? (
              <div className="p-8 text-center space-y-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-xl">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">Profile Locked — Credentials Required</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  You cannot view or access user profiles without signing in. Hardware biometric passkeys or password credentials are strictly required to use the system. Unauthenticated visitors are restricted to the front page.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Go to Sign In</span>
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Notice to sign out before switching user or creating an account */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-300" />
                    Currently Signed In as {currentUser.name} ({currentUser.role.toUpperCase()})
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    To switch users or register a new account, please sign out of your current session first.
                  </p>
                </div>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Switch User</span>
                  </button>
                )}
              </div>

              {/* Profile Card Header with Camera Photo Controls */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative group shrink-0">
                    <img
                      src={editAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-md group-hover:opacity-80 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition text-[9px] font-bold gap-1"
                      title="Open device camera"
                    >
                      <Camera className="w-4 h-4 text-purple-300" />
                      <span>Take Photo</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">{currentUser.name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 text-[10px] font-bold uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                    <span className="text-xs text-purple-300 block">
                      Username: <strong className="text-white font-mono">{currentUser.username}</strong>
                    </span>

                    {/* Camera & Upload Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold transition flex items-center gap-1.5 border border-white/10"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-300" />
                        <span>Upload</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditAvatarUrl(event.target.result as string);
                                soundFX.playSuccessPing();
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Account Status</span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold inline-flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Active
                  </span>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile and password updated successfully!</span>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Username (Login Handle)</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Phone Number (+1 876)</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Primary Parish / Zone</label>
                  <input
                    type="text"
                    value={editZone}
                    onChange={(e) => setEditZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Street / Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. 14 Trafalgar Road, Kingston 5"
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Medical Info / Health Background</label>
                  <textarea
                    rows={2}
                    value={editMedicalInfo}
                    onChange={(e) => setEditMedicalInfo(e.target.value)}
                    placeholder="Allergies, chronic conditions (hypertension, diabetes), mobility notes, or care instructions"
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F59E0B]" />
                  <h5 className="text-xs font-bold text-red-200">Emergency &amp; Safety Contact Info</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Phone (+1 876)</label>
                    <input
                      type="tel"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={editEmergencyRelation}
                      onChange={(e) => setEditEmergencyRelation(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WebAuthn Biometric Authentication Layer Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/40 to-[#1b072e] border border-purple-500/30 space-y-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1E1B4B]/40 text-[#C77DFF] flex items-center justify-center border border-purple-400/30">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Biometric Sign-In &amp; Passkeys</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                          WebAuthn
                        </span>
                      </h4>
                      <p className="text-[10px] text-purple-200/80">
                        Sign in without passwords using Touch ID, Face ID, or Windows Hello.
                      </p>
                    </div>
                  </div>

                  {userBiometricRecord ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Enrolled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-white/10 text-[10px] font-bold">
                      Not Configured
                    </span>
                  )}
                </div>

                {biometricSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{biometricSuccessMsg}</span>
                  </div>
                )}

                {biometricErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{biometricErrorMsg}</span>
                  </div>
                )}

                {userBiometricRecord ? (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        {userBiometricRecord.biometricType === 'face_id' ? (
                          <Scan className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span>{userBiometricRecord.deviceName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Enrolled: {new Date(userBiometricRecord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {onOpenBiometricAuth && (
                        <button
                          type="button"
                          onClick={() => onOpenBiometricAuth(currentUser.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 border border-purple-400/30"
                        >
                          <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Test Biometric Sign-In</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleRemoveBiometrics}
                        className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold transition flex items-center gap-1.5 border border-red-500/30 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Passkey</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRegisterBiometrics('fingerprint')}
                      disabled={isRegisteringBiometric}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRegisteringBiometric ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Register Fingerprint Sensor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegisterBiometrics('face_id')}
                      disabled={isRegisteringBiometric}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Scan className="w-3.5 h-3.5 text-[#C77DFF]" />
                      <span>Register Face ID</span>
                    </button>
                  </div>
                )}
              </div>

              {/* WhatsApp Remote Care & Live Updates Notification Card */}
              <WhatsAppSettingsCard
                currentPhone={currentUser.whatsAppPhoneNumber || currentUser.phone || '+1 (876) 942-3311'}
                isOptedIn={currentUser.whatsAppUpdatesOptIn !== false}
                onToggleOptIn={(optIn) => {
                  const updated: UserAccount = {
                    ...currentUser,
                    whatsAppUpdatesOptIn: optIn
                  };
                  onUpdateUser(updated);
                }}
                onUpdatePhone={(phone) => {
                  const updated: UserAccount = {
                    ...currentUser,
                    whatsAppPhoneNumber: phone,
                    phone: phone
                  };
                  setEditPhone(phone);
                  onUpdateUser(updated);
                }}
              />

              {/* Account Deactivation / Soft Delete Section (Requirement 6) */}
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Delete Account (Deactivate)</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Soft deactivates your profile (sets <code className="font-mono text-red-300">is_deleted = true</code> in Supabase) and signs you out. Data is preserved safely.
                    </p>
                  </div>

                  {!isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isDeletingAccount ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Confirm Deactivation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white text-xs font-bold shadow-lg transition"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </form>
          )
        )}

          {/* TAB 2: SIGN IN / CREDENTIAL AUTHENTICATION */}
          {activeTab === 'signin' && (
            <div className="space-y-5 w-full">
              {/* WebAuthn Biometric Fast Sign-In Banner */}
              <div className="auth-modal-biometric-banner w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#270940] to-emerald-950/40 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-emerald-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40 border border-white/20 shrink-0">
                    <Fingerprint className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-white leading-tight">
                        Biometric Passkey Sign-In
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>FIDO2 / W3C</span>
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/80 mt-1">
                      Touch ID, Face ID, or Windows Hello instant sign-in.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isBiometricEnrolled) {
                      setLoginError('Please set up biometric in Settings first');
                      soundFX.playWarningSound();
                      return;
                    }
                    handlePasskeySignIn();
                  }}
                  disabled={isVerifyingPasskey}
                  className={`auth-touch-target w-full sm:w-auto px-5 py-3.5 sm:py-2.5 min-h-[48px] rounded-xl text-sm sm:text-xs font-extrabold transition flex items-center justify-center gap-2 shrink-0 ${
                    !isBiometricEnrolled
                      ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60 hover:opacity-60 shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-95 text-white shadow-lg shadow-purple-950/50 cursor-pointer'
                  }`}
                  title={!isBiometricEnrolled ? 'Please set up biometric in Settings first' : 'Authenticate immediately via hardware passkey'}
                >
                  {isVerifyingPasskey ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>Verifying Passkey...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className={`w-4 h-4 ${!isBiometricEnrolled ? 'text-slate-500' : 'text-emerald-300'}`} />
                      <span>Instant Passkey Sign-In</span>
                    </>
                  )}
                </button>
              </div>

              {/* Username / Password Form with Integrated Passkey Option */}
              <form onSubmit={handleSignIn} className="auth-modal-form w-full p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#C77DFF]" />
                    <span>Sign In with Credentials</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                    Passkey or Password Enforced
                  </span>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{loginError}</span>
                    </div>
                    {loginError.toLowerCase().includes('passkey') && (
                      <button
                        type="button"
                        onClick={() => handlePasskeySignIn()}
                        className="px-2.5 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                        title="Retry Passkey Sign-In"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="auth-modal-grid grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs w-full">
                  <div className="w-full">
                    <label className="font-bold text-slate-300 block mb-1.5 text-xs">Username</label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter your username (e.g. sydney)"
                      className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-300 text-xs">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-touch-target min-h-[44px] min-w-[44px] px-2 py-1 text-xs text-purple-300 hover:text-white flex items-center justify-end gap-1 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter your account password"
                      className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dual Action Buttons: Passkey or Password */}
                <div className="auth-action-buttons pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isBiometricEnrolled) {
                        setLoginError('Please set up biometric in Settings first');
                        soundFX.playWarningSound();
                        return;
                      }
                      handlePasskeySignIn();
                    }}
                    disabled={isVerifyingPasskey}
                    className={`auth-touch-target w-full sm:w-auto px-5 py-3.5 sm:py-2.5 min-h-[48px] rounded-xl font-bold text-sm sm:text-xs transition flex items-center justify-center gap-2 ${
                      !isBiometricEnrolled
                        ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60 hover:opacity-60 shadow-none'
                        : 'bg-gradient-to-r from-emerald-600/30 to-purple-600/30 hover:from-emerald-600/50 hover:to-purple-600/50 text-emerald-300 border border-emerald-500/40 shadow-md cursor-pointer'
                    }`}
                    title={!isBiometricEnrolled ? 'Please set up biometric in Settings first' : 'Authenticate instantly using device passkey (Touch ID, Face ID, Windows Hello)'}
                  >
                    {isVerifyingPasskey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Verifying Passkey...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className={`w-4 h-4 ${!isBiometricEnrolled ? 'text-slate-500' : 'text-emerald-400'}`} />
                        <span>Sign In with Passkey</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="auth-touch-target w-full sm:w-auto px-6 py-3.5 sm:py-2.5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white text-sm sm:text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Log In with Password</span>
                  </button>
                </div>
              </form>

              {/* Strict Privacy & Account Isolation Notice */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200/90 flex items-start gap-3 w-full">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">
                    Protected Clinical Access &amp; Privacy Policy
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    User profiles and confidential medical records are restricted to Clinical Administration. Each user must sign in using their own remembered credentials or enrolled biometric passkey. Browsing other members' profiles is strictly prohibited.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-purple-900/40 border border-purple-400/30 text-xs text-purple-100 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Clinical Sign-Up &amp; Approval Policy</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Client / Patient Instant</span>
                  </div>
                  <p className="text-[11px] text-purple-200 leading-relaxed">
                    <strong>Clients &amp; Patients</strong> get immediate access to book care. 
                    <strong> Licensed Nurses &amp; Staff</strong> require clinical verification and admin approval before activation. All signups need admin approval except client/patient accounts.
                  </p>
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Select Account Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegRole('client')}
                    className={`auth-touch-target p-3.5 sm:p-3 min-h-[48px] rounded-xl border text-center font-bold transition flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 cursor-pointer ${
                      regRole === 'client'
                        ? 'border-purple-400 bg-purple-600/30 text-white ring-1 ring-purple-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-5 h-5 sm:w-4 sm:h-4 text-purple-300 shrink-0" />
                    <span>Client / Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('nurse')}
                    className={`auth-touch-target p-3.5 sm:p-3 min-h-[48px] rounded-xl border text-center font-bold transition flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 cursor-pointer ${
                      regRole === 'nurse'
                        ? 'border-purple-400 bg-purple-600/30 text-white ring-1 ring-purple-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Stethoscope className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>Licensed Nurse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`auth-touch-target p-3.5 sm:p-3 min-h-[48px] rounded-xl border text-center font-bold transition flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 cursor-pointer ${
                      regRole === 'admin'
                        ? 'border-purple-400 bg-purple-600/30 text-white ring-1 ring-purple-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <div className="auth-modal-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs w-full">
                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Tamara Davis"
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Username</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. tdavis_nurse"
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Choose password"
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Phone (+1 876)</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (876) 555-0123"
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="w-full">
                  <label className="font-bold text-slate-300 block mb-1">Parish / Service Area</label>
                  <input
                    type="text"
                    value={regZone}
                    onChange={(e) => setRegZone(e.target.value)}
                    className="auth-modal-input w-full min-h-[48px] px-3.5 py-3 text-base sm:text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="auth-touch-target w-full sm:w-auto px-6 py-3.5 sm:py-2.5 min-h-[48px] rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white text-sm sm:text-xs font-bold shadow-lg transition flex items-center justify-center cursor-pointer"
                >
                  Create &amp; Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PENDING APPROVAL MODAL NOTIFICATION */}
        {pendingNoticeAccount && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#1d0a33] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Practitioner Account Pending Approval</h3>
                <p className="text-xs text-amber-300 mt-1">
                  Account: <strong>{pendingNoticeAccount.name}</strong> (@{pendingNoticeAccount.username})
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All nurse and practitioner signups require clinical license verification and admin approval before activation. Only patient and client signups are activated immediately.
              </p>
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-[11px] text-purple-200 text-left space-y-1">
                <span className="font-bold text-amber-300 block">Clinical Directorate Audit:</span>
                <span>This practitioner is queued in the Admin Clinical Registry for Nursing Council of Jamaica credential verification.</span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingNoticeAccount(null)}
                  className="w-full py-2.5 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  Close &amp; Return to Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATION SUBMITTED PENDING DIALOG */}
        {pendingRegistrationAccount && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-[#1d0a33] border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-lg">
                <Sparkles className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Practitioner Sign-Up Submitted!</h3>
                <p className="text-xs text-purple-200 mt-1">
                  Registration for <strong>{pendingRegistrationAccount.name}</strong> was created.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-left space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Administrator Approval Required</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  All signups need to be approved by admin except patient and client signups. Your profile is queued for review by Clinical Administration.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingRegistrationAccount(null);
                    setActiveTab('signin');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(photoDataUrl) => {
          setEditAvatarUrl(photoDataUrl);
        }}
        title="Take Profile Photo"
      />
    </div>
  );
};
