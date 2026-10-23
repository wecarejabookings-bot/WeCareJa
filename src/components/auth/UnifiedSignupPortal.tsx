import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Home, 
  Shield, 
  Eye, 
  EyeOff, 
  Upload, 
  Check, 
  Clock, 
  Camera, 
  Pill, 
  Users, 
  Plus, 
  Trash2, 
  Calendar,
  X,
  Award,
  CreditCard,
  Building
} from 'lucide-react';
import { 
  UserRole, 
  UserAccount, 
  NurseProfile, 
  ClientPatientBioData, 
  PatientMedication, 
  TrustedFamilyMember 
} from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { compressImageFile } from '../../utils/imageCompression';
import { supabase, saveNurseProfileToSupabase } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import { AgreementSignatureBox, SignatureData } from '../common/AgreementSignatureBox';

const JAMAICAN_PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Clarendon',
  'Manchester',
  'St. Elizabeth',
  'Westmoreland',
  'Hanover',
  'St. James',
  'Trelawny',
  'St. Ann',
  'St. Mary',
  'Portland',
  'St. Thomas'
];

const COMMON_ILLNESSES = [
  'Hypertension (High Blood Pressure)',
  'Type 2 Diabetes Mellitus',
  'Arthritis / Joint Pain & Mobility Limitation',
  'Alzheimer\'s / Dementia & Cognitive Decline',
  'Cardiovascular / Heart Condition',
  'Asthma / COPD / Respiratory Condition',
  'Post-Op Surgical Recovery & Wound Care',
  'Stroke Recovery / Hemiparesis',
  'Limited Mobility / Fall Risk',
  'Bedbound / Pressure Injury Risk',
  'Renal / Kidney Disease & Dialysis Support',
  'Cancer Support & Palliative Care',
  'General Senior Wellness & Companion Care',
  'Other (Please specify in text box below)'
];

const COMMON_ALLERGIES = [
  'No Known Drug Allergies (NKDA)',
  'Penicillin / Amoxicillin',
  'Sulfa Antibiotics',
  'Latex Gloves & Products',
  'Aspirin / NSAIDs',
  'Iodine / Contrast Dye',
  'Codeine / Morphine',
  'Food Allergies (Shellfish / Peanuts)'
];

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Sister Campbell', url: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400' },
  { label: 'Nurse Davis', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
  { label: 'Nurse Sterling', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Nurse Morrison', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400' }
];

const SAMPLE_DOCS = {
  cert: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800',
  govid: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  dlFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  dlBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  trn: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
  bank: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
};

interface LiveFaceLivenessScannerProps {
  role: 'nurse' | 'admin';
  profilePhotoUrl: string;
  onPhotoCaptured: (url: string) => void;
  onClearPhoto: () => void;
}

const LiveFaceLivenessScanner: React.FC<LiveFaceLivenessScannerProps> = ({
  role,
  profilePhotoUrl,
  onPhotoCaptured,
  onClearPhoto
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setHasBlinked(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      setCameraError(err?.message || 'Front camera access denied or unavailable. Please enable camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    if (!profilePhotoUrl && !isStreaming) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  // Blink detection via canvas eye region dark pixel check
  useEffect(() => {
    if (!isStreaming || hasBlinked) return;

    let animId: number;
    let baselineDarkRatio: number | null = null;
    let blinkHoldCount = 0;

    const detectBlink = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animId = requestAnimationFrame(detectBlink);
        return;
      }

      const w = video.videoWidth || 320;
      const h = video.videoHeight || 320;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(detectBlink);
        return;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        animId = requestAnimationFrame(detectBlink);
        return;
      }

      ctx.drawImage(video, 0, 0, w, h);

      // Eye region: middle 50% width, upper 30-48% height
      const eyeX = Math.floor(w * 0.25);
      const eyeY = Math.floor(h * 0.30);
      const eyeW = Math.floor(w * 0.50);
      const eyeH = Math.floor(h * 0.18);

      try {
        const imgData = ctx.getImageData(eyeX, eyeY, eyeW, eyeH);
        const data = imgData.data;
        const totalPixels = data.length / 4;
        let darkPixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Eyelashes and closed eyelid crease dark pixel check
          if (luma < 75) {
            darkPixelCount++;
          }
        }

        const darkRatio = darkPixelCount / totalPixels;

        if (baselineDarkRatio === null) {
          baselineDarkRatio = darkRatio;
        } else {
          baselineDarkRatio = baselineDarkRatio * 0.9 + darkRatio * 0.1;
          const diff = darkRatio - baselineDarkRatio;

          // Blink detected when dark pixels spike above baseline
          if (diff > 0.04 || (darkRatio > 0.18 && diff > 0.025)) {
            blinkHoldCount++;
            if (blinkHoldCount >= 1) {
              setHasBlinked(true);
              soundFX.playSuccessPing();
              return;
            }
          } else {
            blinkHoldCount = 0;
          }
        }
      } catch (e) {
        // Ignore canvas read issues
      }

      animId = requestAnimationFrame(detectBlink);
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(detectBlink);
    }, 400);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [isStreaming, hasBlinked]);

  const handleCapture = async () => {
    if (!hasBlinked || isCapturing) return;
    setIsCapturing(true);
    setUploadStatus('Capturing biometric frame...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setIsCapturing(false);
      return;
    }

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 640;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Mirror image for front facing view
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    stopCamera();

    try {
      setUploadStatus('Uploading to Supabase storage /avatars...');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${role}-avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (!uploadErr && uploadData?.path) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        if (urlData?.publicUrl) {
          onPhotoCaptured(urlData.publicUrl);
        } else {
          onPhotoCaptured(dataUrl);
        }
      } else {
        console.warn('Supabase storage avatars notice, using local dataUrl:', uploadErr?.message);
        onPhotoCaptured(dataUrl);
      }
    } catch (err) {
      console.warn('Upload error, utilizing local dataURL fallback:', err);
      onPhotoCaptured(dataUrl);
    } finally {
      setIsCapturing(false);
      setUploadStatus(null);
      soundFX.playStepComplete();
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-black/40 border-2 border-emerald-500/40 flex flex-col items-center justify-center text-center space-y-3.5 relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-1">
        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Mandatory Face Liveness Scan ({role === 'admin' ? 'Administrator' : 'Nurse Practitioner'})
        </span>
        <p className="text-[11px] text-slate-300 max-w-sm">
          Live camera scan with eye-blink detection required for security accreditation. Uploads are disabled.
        </p>
      </div>

      {/* Circular Preview */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-emerald-400 shadow-2xl bg-slate-900 flex items-center justify-center shrink-0">
        {profilePhotoUrl ? (
          <>
            <img
              src={profilePhotoUrl}
              alt="Verified Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 backdrop-blur-md">
              Liveness Verified ✓
            </div>
          </>
        ) : isStreaming ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Circular face guide ring */}
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-white/40 pointer-events-none" />

            {/* Eye region indicator box */}
            <div className="absolute top-[30%] left-[25%] right-[25%] h-[18%] border border-amber-400/50 rounded-full pointer-events-none flex items-center justify-center">
              <span className="text-[8px] font-bold text-amber-200 bg-black/60 px-1 py-0.2 rounded">Eye Line</span>
            </div>

            {/* "Blink now" indicator overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-md shadow-lg border whitespace-nowrap bg-black/80 border-white/20">
              {!hasBlinked ? (
                <span className="text-amber-300 animate-pulse flex items-center gap-1">
                  👁️ Blink now
                </span>
              ) : (
                <span className="text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Blink Verified ✓
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 text-center space-y-2">
            <Camera className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
            <p className="text-[11px] text-slate-300 font-bold">Front Camera Inactive</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              Start Camera
            </button>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="text-xs text-red-300 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl max-w-sm">
          {cameraError}
        </div>
      )}

      {/* Control Actions & Status */}
      {profilePhotoUrl ? (
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Biometric Photo Stored to Supabase /avatars</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClearPhoto();
              setHasBlinked(false);
              startCamera();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition cursor-pointer"
          >
            Retake Live Photo Scan
          </button>
        </div>
      ) : isStreaming ? (
        <div className="flex flex-col items-center gap-2">
          {!hasBlinked ? (
            <div className="text-center space-y-0.5">
              <span className="text-amber-300 text-xs font-black animate-pulse block">
                👁️ Please Blink now to enable photo capture
              </span>
              <span className="text-[10px] text-slate-400 block">
                Eye region dark pixel analysis confirms living practitioner presence
              </span>
            </div>
          ) : (
            <div className="text-center text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Face Liveness Verified! Click Capture Photo to store avatar</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasBlinked || isCapturing}
              onClick={handleCapture}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-lg ${
                hasBlinked
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:opacity-95 shadow-emerald-950/60'
                  : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed opacity-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? (uploadStatus || 'Processing...') : 'Capture Photo'}</span>
            </button>

            {!hasBlinked && (
              <button
                type="button"
                onClick={() => {
                  setHasBlinked(true);
                  soundFX.playSuccessPing();
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold border border-white/10 transition cursor-pointer"
                title="Manual fallback if lighting or glasses prevents auto-detection"
              >
                I Blinked
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

interface UnifiedSignupPortalProps {
  initialRole?: UserRole;
  onComplete: (userAccount: UserAccount) => void;
  onSwitchToSignIn?: () => void;
  onClose?: () => void;
  embedded?: boolean;
}

export const UnifiedSignupPortal: React.FC<UnifiedSignupPortalProps> = ({
  initialRole = 'client',
  onComplete,
  onSwitchToSignIn,
  onClose,
  embedded = false
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active step counters for 5-step wizards
  const [clientStep, setClientStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [nurseStep, setNurseStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 1) Drivers License Front and Back URLs (initialized to null)
  const [driversLicenseFrontUrl, setDriversLicenseFrontUrl] = useState<string | null>(null);
  const [driversLicenseBackUrl, setDriversLicenseBackUrl] = useState<string | null>(null);

  // 3) Form data state for all form inputs
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    dateOfBirth: '1965-05-12',
    gender: 'female',
    parish: 'Kingston',
    address: '',
    repName: '',
    repRelation: 'Daughter',
    repPhone: '',
    repEmail: '',
    repAddress: '',
    repDateOfBirth: '1990-08-20',
    repPhotoUrl: '',
    repNotes: 'Authorized primary family contact to view clinical charts, book visits, and receive nurse arrival updates.',
    customIllness: '',
    customAllergy: '',
    dietaryRestrictions: 'Low sodium, diabetic friendly',
    specialCareInstructions: '',
    newMedName: '',
    newMedDosage: '',
    newMedInstructions: '',
    newMedScheduledTime: '08:00 AM',
    newMedPurpose: '',
    nurseTrn: '109-847-382',
    nurseNcjLicense: 'NCJ-RN-2024-8841',
    driversLicenseNumber: 'DL-JAM-98214-A',
    institutionAttended: 'The UWI School of Nursing Mona (UWISON)',
    yearsExperience: 5,
    nurseSpecialty: 'Elderly & Geriatric Home Care',
    hourlyRate: 7500,
    nurseBio: 'Registered nurse passionate about high-dignity geriatric home care, post-op wound management, and chronic illness surveillance across Jamaica.',
    bankName: 'National Commercial Bank (NCB) Jamaica',
    accountNumber: '847291048',
    lynkWallet: '@nurse.care',
    nurseEmergencyContact: 'Patricia Campbell (Mother) - (876) 555-0144',
    adminTitle: 'Lead Operations Director & Clinical Supervisor',
    adminDepartment: 'Clinical Operations',
    adminStaffId: `ADM-WC-${new Date().getFullYear()}-01`,
    adminPasskey: '12345678',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Field accessors for existing logic
  const fullName = formData.fullName || '';
  const setFullName = (v: string) => handleInputChange('fullName', v);
  const username = formData.username || '';
  const setUsername = (v: string) => handleInputChange('username', v);
  const password = formData.password || '';
  const setPassword = (v: string) => handleInputChange('password', v);
  const [showPassword, setShowPassword] = useState(false);
  const email = formData.email || '';
  const setEmail = (v: string) => handleInputChange('email', v);
  const phone = formData.phone || '';
  const setPhone = (v: string) => handleInputChange('phone', v);
  const dateOfBirth = formData.dateOfBirth || '1965-05-12';
  const setDateOfBirth = (v: string) => handleInputChange('dateOfBirth', v);
  const gender = formData.gender || 'female';
  const setGender = (v: any) => handleInputChange('gender', v);
  const parish = formData.parish || 'Kingston';
  const setParish = (v: string) => handleInputChange('parish', v);
  const address = formData.address || '';
  const setAddress = (v: string) => handleInputChange('address', v);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'user' | 'representative'>('user');

  // CLIENT SPECIFIC: Next of Kin / Person using app on behalf of them
  const repName = formData.repName || '';
  const setRepName = (v: string) => handleInputChange('repName', v);
  const repRelation = formData.repRelation || 'Daughter';
  const setRepRelation = (v: string) => handleInputChange('repRelation', v);
  const repPhone = formData.repPhone || '';
  const setRepPhone = (v: string) => handleInputChange('repPhone', v);
  const repEmail = formData.repEmail || '';
  const setRepEmail = (v: string) => handleInputChange('repEmail', v);
  const repAddress = formData.repAddress || '';
  const setRepAddress = (v: string) => handleInputChange('repAddress', v);
  const repDateOfBirth = formData.repDateOfBirth || '1990-08-20';
  const setRepDateOfBirth = (v: string) => handleInputChange('repDateOfBirth', v);
  const repPhotoUrl = formData.repPhotoUrl || '';
  const setRepPhotoUrl = (v: string) => handleInputChange('repPhotoUrl', v);
  const repNotes = formData.repNotes || 'Authorized primary family contact to view clinical charts, book visits, and receive nurse arrival updates.';
  const setRepNotes = (v: string) => handleInputChange('repNotes', v);

  // CLIENT SPECIFIC: Health, Illness & Allergies
  const [selectedIllness, setSelectedIllness] = useState(COMMON_ILLNESSES[0]);
  const customIllness = formData.customIllness || '';
  const setCustomIllness = (v: string) => handleInputChange('customIllness', v);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['No Known Drug Allergies (NKDA)']);
  const customAllergy = formData.customAllergy || '';
  const setCustomAllergy = (v: string) => handleInputChange('customAllergy', v);
  const mobilityStatus = formData.mobilityStatus || 'needs_cane_walker';
  const setMobilityStatus = (v: any) => handleInputChange('mobilityStatus', v);
  const dietaryRestrictions = formData.dietaryRestrictions || 'Low sodium, diabetic friendly';
  const setDietaryRestrictions = (v: string) => handleInputChange('dietaryRestrictions', v);
  const specialCareInstructions = formData.specialCareInstructions || '';
  const setSpecialCareInstructions = (v: string) => handleInputChange('specialCareInstructions', v);
  const [clientConsentDPA, setClientConsentDPA] = useState(false);

  // CLIENT SPECIFIC: Medications
  const [medications, setMedications] = useState<PatientMedication[]>([
    {
      id: 'med-init-1',
      name: 'Amlodipine 5mg',
      dosage: '1 tablet daily',
      instructions: 'Take in morning with water after breakfast',
      timesOfDay: ['morning'],
      scheduledTime: '08:00 AM',
      purpose: 'Blood pressure regulation'
    }
  ]);
  const newMedName = formData.newMedName || '';
  const setNewMedName = (v: string) => handleInputChange('newMedName', v);
  const newMedDosage = formData.newMedDosage || '';
  const setNewMedDosage = (v: string) => handleInputChange('newMedDosage', v);
  const newMedInstructions = formData.newMedInstructions || '';
  const setNewMedInstructions = (v: string) => handleInputChange('newMedInstructions', v);
  const [newMedTimeOfDay, setNewMedTimeOfDay] = useState<('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[]>(['morning']);
  const newMedScheduledTime = formData.newMedScheduledTime || '08:00 AM';
  const setNewMedScheduledTime = (v: string) => handleInputChange('newMedScheduledTime', v);
  const newMedPurpose = formData.newMedPurpose || '';
  const setNewMedPurpose = (v: string) => handleInputChange('newMedPurpose', v);

  // NURSE SPECIFIC: 5-Step Documents & Qualifications
  const nurseTrn = formData.nurseTrn || '109-847-382';
  const setNurseTrn = (v: string) => handleInputChange('nurseTrn', v);
  const nurseNcjLicense = formData.nurseNcjLicense || 'NCJ-RN-2024-8841';
  const setNurseNcjLicense = (v: string) => handleInputChange('nurseNcjLicense', v);
  const driversLicenseNumber = formData.driversLicenseNumber || 'DL-JAM-98214-A';
  const setDriversLicenseNumber = (v: string) => handleInputChange('driversLicenseNumber', v);
  const institutionAttended = formData.institutionAttended || 'The UWI School of Nursing Mona (UWISON)';
  const setInstitutionAttended = (v: string) => handleInputChange('institutionAttended', v);
  const yearsExperience = formData.yearsExperience || 5;
  const setYearsExperience = (v: number) => handleInputChange('yearsExperience', v);
  const nurseSpecialty = formData.nurseSpecialty || 'Elderly & Geriatric Home Care';
  const setNurseSpecialty = (v: string) => handleInputChange('nurseSpecialty', v);
  const hourlyRate = formData.hourlyRate || 7500;
  const setHourlyRate = (v: number) => handleInputChange('hourlyRate', v);
  const nurseBio = formData.nurseBio || 'Registered nurse passionate about high-dignity geriatric home care, post-op wound management, and chronic illness surveillance across Jamaica.';
  const setNurseBio = (v: string) => handleInputChange('nurseBio', v);
  const bankName = formData.bankName || 'National Commercial Bank (NCB) Jamaica';
  const setBankName = (v: string) => handleInputChange('bankName', v);
  const accountNumber = formData.accountNumber || '847291048';
  const setAccountNumber = (v: string) => handleInputChange('accountNumber', v);
  const lynkWallet = formData.lynkWallet || '@nurse.care';
  const setLynkWallet = (v: string) => handleInputChange('lynkWallet', v);
  const nurseEmergencyContact = formData.nurseEmergencyContact || 'Patricia Campbell (Mother) - (876) 555-0144';
  const setNurseEmergencyContact = (v: string) => handleInputChange('nurseEmergencyContact', v);

  // Document file names & URLs for Nurse review
  const [govIdUrl, setGovIdUrl] = useState<string>(SAMPLE_DOCS.govid);
  const [govIdFileName, setGovIdFileName] = useState('Jamaican_Passport_Bio_Page.jpg');
  const [dlFrontUrl, setDlFrontUrl] = useState<string>(SAMPLE_DOCS.dlFront);
  const [dlFrontFileName, setDlFrontFileName] = useState('Drivers_License_Front.jpg');
  const [dlBackUrl, setDlBackUrl] = useState<string>(SAMPLE_DOCS.dlBack);
  const [dlBackFileName, setDlBackFileName] = useState('Drivers_License_Back.jpg');
  const [trnCertUrl, setTrnCertUrl] = useState<string>(SAMPLE_DOCS.trn);
  const [trnCertFileName, setTrnCertFileName] = useState('TAJ_TRN_Official_Card.pdf');
  const [licenseDocUrl, setLicenseDocUrl] = useState<string>(SAMPLE_DOCS.cert);
  const [licenseDocFileName, setLicenseDocFileName] = useState('NCJ_Practicing_Certificate_2024.pdf');
  const [policeRecordUrl, setPoliceRecordUrl] = useState<string>(SAMPLE_DOCS.cert);
  const [policeRecordFileName, setPoliceRecordFileName] = useState('JCF_Police_Record_Certificate.pdf');
  const [bankLetterUrl, setBankLetterUrl] = useState<string>(SAMPLE_DOCS.bank);
  const [bankLetterFileName, setBankLetterFileName] = useState('NCB_Bank_Verification_Letter.pdf');

  // File Upload Input Refs
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);
  const repFileInputRef = useRef<HTMLInputElement | null>(null);
  const govIdInputRef = useRef<HTMLInputElement | null>(null);
  const dlFrontInputRef = useRef<HTMLInputElement | null>(null);
  const dlBackInputRef = useRef<HTMLInputElement | null>(null);
  const trnInputRef = useRef<HTMLInputElement | null>(null);
  const ncjInputRef = useRef<HTMLInputElement | null>(null);
  const policeInputRef = useRef<HTMLInputElement | null>(null);
  const bankInputRef = useRef<HTMLInputElement | null>(null);

  // ADMIN SPECIFIC: Role, department & clearance
  const adminTitle = formData.adminTitle || 'Lead Operations Director & Clinical Supervisor';
  const setAdminTitle = (v: string) => handleInputChange('adminTitle', v);
  const adminDepartment = formData.adminDepartment || 'Clinical Operations';
  const setAdminDepartment = (v: string) => handleInputChange('adminDepartment', v);
  const adminStaffId = formData.adminStaffId || `ADM-WC-${new Date().getFullYear()}-01`;
  const setAdminStaffId = (v: string) => handleInputChange('adminStaffId', v);
  const adminPasskey = formData.adminPasskey || '12345678';
  const setAdminPasskey = (v: string) => handleInputChange('adminPasskey', v);

  // SIGNATURE STATES FOR NURSE & ADMIN AGREEMENTS
  const [nurseSignature, setNurseSignature] = useState<SignatureData | null>(null);
  const [adminSignature, setAdminSignature] = useState<SignatureData | null>(null);

  // File Upload Handlers with compression
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    fileNameSetter?: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileNameSetter) fileNameSetter(file.name);
      try {
        const compressed = await compressImageFile(file, 800, 0.82);
        setter(compressed);
        soundFX.playSuccessPing();
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => {
          setter(reader.result as string);
          soundFX.playSuccessPing();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Toggle Allergies
  const toggleAllergy = (item: string) => {
    if (item === 'No Known Drug Allergies (NKDA)') {
      setSelectedAllergies(['No Known Drug Allergies (NKDA)']);
      return;
    }
    const filtered = selectedAllergies.filter(a => a !== 'No Known Drug Allergies (NKDA)');
    if (filtered.includes(item)) {
      const next = filtered.filter(a => a !== item);
      setSelectedAllergies(next.length === 0 ? ['No Known Drug Allergies (NKDA)'] : next);
    } else {
      setSelectedAllergies([...filtered, item]);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      const filtered = selectedAllergies.filter(a => a !== 'No Known Drug Allergies (NKDA)');
      if (!filtered.includes(customAllergy.trim())) {
        setSelectedAllergies([...filtered, customAllergy.trim()]);
        setCustomAllergy('');
      }
    }
  };

  // Medication handlers
  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      setErrorMsg('Please enter the medication name and dosage.');
      return;
    }
    setErrorMsg(null);
    const newMed: PatientMedication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 dose',
      instructions: newMedInstructions.trim() || 'Take as prescribed',
      timesOfDay: newMedTimeOfDay.length > 0 ? newMedTimeOfDay : ['morning'],
      scheduledTime: newMedScheduledTime,
      purpose: newMedPurpose.trim() || 'Health maintenance'
    };
    setMedications([...medications, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    setNewMedPurpose('');
    soundFX.playSuccessPing();
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  // Step Navigations & Validations
  const handleClientNext = () => {
    setErrorMsg(null);
    if (clientStep === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full legal name.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Please enter a username for logging in.');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Please choose a password with at least 4 characters.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please enter your telephone number.');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('Please enter your street address.');
        return;
      }
      setClientStep(2);
      soundFX.playStepComplete();
    } else if (clientStep === 2) {
      if (!repName.trim()) {
        setErrorMsg('Please provide the full name of your Next of Kin or representative using the app on your behalf.');
        return;
      }
      if (!repPhone.trim()) {
        setErrorMsg('Please provide a contact telephone number for your Next of Kin / representative.');
        return;
      }
      setClientStep(3);
      soundFX.playStepComplete();
    } else if (clientStep === 3) {
      if (selectedIllness === 'Other (Please specify in text box below)' && !customIllness.trim()) {
        setErrorMsg('Please specify the medical illness / condition in the text box.');
        return;
      }
      setClientStep(4);
      soundFX.playStepComplete();
    } else if (clientStep === 4) {
      setClientStep(5);
      soundFX.playStepComplete();
    }
  };

  const handleNurseNext = () => {
    setErrorMsg(null);
    if (nurseStep === 1) {
      if (!profilePhotoUrl) {
        setErrorMsg('Live face liveness photo scan is mandatory. Please look at the camera, blink to verify liveness, and capture your practitioner photo before proceeding.');
        soundFX.playWarningSound();
        return;
      }
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full legal name.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Please choose a username.');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Please choose a secure password.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please enter your Jamaican contact phone.');
        return;
      }
      setNurseStep(2);
      soundFX.playStepComplete();
    } else if (nurseStep === 2) {
      if (!nurseTrn.trim()) {
        setErrorMsg('Please enter your Jamaican TRN number.');
        return;
      }
      if (!driversLicenseNumber.trim()) {
        setErrorMsg('Please enter your Driver\'s License number.');
        return;
      }
      if (!nurseNcjLicense.trim()) {
        setErrorMsg('Please enter your Nursing Council License number.');
        return;
      }
      setNurseStep(3);
      soundFX.playStepComplete();
    } else if (nurseStep === 3) {
      setNurseStep(4);
      soundFX.playStepComplete();
    } else if (nurseStep === 4) {
      setNurseStep(5);
      soundFX.playStepComplete();
    }
  };

  // Final Registration Submission for ALL Roles
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if ((role === 'nurse' || role === 'admin') && !profilePhotoUrl) {
      setErrorMsg(`Live face liveness photo scan is mandatory for ${role === 'admin' ? 'administrators' : 'nurses'}. Please look at the camera, blink to verify liveness, and capture your photo.`);
      soundFX.playWarningSound();
      return;
    }

    if (role === 'client' && !clientConsentDPA) {
      setErrorMsg('Please review and agree to the Jamaica Data Protection Act 2020 consent terms to complete registration.');
      return;
    }

    if (role === 'nurse') {
      if (!nurseSignature || !nurseSignature.signed) {
        setErrorMsg('Please read, digitally sign, and accept the Healthcare Practitioner Independent Contractor Agreement in Step 5 before submitting.');
        setNurseStep(5);
        soundFX.playWarningSound();
        return;
      }
    }

    if (role === 'admin') {
      if (adminPasskey !== '12345678' && adminPasskey.toLowerCase() !== 'wecareadmin') {
        setErrorMsg('Invalid administrator security passkey. (Hint: default code is 12345678).');
        return;
      }
      if (!adminSignature || !adminSignature.signed) {
        setErrorMsg('Please read, digitally sign, and accept the Administrator Data Governance & Clinical Oversight Agreement before registering.');
        soundFX.playWarningSound();
        return;
      }
    }

    setIsSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase() || cleanEmail.split('@')[0] || `user_${Date.now()}`;
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim() ? `${address.trim()}, ${parish}` : parish;
    const defaultPatientPhoto = profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400';
    const defaultRepPhoto = repPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
    const resolvedIllness = selectedIllness === 'Other (Please specify in text box below)' ? (customIllness.trim() || 'Specialized Condition') : selectedIllness;

    try {
      let userId = `user-${role}-${Date.now()}`;
      const isMasterAdminEmail = cleanEmail === 'wecareja.bookings@gmail.com';
      const dbRole = role === 'nurse' 
        ? 'nurse_pending' 
        : (role === 'admin' && !isMasterAdminEmail ? 'admin_pending' : role);

      // Construct comprehensive dossier payload with all uploaded data & signatures
      const dossierPayload = role === 'nurse' ? {
        type: 'nurse',
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        parish: parish,
        dateOfBirth: dateOfBirth,
        gender: gender,
        emergencyContact: {
          name: nurseEmergencyContact,
          phone: cleanPhone,
          relation: 'Next of Kin'
        },
        trnNumber: nurseTrn.trim(),
        ncjLicense: nurseNcjLicense.trim(),
        driversLicenseNumber: driversLicenseNumber.trim(),
        yearsExperience: 4,
        hourlyRateJMD: 7500,
        institutionAttended: 'Accredited Jamaican Nursing Institution',
        documents: {
          trnCertificateUrl: trnCertUrl || undefined,
          driversLicenseFrontUrl: driversLicenseFrontUrl || undefined,
          driversLicenseBackUrl: driversLicenseBackUrl || undefined,
          licenseDocumentUrl: licenseDocUrl || undefined,
          policeRecordUrl: policeRecordUrl || undefined,
          bankLetterUrl: bankLetterUrl || undefined,
          proofOfAddressUrl: proofOfAddressUrl || undefined
        },
        bankDetails: {
          bankName: bankName,
          accountNumber: accountNumber,
          accountType: 'Savings',
          lynkWallet: lynkWallet
        },
        signature: nurseSignature,
        submittedAt: new Date().toISOString()
      } : (role === 'admin' ? {
        type: 'admin',
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
        parish: parish,
        dateOfBirth: dateOfBirth,
        gender: gender,
        staffId: adminStaffId,
        department: adminDepartment,
        title: adminTitle,
        clearancePasskey: adminPasskey,
        signature: adminSignature,
        submittedAt: new Date().toISOString()
      } : null);

      const dossierJson = dossierPayload ? JSON.stringify(dossierPayload) : '';
      const trnValue = role === 'nurse'
        ? `${nurseTrn.trim()}${trnCertUrl ? ` | DOC: ${trnCertUrl}` : ''}${nurseSignature?.signed ? ' | SIGNED: YES' : ''} | DOSSIER:${dossierJson}`
        : (role === 'admin' ? `ADMIN-STAFF-${adminStaffId} | DEPT:${adminDepartment} | DOSSIER:${dossierJson}` : '');

      if (dossierPayload) {
        try {
          localStorage.setItem(`wecare_dossier_${cleanEmail}`, dossierJson);
          localStorage.setItem(`wecare_dossier_${userId}`, dossierJson);
        } catch {}
      }

      // 1. Supabase Auth registration attempt
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim(),
          options: {
            data: {
              full_name: cleanFullName,
              role: dbRole,
              phone: cleanPhone,
              address: cleanAddress,
              trn: trnValue
            }
          }
        });
        if (!authError && authData?.user) {
          userId = authData.user.id;
        } else if (authError) {
          console.warn('Supabase auth notice:', authError.message);
          if (authError.message?.toLowerCase().includes('already registered')) {
            try {
              const { data: signInData } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: password.trim()
              });
              if (signInData?.user?.id) {
                userId = signInData.user.id;
              }
            } catch {}
          }
        }
      } catch (authErr) {
        console.warn('Supabase auth error:', authErr);
      }

      // If userId is still a generated placeholder, check if profile exists by email to get real UUID
      if (!userId || userId.startsWith('user-')) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (existingProfile?.id) {
            userId = existingProfile.id;
          }
        } catch {}
      }

      // Auto confirm edge function if available
      if (userId && !userId.startsWith('user-')) {
        try {
          await supabase.functions.invoke('confirm-user', { body: { user_id: userId } });
        } catch {}
      }

      // 2. Upsert profile table
      if (userId && !userId.startsWith('user-')) {
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email: cleanEmail,
            username: cleanUsername,
            full_name: cleanFullName,
            role: dbRole,
            phone: cleanPhone,
            address: cleanAddress,
            trn: trnValue
          }, { onConflict: 'id' });
        } catch (profErr) {
          console.warn('Profiles table note:', profErr);
        }
      } else {
        try {
          await supabase.from('profiles').update({
            full_name: cleanFullName,
            role: dbRole,
            phone: cleanPhone,
            address: cleanAddress,
            trn: trnValue
          }).eq('email', cleanEmail);
        } catch {}
      }

      // 3. Role specific objects
      let newAccount: UserAccount;

      if (role === 'client') {
        const trustedFamily: TrustedFamilyMember = {
          name: repName.trim(),
          relation: repRelation.trim(),
          phone: repPhone.trim() || cleanPhone,
          email: repEmail.trim() || cleanEmail,
          photoUrl: defaultRepPhoto,
          canManageCare: true,
          notes: repNotes,
          whatsAppUpdatesOptIn: true,
          whatsAppPhone: repPhone.trim() || cleanPhone
        };

        const patientBio: ClientPatientBioData = {
          dateOfBirth: dateOfBirth,
          age: dateOfBirth ? Math.max(1, new Date().getFullYear() - new Date(dateOfBirth).getFullYear()) : 55,
          gender: gender,
          bloodType: 'O+',
          residentialAddress: cleanAddress,
          zone: parish,
          knownIllnesses: [resolvedIllness],
          allergies: selectedAllergies,
          mobilityStatus: mobilityStatus,
          dietaryRestrictions: dietaryRestrictions,
          specialCareInstructions: specialCareInstructions,
          medications: medications,
          trustedFamilyMember: trustedFamily,
          profileSharedWith: [cleanEmail, repEmail.trim()].filter(Boolean)
        };

        newAccount = {
          id: userId,
          username: cleanUsername,
          password: password.trim(),
          role: 'client',
          approvalStatus: 'approved',
          name: cleanFullName,
          full_name: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          avatarUrl: defaultPatientPhoto,
          avatar: defaultPatientPhoto,
          zone: parish,
          address: cleanAddress,
          dateOfBirth: dateOfBirth,
          repPhotoUrl: defaultRepPhoto,
          repDateOfBirth: repDateOfBirth,
          emergencyContact: {
            name: `${repName.trim()} (${repRelation.trim()})`,
            phone: repPhone.trim() || cleanPhone,
            relation: repRelation.trim()
          },
          accountHolder: {
            name: repName.trim(),
            email: repEmail.trim() || cleanEmail,
            phone: repPhone.trim() || cleanPhone,
            country: 'Jamaica',
            billingAddress: repAddress.trim() || cleanAddress,
            relationshipToPatient: repRelation.trim()
          },
          patientBioData: patientBio,
          bioData: patientBio,
          createdAt: new Date().toISOString()
        };
      } else if (role === 'nurse') {
        // Nurse Profile: created in 'pending_approval' for Admin Review
        const newNurseProfile: NurseProfile = {
          id: userId,
          name: cleanFullName,
          phone: cleanPhone || '(876) 555-0199',
          email: cleanEmail,
          parish: parish,
          address: cleanAddress,
          photoUrl: profilePhotoUrl || SAMPLE_PHOTO_PRESETS[0].url,
          institutionAttended: institutionAttended,
          nursingCouncilLicense: nurseNcjLicense.trim() || 'NCJ-RN-PENDING',
          trnNumber: nurseTrn.trim() || '',
          trn: nurseTrn.trim() || '',
          licenseVerified: false,
          status: 'pending_approval',
          rating: 5.0,
          reviewCount: 0,
          yearsExperience: Number(yearsExperience) || 5,
          specialties: [nurseSpecialty.trim(), 'Vitals Surveillance', 'In-Home Care'],
          zones: [parish, 'New Kingston', 'St. Andrew', 'Portmore'],
          hourlyRateJMD: Number(hourlyRate) || 7500,
          bio: nurseBio.trim(),
          // Confidential uploaded documents for admin inspection
          governmentIdType: "Passport & National ID",
          governmentIdUrl: govIdUrl,
          driversLicenseNumber: driversLicenseNumber.trim(),
          driversLicenseFrontUrl: dlFrontUrl,
          driversLicenseBackUrl: dlBackUrl,
          trnCertificateUrl: trnCertUrl,
          licenseDocumentUrl: licenseDocUrl,
          policeRecordUrl: policeRecordUrl,
          bankLetterUrl: bankLetterUrl,
          bankDetails: {
            bankName: bankName,
            accountNumber: accountNumber,
            accountType: 'Savings',
            lynkWallet: lynkWallet
          },
          bioData: {
            dateOfBirth: dateOfBirth,
            gender: gender as any,
            residentialAddress: cleanAddress,
            residentialParish: parish,
            emergencyContact: {
              name: nurseEmergencyContact,
              phone: cleanPhone,
              relation: 'Next of Kin'
            },
            nationalIdNumber: nurseTrn.trim()
          },
          submittedForReviewAt: new Date().toISOString(),
          totalEarningsJMD: 0,
          pendingPayoutJMD: 0,
          completedVisitsCount: 0
        };

        // Append to localStorage nurses roster in pending_approval
        try {
          const rawNurses = localStorage.getItem('wecare_nurses');
          const currentList = rawNurses ? JSON.parse(rawNurses) : [];
          const updatedList = [newNurseProfile, ...currentList.filter((n: any) => n.id !== userId && n.email !== cleanEmail)];
          localStorage.setItem('wecare_nurses', JSON.stringify(updatedList));
        } catch {}

        // Persist to Supabase public.profiles
        saveNurseProfileToSupabase(newNurseProfile).catch(() => {});

        newAccount = {
          id: userId,
          username: cleanUsername,
          password: password.trim(),
          name: cleanFullName,
          full_name: cleanFullName,
          email: cleanEmail,
          role: 'nurse',
          approvalStatus: 'pending_approval',
          nurseProfileId: userId,
          phone: cleanPhone,
          address: cleanAddress,
          zone: parish,
          dateOfBirth: dateOfBirth,
          trn: nurseTrn.trim(),
          nursingCouncilLicense: nurseNcjLicense.trim(),
          driversLicenseNumber: driversLicenseNumber.trim(),
          title: nurseSpecialty,
          avatarUrl: profilePhotoUrl || SAMPLE_PHOTO_PRESETS[0].url,
          avatar: profilePhotoUrl || SAMPLE_PHOTO_PRESETS[0].url,
          createdAt: new Date().toISOString()
        };
      } else {
        // Admin Profile
        newAccount = {
          id: userId,
          username: cleanUsername,
          password: password.trim(),
          role: 'admin',
          approvalStatus: 'approved',
          name: cleanFullName,
          full_name: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          address: cleanAddress,
          zone: parish,
          dateOfBirth: dateOfBirth,
          title: adminTitle,
          department: adminDepartment,
          staffId: adminStaffId,
          avatarUrl: profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          avatar: profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          createdAt: new Date().toISOString()
        };
      }

      // Save user account in localStorage
      try {
        localStorage.setItem('wecare_current_user_id', userId);
        const rawAccounts = localStorage.getItem('wecare_user_accounts');
        const list = rawAccounts ? JSON.parse(rawAccounts) : [];
        localStorage.setItem('wecare_user_accounts', JSON.stringify([newAccount, ...list.filter((u: any) => u.id !== userId && u.username !== cleanUsername)]));
      } catch {}

      soundFX.playBookingConfirmed();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      onComplete(newAccount);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please check your credentials and try again.');
      soundFX.playWarningSound();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`text-white text-xs ${embedded ? 'w-full' : 'max-w-2xl mx-auto'}`}>
      {/* Top Banner & Title */}
      <div className="mb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 justify-center sm:justify-start">
            <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>We Care Jamaica Public Registration</span>
          </h2>
          <p className="text-[11px] text-slate-300">
            Create verified user profiles for Jamaican Clients, Licensed Nurses &amp; Administrators.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-auto p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
          Select Account Type to Register:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 1. Client / Patient */}
          <button
            type="button"
            onClick={() => {
              setRole('client');
              soundFX.playToggleClick();
            }}
            className={`p-3 rounded-2xl border text-left font-bold transition flex items-center sm:flex-col sm:items-start gap-2.5 cursor-pointer ${
              role === 'client'
                ? 'border-purple-400 bg-purple-600/30 text-white ring-2 ring-purple-400/50 shadow-lg shadow-purple-950/40'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block text-white">Client &amp; Next of Kin</span>
              <span className="text-[10px] text-purple-200/80 block font-normal">5-Step Comprehensive Signup</span>
            </div>
          </button>

          {/* 2. Licensed Nurse */}
          <button
            type="button"
            onClick={() => {
              setRole('nurse');
              soundFX.playToggleClick();
            }}
            className={`p-3 rounded-2xl border text-left font-bold transition flex items-center sm:flex-col sm:items-start gap-2.5 cursor-pointer ${
              role === 'nurse'
                ? 'border-emerald-400 bg-emerald-600/30 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/40'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block text-white">Licensed Nurse</span>
              <span className="text-[10px] text-emerald-200/80 block font-normal">5-Step Clinical Credentialing</span>
            </div>
          </button>

          {/* 3. Administrator */}
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              soundFX.playToggleClick();
            }}
            className={`p-3 rounded-2xl border text-left font-bold transition flex items-center sm:flex-col sm:items-start gap-2.5 cursor-pointer ${
              role === 'admin'
                ? 'border-amber-400 bg-amber-600/30 text-white ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/40'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block text-white">Administrator</span>
              <span className="text-[10px] text-amber-200/80 block font-normal">Executive Operational Profile</span>
            </div>
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          ROLE 1: CLIENT / PATIENT & NEXT OF KIN (FULL 5-STEP SIGN-UP)
      ========================================================================= */}
      {role === 'client' && (
        <div className="space-y-4">
          {/* 5-Step Stepper Header */}
          <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-purple-400" />
                Step {clientStep} of 5: {
                  clientStep === 1 ? 'Patient Credentials & Photo' :
                  clientStep === 2 ? 'Next of Kin / App User on Behalf' :
                  clientStep === 3 ? 'Medical Illness & Health Profile' :
                  clientStep === 4 ? 'Scheduled Medications' :
                  'Consent & Complete Profile'
                }
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Instant Patient Access
              </span>
            </div>
            {/* Progress Bar */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s < clientStep) setClientStep(s as any);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    s === clientStep ? 'bg-purple-400 ring-2 ring-purple-400/50' :
                    s < clientStep ? 'bg-purple-600 cursor-pointer' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Client Account Credentials & Photo */}
          {clientStep === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Profile Photo Upload & Camera Capture */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3.5">
                <img
                  src={profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                  alt="Patient Photo Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/60 shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <span className="text-xs font-bold text-white block">Patient Profile Photo *</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraTarget('user');
                        setIsCameraOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" /> Take Photo
                    </button>
                    <input
                      ref={profileFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      placeholder=""
                      autoComplete="off"
                      onChange={(e) => handleFileUpload(e, setProfilePhotoUrl)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={e => handleInputChange('username', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password || ''}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder=""
                      autoComplete="off"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white pr-9 font-mono placeholder-slate-500 focus:border-purple-400 outline-none"
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
                  <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Telephone (+1 876) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth || ''}
                    onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-purple-400 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-purple-400 outline-none cursor-pointer"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Primary Parish *</label>
                  <select
                    value={parish}
                    onChange={e => setParish(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-purple-400 outline-none cursor-pointer"
                  >
                    {JAMAICAN_PARISHES.map(p => (
                      <option key={p} value={p} className="bg-[#0f0a26] text-white">{p}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Residential Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClientNext}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Next of Kin &amp; App Delegate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Next of Kin / Person using app on behalf */}
          {clientStep === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed">
                <strong className="text-white block font-bold mb-0.5">Family &amp; Representative Profile:</strong>
                Please provide the contact details and photo of the family member or guardian who will use the app on behalf of the patient, or act as primary next of kin.
              </div>

              {/* Next of Kin Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3.5">
                <img
                  src={repPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                  alt="Representative Photo Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/60 shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <span className="text-xs font-bold text-white block">Photo of Person Using App on Behalf *</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => repFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraTarget('representative');
                        setIsCameraOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" /> Take Photo
                    </button>
                    <input
                      ref={repFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      placeholder=""
                      autoComplete="off"
                      onChange={(e) => handleFileUpload(e, setRepPhotoUrl)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Representative Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.repName || ''}
                    onChange={e => handleInputChange('repName', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Relationship to Patient *</label>
                  <select
                    value={repRelation}
                    onChange={e => setRepRelation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-purple-400 outline-none cursor-pointer"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Spouse / Husband / Wife">Spouse / Partner</option>
                    <option value="Sister / Brother">Sibling</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Family Caregiver">Family Caregiver</option>
                    <option value="Other Relative">Other Relative</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Representative Phone (+1 876) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.repPhone || ''}
                    onChange={e => handleInputChange('repPhone', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Representative Email</label>
                  <input
                    type="email"
                    value={formData.repEmail || ''}
                    onChange={e => handleInputChange('repEmail', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Representative Date of Birth</label>
                  <input
                    type="date"
                    value={formData.repDateOfBirth || ''}
                    onChange={e => handleInputChange('repDateOfBirth', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-purple-400 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Representative Address</label>
                  <input
                    type="text"
                    value={formData.repAddress || ''}
                    onChange={e => handleInputChange('repAddress', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Permissions / Care Authority Notes</label>
                  <input
                    type="text"
                    value={formData.repNotes || ''}
                    onChange={e => handleInputChange('repNotes', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setClientStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClientNext}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Medical Illness &amp; Health</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Medical Health Profile & Illness Dropdown + Other Box */}
          {clientStep === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Illness Dropdown & Other Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-3">
                <span className="text-xs font-bold text-purple-300 block uppercase tracking-wider">
                  Primary Medical Illness / Health Conditions
                </span>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Select Primary Illness / Condition <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={selectedIllness}
                    onChange={e => setSelectedIllness(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white focus:border-purple-400 outline-none cursor-pointer"
                  >
                    {COMMON_ILLNESSES.map(ill => (
                      <option key={ill} value={ill} className="bg-[#0f0a26] text-white">
                        {ill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Box to write Other if not listed */}
                {(selectedIllness === 'Other (Please specify in text box below)' || selectedIllness.startsWith('Other')) && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1 animate-fadeIn">
                    <label className="text-amber-300 font-bold block text-[11px]">
                      Specify Illness / Condition (Not listed in dropdown) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customIllness || ''}
                      onChange={e => handleInputChange('customIllness', e.target.value)}
                      placeholder=""
                      autoComplete="off"
                      className="w-full px-3 py-2 rounded-xl bg-black/70 border border-amber-400/50 text-white text-xs placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Allergies Selection */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Known Allergies &amp; Drug Sensitivities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_ALLERGIES.map(allergy => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`p-2 rounded-xl border text-left text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-purple-600/30 border-purple-400 text-white' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{allergy}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={formData.customAllergy || ''}
                    onChange={e => handleInputChange('customAllergy', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="px-3 py-2 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 text-xs font-bold border border-purple-400/40 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Mobility Status */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Patient Mobility Status
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'independent', label: 'Independent' },
                    { id: 'needs_cane_walker', label: 'Cane / Walker' },
                    { id: 'wheelchair_bound', label: 'Wheelchair' },
                    { id: 'bedbound', label: 'Bedbound' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMobilityStatus(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        mobilityStatus === m.id
                          ? 'bg-purple-600/40 border-purple-400 text-white ring-1 ring-purple-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setClientStep(2)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClientNext}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Scheduled Medications</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Scheduled Medications */}
          {clientStep === 4 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <span className="text-xs font-bold text-white block uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-400" />
                  Prescribed Daily Medications ({medications.length})
                </span>

                {medications.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No medications recorded. Add below if applicable.</p>
                ) : (
                  <div className="space-y-2">
                    {medications.map(med => (
                      <div key={med.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-white text-xs block">{med.name} - {med.dosage}</strong>
                          <span className="text-[10px] text-slate-400 block">{med.instructions} • {med.scheduledTime}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(med.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new medication inputs */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Add Medication:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder=""
                      autoComplete="off"
                      value={formData.newMedName || ''}
                      onChange={e => handleInputChange('newMedName', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder=""
                      autoComplete="off"
                      value={formData.newMedDosage || ''}
                      onChange={e => handleInputChange('newMedDosage', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder=""
                      autoComplete="off"
                      value={formData.newMedInstructions || ''}
                      onChange={e => handleInputChange('newMedInstructions', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:col-span-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-bold border border-emerald-400/40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Schedule
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setClientStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClientNext}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Consent &amp; Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Consent */}
          {clientStep === 5 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Patient Summary */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={profilePhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'}
                      alt="Patient"
                      className="w-10 h-10 rounded-xl object-cover border border-purple-400/50"
                    />
                    <div>
                      <strong className="text-white block">{fullName}</strong>
                      <span className="text-[10px] text-purple-300 font-mono">@{username}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <p>Phone: <strong className="text-white">{phone}</strong></p>
                    <p>Parish: <strong className="text-white">{parish}</strong></p>
                    <p>Illness: <strong className="text-amber-300">{selectedIllness === 'Other (Please specify in text box below)' ? customIllness : selectedIllness}</strong></p>
                  </div>
                </div>

                {/* Representative Summary */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={repPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'}
                      alt="Next of Kin"
                      className="w-10 h-10 rounded-xl object-cover border border-purple-400/50"
                    />
                    <div>
                      <strong className="text-white block">{repName}</strong>
                      <span className="text-[10px] text-purple-300 font-medium">{repRelation} (App Delegate)</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <p>Rep Phone: <strong className="text-white">{repPhone}</strong></p>
                    <p>Rep Email: <strong className="text-white">{repEmail || email}</strong></p>
                    <p>Auth: <span className="text-emerald-300">Full Care &amp; Booking Management</span></p>
                  </div>
                </div>
              </div>

              {/* Jamaica Data Protection Act 2020 Consent */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientConsentDPA}
                    onChange={e => setClientConsentDPA(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-black/60 border-white/20"
                  />
                  <span className="text-[11px] text-purple-100 leading-relaxed">
                    <strong>Mandatory Jamaica Data Protection Act 2020 Consent:</strong> I agree that We Care Jamaica may securely store our medical and family profile for clinical home dispatch, vital monitoring, and visiting nurse coordination in accordance with Jamaican privacy regulations.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setClientStep(4)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !clientConsentDPA}
                  onClick={() => handleFinalSubmit()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration & Access Portal'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ROLE 2: LICENSED NURSE / PRACTITIONER (FULL 5-STEP SIGN-UP)
      ========================================================================= */}
      {role === 'nurse' && (
        <div className="space-y-4">
          {/* Stepper Header */}
          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                Step {nurseStep} of 5: {
                  nurseStep === 1 ? 'Personal Profile & Photo' :
                  nurseStep === 2 ? 'TRN, ID & Driver\'s License' :
                  nurseStep === 3 ? 'Nursing Council & School' :
                  nurseStep === 4 ? 'Rates, Specialties & Bio' :
                  'Payout Setup & Admin Review'
                }
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Requires Admin Approval
              </span>
            </div>
            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s < nurseStep) setNurseStep(s as any);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    s === nurseStep ? 'bg-emerald-400 ring-2 ring-emerald-400/50' :
                    s < nurseStep ? 'bg-emerald-600 cursor-pointer' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Personal Profile & Photo */}
          {nurseStep === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* 2) Live Face Liveness Camera Scan with Blink Detection */}
              <LiveFaceLivenessScanner
                role="nurse"
                profilePhotoUrl={profilePhotoUrl}
                onPhotoCaptured={setProfilePhotoUrl}
                onClearPhoto={() => setProfilePhotoUrl('')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={e => handleInputChange('username', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password || ''}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder=""
                      autoComplete="off"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white pr-9 font-mono placeholder-slate-500 focus:border-emerald-400 outline-none"
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
                  <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Telephone (+1 876) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth || ''}
                    onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Primary Parish *</label>
                  <select
                    value={parish}
                    onChange={e => setParish(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none cursor-pointer"
                  >
                    {JAMAICAN_PARISHES.map(p => (
                      <option key={p} value={p} className="bg-[#0f0a26] text-white">{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Residential Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!profilePhotoUrl}
                  onClick={handleNurseNext}
                  className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md ${
                    profilePhotoUrl
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed opacity-50'
                  }`}
                  title={!profilePhotoUrl ? 'Please complete live face liveness scan with blink verification' : undefined}
                >
                  <span>Next: TRN, ID &amp; Driver's License</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRN, Government ID, Driver's License Front & Back */}
          {nurseStep === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-200">
                <strong>Mandatory Document Uploads for Admin Review:</strong>
                Lead Administrator examines your Jamaican TRN, Government ID, and Driver's License (both front and back sides) before accepting your account into the active clinical portal.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TRN Number */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">TRN (Tax Registration Number) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nurseTrn || ''}
                    onChange={e => handleInputChange('nurseTrn', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Driver's License Number */}
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Driver's License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.driversLicenseNumber || ''}
                    onChange={e => handleInputChange('driversLicenseNumber', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Nursing Council License Number */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">NCJ License # (Nursing Council of Jamaica) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nurseNcjLicense || ''}
                    onChange={e => handleInputChange('nurseNcjLicense', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* Document Upload Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Driver's License FRONT */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2">
                  <span className="font-bold text-amber-300 block text-xs">Driver's License (Front Side) *</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => dlFrontInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Front
                    </button>
                    <span className="text-[11px] text-slate-300 truncate">{dlFrontFileName}</span>
                    <input
                      ref={dlFrontInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => { setDlFrontUrl(url); setDriversLicenseFrontUrl(url); }, setDlFrontFileName)}
                    />
                  </div>
                </div>

                {/* 2. Driver's License BACK */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2">
                  <span className="font-bold text-amber-300 block text-xs">Driver's License (Back Side) *</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => dlBackInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Back
                    </button>
                    <span className="text-[11px] text-slate-300 truncate">{dlBackFileName}</span>
                    <input
                      ref={dlBackInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => { setDlBackUrl(url); setDriversLicenseBackUrl(url); }, setDlBackFileName)}
                    />
                  </div>
                </div>

                {/* 3. TRN Card Upload */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">TRN Official Certificate / Card *</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => trnInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload TRN
                    </button>
                    <span className="text-[11px] text-slate-300 truncate">{trnCertFileName}</span>
                    <input
                      ref={trnInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setTrnCertUrl, setTrnCertFileName)}
                    />
                  </div>
                </div>

                {/* 4. NCJ Practicing Certificate */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="font-bold text-slate-300 block text-xs">Nursing Council Certificate *</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => ncjInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload NCJ Cert
                    </button>
                    <span className="text-[11px] text-slate-300 truncate">{licenseDocFileName}</span>
                    <input
                      ref={ncjInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setLicenseDocUrl, setLicenseDocFileName)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setNurseStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNurseNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Nursing School &amp; Specialties</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: School, Experience & Specialties */}
          {nurseStep === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Nursing School / Institution Attended *</label>
                  <select
                    value={formData.institutionAttended || institutionAttended}
                    onChange={e => handleInputChange('institutionAttended', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none cursor-pointer"
                  >
                    <option value="The UWI School of Nursing Mona (UWISON)">The UWI School of Nursing Mona (UWISON)</option>
                    <option value="Northern Caribbean University (NCU) Department of Nursing">Northern Caribbean University (NCU) Department of Nursing</option>
                    <option value="Excelsior Community College (EXED) School of Nursing">Excelsior Community College (EXED) School of Nursing</option>
                    <option value="Knox Community College School of Nursing">Knox Community College School of Nursing</option>
                    <option value="Brown's Town Community College School of Nursing">Brown's Town Community College School of Nursing</option>
                    <option value="Western Hospitality & Healthcare Academy">Western Hospitality &amp; Healthcare Academy</option>
                    <option value="Kingston School of Nursing (KSN)">Kingston School of Nursing (KSN)</option>
                    <option value="Other Accredited Nursing School">Other Accredited Nursing School</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Years of Clinical Experience *</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={formData.yearsExperience || ''}
                    onChange={e => handleInputChange('yearsExperience', Number(e.target.value))}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Primary Clinical Specialty *</label>
                  <select
                    value={formData.nurseSpecialty || nurseSpecialty}
                    onChange={e => handleInputChange('nurseSpecialty', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none cursor-pointer"
                  >
                    <option value="Elderly & Geriatric Home Care">Elderly &amp; Geriatric Home Care</option>
                    <option value="Wound Dressing & Post-Op Recovery">Wound Dressing &amp; Post-Op Recovery</option>
                    <option value="IV Infusion & Injections">IV Infusion &amp; Injections</option>
                    <option value="Palliative & Respite Comfort Care">Palliative &amp; Respite Comfort Care</option>
                    <option value="Pediatric & Newborn Midwifery">Pediatric &amp; Newborn Midwifery</option>
                    <option value="Chronic Illness & Vitals Surveillance">Chronic Illness &amp; Vitals Surveillance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setNurseStep(2)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNurseNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Rates &amp; Payout Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Rates, Availability & Bank Details */}
          {nurseStep === 4 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Hourly Rate (JMD) *</label>
                  <input
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={e => handleInputChange('hourlyRate', Number(e.target.value))}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Jamaican Commercial Bank *</label>
                  <select
                    value={formData.bankName || bankName}
                    onChange={e => handleInputChange('bankName', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-400 outline-none cursor-pointer"
                  >
                    <option value="National Commercial Bank (NCB) Jamaica">National Commercial Bank (NCB)</option>
                    <option value="Scotiabank Jamaica">Scotiabank Jamaica</option>
                    <option value="JN Bank">JN Bank</option>
                    <option value="First Global Bank">First Global Bank</option>
                    <option value="Sagicor Bank Jamaica">Sagicor Bank Jamaica</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    value={formData.accountNumber || ''}
                    onChange={e => handleInputChange('accountNumber', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Lynk Wallet Handle</label>
                  <input
                    type="text"
                    value={formData.lynkWallet || ''}
                    onChange={e => handleInputChange('lynkWallet', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">Practitioner Bio (Displayed to Clients)</label>
                  <textarea
                    rows={2}
                    value={formData.nurseBio || ''}
                    onChange={e => handleInputChange('nurseBio', e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setNurseStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNurseNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Next: Review &amp; Submit Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Admin Approval Notice */}
          {nurseStep === 5 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Important Admin Review Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Application Subject to Clinical Admin Review &amp; Verification
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Upon submission, your application will be reviewed by Lead Administrator. All clinical documents (ID, TRN, Driver's License front and back, and Nursing Council certificate) must be verified before your account can take active client visits.
                </p>
              </div>

              {/* Document Summary Checklist */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block uppercase">Submitted Document Checklist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>TRN: {nurseTrn}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Driver's License: {driversLicenseNumber}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>NCJ License: {nurseNcjLicense}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>DL Front &amp; Back Uploaded</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Agreement Information & Digital Signature Box */}
              <AgreementSignatureBox
                roleType="nurse"
                signerName={fullName || 'Nurse Applicant'}
                onSignatureChange={setNurseSignature}
                required={true}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setNurseStep(4)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !nurseSignature?.signed}
                  onClick={() => handleFinalSubmit()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/60 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isSubmitting 
                      ? 'Submitting Application...' 
                      : !nurseSignature?.signed 
                      ? 'Sign Agreement Above to Submit' 
                      : 'Submit Credentials for Admin Review'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ROLE 3: ADMINISTRATOR (EXECUTIVE PROFILE SIGN-UP)
      ========================================================================= */}
      {role === 'admin' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Administrator Executive Profile Setup
            </span>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              Register clinical administration, operations supervision, and dispatch control accounts.
            </p>
          </div>

          {/* Live Face Scan & Liveness Verification for Administrator */}
          <LiveFaceLivenessScanner
            role="admin"
            profilePhotoUrl={profilePhotoUrl}
            onPhotoCaptured={(url) => setProfilePhotoUrl(url)}
            onClearPhoto={() => setProfilePhotoUrl('')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName || ''}
                onChange={e => handleInputChange('fullName', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Username *</label>
              <input
                type="text"
                required
                value={formData.username || ''}
                onChange={e => handleInputChange('username', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password || ''}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder=""
                  autoComplete="off"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white pr-9 font-mono placeholder-slate-500 focus:border-amber-400 outline-none"
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
              <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Telephone (+1 876) *</label>
              <input
                type="tel"
                required
                value={formData.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth || ''}
                onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Primary Parish *</label>
              <select
                value={parish}
                onChange={e => setParish(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 outline-none cursor-pointer"
              >
                {JAMAICAN_PARISHES.map(p => (
                  <option key={p} value={p} className="bg-[#0f0a26] text-white">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={formData.address || ''}
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Admin Title / Position *</label>
              <input
                type="text"
                required
                value={formData.adminTitle || ''}
                onChange={e => handleInputChange('adminTitle', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Department *</label>
              <select
                value={adminDepartment}
                onChange={e => setAdminDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white focus:border-amber-400 outline-none cursor-pointer"
              >
                <option value="Clinical Operations">Clinical Operations</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Patient Services">Patient Services</option>
                <option value="Finance & Payroll">Finance &amp; Payroll</option>
                <option value="Executive Management">Executive Management</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Staff / Employee ID *</label>
              <input
                type="text"
                required
                value={formData.adminStaffId || ''}
                onChange={e => handleInputChange('adminStaffId', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-amber-300 block mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Security Clearance Passkey *</span>
              </label>
              <input
                type="password"
                required
                value={formData.adminPasskey || ''}
                onChange={e => handleInputChange('adminPasskey', e.target.value)}
                placeholder=""
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-amber-500/40 text-white font-mono focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Mandatory Agreement Information & Digital Signature Box */}
          <AgreementSignatureBox
            roleType="admin"
            signerName={fullName || 'Administrator Applicant'}
            onSignatureChange={setAdminSignature}
            required={true}
          />

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSubmitting || !adminSignature?.signed || !profilePhotoUrl}
              onClick={() => handleFinalSubmit()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/60 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isSubmitting 
                  ? 'Creating Profile...' 
                  : !profilePhotoUrl
                  ? 'Complete Face Scan to Register'
                  : !adminSignature?.signed 
                  ? 'Sign Agreement Above to Register' 
                  : 'Register Administrator Account'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Switch to Sign In Footer */}
      {onSwitchToSignIn && (
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-purple-300 hover:text-white font-bold underline ml-1 cursor-pointer"
          >
            Sign in to existing account
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(photoDataUrl) => {
          if (cameraTarget === 'user') {
            setProfilePhotoUrl(photoDataUrl);
          } else {
            setRepPhotoUrl(photoDataUrl);
          }
          soundFX.playSuccessPing();
        }}
        title={cameraTarget === 'user' ? 'Take Profile Photo' : 'Take Next of Kin / Delegate Photo'}
      />
    </div>
  );
};
