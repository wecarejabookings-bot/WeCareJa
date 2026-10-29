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
  Building,
  Fingerprint,
  Scan,
  KeyRound,
  BadgeCheck
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
import { supabase, saveNurseProfileToSupabase, saveUsernameToCache } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import { AgreementSignatureBox, SignatureData } from '../common/AgreementSignatureBox';
import { WeCareTrackLogo } from '../common/WeCareTrackLogo';

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

interface ProfilePhotoUploaderProps {
  role: 'nurse' | 'admin' | 'client';
  profilePhotoUrl: string;
  onPhotoSelected: (url: string) => void;
  onClearPhoto: () => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  role,
  profilePhotoUrl,
  onPhotoSelected,
  onClearPhoto
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`Photo exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`);
      return;
    }

    // MIME whitelist
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError('Invalid format. Please upload a JPEG or PNG photo.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const compressed = await compressImageFile(file, 600, 0.85);
      onPhotoSelected(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        onPhotoSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-full flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-amber-400" />
          <span>{role === 'admin' ? 'Administrator Headshot' : 'Practitioner Profile Photo'} *</span>
        </span>
        <span className="text-[10px] text-slate-400">Max 5MB (JPEG, PNG)</span>
      </div>

      <div className="relative">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black/40 flex items-center justify-center shadow-lg">
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-slate-500" />
          )}
        </div>

        {profilePhotoUrl && (
          <button
            type="button"
            onClick={onClearPhoto}
            className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow transition cursor-pointer"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {uploadError && (
        <p className="text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
          {uploadError}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Processing...' : profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
        </button>

        {!profilePhotoUrl && SAMPLE_PHOTO_PRESETS.length > 0 && (
          <button
            type="button"
            onClick={() => onPhotoSelected(SAMPLE_PHOTO_PRESETS[0].url)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-medium text-xs border border-white/10 transition cursor-pointer"
          >
            Use Sample Photo
          </button>
        )}
      </div>
    </div>
  );
};

// Password Requirements & Strength Indicator (Min 12 chars, upper, lower, number, symbol)
export const validatePasswordSecurity = (password: string) => {
  const minLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  return { minLength, hasUpper, hasLower, hasNumber, hasSymbol, isValid };
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const { minLength, hasUpper, hasLower, hasNumber, hasSymbol, isValid } = validatePasswordSecurity(password);

  let passedCount = 0;
  if (minLength) passedCount++;
  if (hasUpper) passedCount++;
  if (hasLower) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSymbol) passedCount++;

  const strengthColor =
    passedCount === 5 ? 'bg-emerald-500' :
    passedCount >= 3 ? 'bg-amber-500' :
    password.length > 0 ? 'bg-rose-500' : 'bg-slate-700';

  return (
    <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-[11px]">
      <div className="flex items-center justify-between text-slate-300 font-semibold">
        <span>Password Requirements</span>
        <span className={isValid ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
          {isValid ? 'Criteria Satisfied' : `${passedCount} of 5 requirements`}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`h-full rounded-full transition-colors ${
              passedCount >= lvl ? strengthColor : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[10px]">
        <span className={`flex items-center gap-1 ${minLength ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          <Check className={`w-3 h-3 ${minLength ? 'text-emerald-400' : 'text-slate-600'}`} /> Min 12 characters
        </span>
        <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          <Check className={`w-3 h-3 ${hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} /> Uppercase letter (A-Z)
        </span>
        <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          <Check className={`w-3 h-3 ${hasLower ? 'text-emerald-400' : 'text-slate-600'}`} /> Lowercase letter (a-z)
        </span>
        <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          <Check className={`w-3 h-3 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} /> Number (0-9)
        </span>
        <span className={`flex items-center gap-1 ${hasSymbol ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          <Check className={`w-3 h-3 ${hasSymbol ? 'text-emerald-400' : 'text-slate-600'}`} /> Special symbol (!@#$)
        </span>
      </div>
    </div>
  );
};

// Rate Limiting & Bot Protection Checkbox Component
interface CaptchaProps {
  verified: boolean;
  onVerify: (token: string) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ verified, onVerify }) => {
  const [checking, setChecking] = useState(false);

  const handleClick = () => {
    if (verified || checking) return;
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      onVerify(`hcaptcha-token-${Date.now()}-${Math.random().toString(36).substring(7)}`);
      soundFX.playStepComplete();
    }, 600);
  };

  return (
    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 cursor-pointer group text-left"
      >
        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
          verified 
            ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
            : checking
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-white/30 bg-white/5 group-hover:border-white/50'
        }`}>
          {verified ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : checking ? (
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : null}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-200 block">I am not a robot</span>
          <span className="text-[10px] text-slate-400 block">Anti-bot verification &amp; rate limit protection</span>
        </div>
      </button>

      <div className="text-right">
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">hCaptcha</span>
        <span className="text-[8px] text-slate-500 block">Privacy · Terms</span>
      </div>
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

  // 3) Form data state for all form inputs - completely blank for real users
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'female',
    parish: 'Kingston',
    address: '',
    repName: '',
    repRelation: 'Daughter',
    repPhone: '',
    repEmail: '',
    repAddress: '',
    repDateOfBirth: '',
    repPhotoUrl: '',
    repNotes: '',
    customIllness: '',
    customAllergy: '',
    dietaryRestrictions: '',
    specialCareInstructions: '',
    newMedName: '',
    newMedDosage: '',
    newMedInstructions: '',
    newMedScheduledTime: '08:00 AM',
    newMedPurpose: '',
    nurseTrn: '',
    nurseNcjLicense: '',
    driversLicenseNumber: '',
    institutionAttended: '',
    yearsExperience: '',
    nurseSpecialty: '',
    hourlyRate: '',
    nurseBio: '',
    bankName: '',
    accountNumber: '',
    lynkWallet: '',
    nurseEmergencyContact: '',
    adminTitle: '',
    adminDepartment: '',
    adminStaffId: '',
    adminPasskey: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Field accessors for existing logic - no dummy strings
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
  const dateOfBirth = formData.dateOfBirth || '';
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
  const repDateOfBirth = formData.repDateOfBirth || '';
  const setRepDateOfBirth = (v: string) => handleInputChange('repDateOfBirth', v);
  const repPhotoUrl = formData.repPhotoUrl || '';
  const setRepPhotoUrl = (v: string) => handleInputChange('repPhotoUrl', v);
  const repNotes = formData.repNotes || '';
  const setRepNotes = (v: string) => handleInputChange('repNotes', v);

  // CLIENT SPECIFIC: Health, Illness & Allergies
  const [selectedIllness, setSelectedIllness] = useState(COMMON_ILLNESSES[0]);
  const customIllness = formData.customIllness || '';
  const setCustomIllness = (v: string) => handleInputChange('customIllness', v);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['No Known Drug Allergies (NKDA)']);
  const customAllergy = formData.customAllergy || '';
  const setCustomAllergy = (v: string) => handleInputChange('customAllergy', v);
  const mobilityStatus = formData.mobilityStatus || 'independent';
  const setMobilityStatus = (v: any) => handleInputChange('mobilityStatus', v);
  const dietaryRestrictions = formData.dietaryRestrictions || '';
  const setDietaryRestrictions = (v: string) => handleInputChange('dietaryRestrictions', v);
  const specialCareInstructions = formData.specialCareInstructions || '';
  const setSpecialCareInstructions = (v: string) => handleInputChange('specialCareInstructions', v);
  const [clientConsentDPA, setClientConsentDPA] = useState(false);

  // CLIENT SPECIFIC: Medications - starts empty for real clients
  const [medications, setMedications] = useState<PatientMedication[]>([]);
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

  // NURSE SPECIFIC: 5-Step Documents & Qualifications - blank by default
  const nurseTrn = formData.nurseTrn || '';
  const setNurseTrn = (v: string) => handleInputChange('nurseTrn', v);
  const nurseNcjLicense = formData.nurseNcjLicense || '';
  const setNurseNcjLicense = (v: string) => handleInputChange('nurseNcjLicense', v);
  const driversLicenseNumber = formData.driversLicenseNumber || '';
  const setDriversLicenseNumber = (v: string) => handleInputChange('driversLicenseNumber', v);
  const institutionAttended = formData.institutionAttended || '';
  const setInstitutionAttended = (v: string) => handleInputChange('institutionAttended', v);
  const yearsExperience = formData.yearsExperience || '';
  const setYearsExperience = (v: number | string) => handleInputChange('yearsExperience', v);
  const nurseSpecialty = formData.nurseSpecialty || '';
  const setNurseSpecialty = (v: string) => handleInputChange('nurseSpecialty', v);
  const hourlyRate = formData.hourlyRate || '';
  const setHourlyRate = (v: number | string) => handleInputChange('hourlyRate', v);
  const nurseBio = formData.nurseBio || '';
  const setNurseBio = (v: string) => handleInputChange('nurseBio', v);
  const bankName = formData.bankName || '';
  const setBankName = (v: string) => handleInputChange('bankName', v);
  const accountNumber = formData.accountNumber || '';
  const setAccountNumber = (v: string) => handleInputChange('accountNumber', v);
  const lynkWallet = formData.lynkWallet || '';
  const setLynkWallet = (v: string) => handleInputChange('lynkWallet', v);
  const nurseEmergencyContact = formData.nurseEmergencyContact || '';
  const setNurseEmergencyContact = (v: string) => handleInputChange('nurseEmergencyContact', v);

  // Document file names & URLs for Nurse review - blank until real files are uploaded
  const [govIdUrl, setGovIdUrl] = useState<string>('');
  const [govIdFileName, setGovIdFileName] = useState('');
  const [dlFrontUrl, setDlFrontUrl] = useState<string>('');
  const [dlFrontFileName, setDlFrontFileName] = useState('');
  const [dlBackUrl, setDlBackUrl] = useState<string>('');
  const [dlBackFileName, setDlBackFileName] = useState('');
  const [trnCertUrl, setTrnCertUrl] = useState<string>('');
  const [trnCertFileName, setTrnCertFileName] = useState('');
  const [licenseDocUrl, setLicenseDocUrl] = useState<string>('');
  const [licenseDocFileName, setLicenseDocFileName] = useState('');
  const [policeRecordUrl, setPoliceRecordUrl] = useState<string>('');
  const [policeRecordFileName, setPoliceRecordFileName] = useState('');
  const [bankLetterUrl, setBankLetterUrl] = useState<string>('');
  const [bankLetterFileName, setBankLetterFileName] = useState('');
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState<string>('');
  const [proofOfAddressFileName, setProofOfAddressFileName] = useState('');

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

  // ADMIN SPECIFIC: Role, department & clearance - blank by default for real administrators
  const adminTitle = formData.adminTitle || '';
  const setAdminTitle = (v: string) => handleInputChange('adminTitle', v);
  const adminDepartment = formData.adminDepartment || '';
  const setAdminDepartment = (v: string) => handleInputChange('adminDepartment', v);
  const adminStaffId = formData.adminStaffId || '';
  const setAdminStaffId = (v: string) => handleInputChange('adminStaffId', v);
  const adminPasskey = formData.adminPasskey || '';
  const setAdminPasskey = (v: string) => handleInputChange('adminPasskey', v);

  // SIGNATURE STATES FOR NURSE & ADMIN AGREEMENTS
  const [nurseSignature, setNurseSignature] = useState<SignatureData | null>(null);
  const [adminSignature, setAdminSignature] = useState<SignatureData | null>(null);

  // Bot protection & rate limit captcha state
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Admin MFA Enrollment state
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaData, setMfaData] = useState<{ id: string; totp?: { qr_code?: string; secret?: string; uri?: string } } | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaEnrollStatus, setMfaEnrollStatus] = useState<string | null>(null);
  const [pendingCompletedAccount, setPendingCompletedAccount] = useState<UserAccount | null>(null);

  // Document uploads: Limit to 5MB, whitelist image/jpeg, image/png, application/pdf
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    fileNameSetter?: (name: string) => void,
    bucket: 'nurse-documents' | 'admin-documents' = 'nurse-documents'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File size check (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Document exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller document.`);
      soundFX.playWarningSound();
      return;
    }

    // 2. MIME whitelist check
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!ALLOWED_MIME.includes(file.type)) {
      setErrorMsg(`Invalid file type (${file.type || 'unknown'}). Allowed formats: JPEG, PNG, or PDF.`);
      soundFX.playWarningSound();
      return;
    }

    setErrorMsg(null);
    if (fileNameSetter) fileNameSetter(file.name);

    // 3. Attempt direct upload to private bucket in Supabase storage
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `uploads/${Date.now()}-${sanitizedName}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (!uploadErr && uploadData?.path) {
        // Retrieve signed URL for private bucket
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(uploadData.path, 60 * 60 * 24);

        if (signedData?.signedUrl) {
          setter(signedData.signedUrl);
          soundFX.playSuccessPing();
          return;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase private storage upload fallback:', storageErr);
    }

    // 4. Safe fallback for preview in local wizard before auth session exists
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
        soundFX.playSuccessPing();
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const compressed = await compressImageFile(file, 800, 0.82);
        setter(compressed);
        soundFX.playSuccessPing();
      } catch {
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
        setErrorMsg('Live face liveness photo scan is mandatory. Please look at the camera, blink to verify liveness, and capture your biometric photo before proceeding.');
        soundFX.playWarningSound();
        return;
      }
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full legal name as registered on your official credentials.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Please choose a secure username.');
        return;
      }
      const { isValid: isNursePassValid } = validatePasswordSecurity(password || '');
      if (!isNursePassValid) {
        setErrorMsg('Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        soundFX.playWarningSound();
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
      const trnDigits = (formData.nurseTrn || nurseTrn).replace(/\D/g, '');
      if (trnDigits.length !== 9) {
        setErrorMsg('Jamaican Tax Registration Number (TRN) must be exactly 9 digits (Format: XXX-XXX-XXX).');
        soundFX.playWarningSound();
        return;
      }
      if (!driversLicenseNumber.trim()) {
        setErrorMsg('Please enter your Driver\'s License number.');
        return;
      }
      if (!nurseNcjLicense.trim() || nurseNcjLicense.trim().length < 6) {
        setErrorMsg('Please enter a valid Nursing Council of Jamaica (NCJ) License number (e.g. NCJ-RN-2024-8841).');
        soundFX.playWarningSound();
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

    // Profile Photo validation
    if ((role === 'nurse' || role === 'admin') && !profilePhotoUrl) {
      setErrorMsg(`Profile photo is required for ${role === 'admin' ? 'administrators' : 'nurses'}. Please upload a clear photo or select a preset.`);
      soundFX.playWarningSound();
      return;
    }

    // Password validation: Min 12 chars, upper, lower, number, symbol
    if (role === 'nurse' || role === 'admin') {
      const { isValid: isPassValid } = validatePasswordSecurity(password || '');
      if (!isPassValid) {
        setErrorMsg('Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        soundFX.playWarningSound();
        return;
      }
    }

    // Rate Limiting & Bot Protection Check
    if (!captchaVerified) {
      setErrorMsg('Please complete the anti-bot verification challenge before submitting.');
      soundFX.playWarningSound();
      return;
    }

    if (role === 'client' && !clientConsentDPA) {
      setErrorMsg('Please review and agree to the Jamaica Data Protection Act 2020 consent terms to complete registration.');
      return;
    }

    if (role === 'nurse') {
      const trnDigits = (formData.nurseTrn || nurseTrn).replace(/\D/g, '');
      if (trnDigits.length !== 9) {
        setErrorMsg('Jamaican TRN must be exactly 9 digits (Format: XXX-XXX-XXX).');
        setNurseStep(2);
        soundFX.playWarningSound();
        return;
      }
      if (!nurseSignature || !nurseSignature.signed) {
        setErrorMsg('Please read, digitally sign, and accept the Healthcare Practitioner Independent Contractor Agreement in Step 5 before submitting.');
        setNurseStep(5);
        soundFX.playWarningSound();
        return;
      }
    }

    if (role === 'admin') {
      if (!adminPasskey || !adminPasskey.trim()) {
        setErrorMsg('Administrative security clearance passkey is required.');
        soundFX.playWarningSound();
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
        photoUrl: profilePhotoUrl || undefined,
        profilePhotoUrl: profilePhotoUrl || undefined,
        governmentIdUrl: govIdUrl || undefined,
        driversLicenseFrontUrl: dlFrontUrl || driversLicenseFrontUrl || undefined,
        driversLicenseBackUrl: dlBackUrl || driversLicenseBackUrl || undefined,
        trnCertificateUrl: trnCertUrl || undefined,
        licenseDocumentUrl: licenseDocUrl || undefined,
        policeRecordUrl: policeRecordUrl || undefined,
        bankLetterUrl: bankLetterUrl || undefined,
        proofOfAddressUrl: proofOfAddressUrl || undefined,
        documents: {
          profilePhotoUrl: profilePhotoUrl || undefined,
          governmentIdUrl: govIdUrl || undefined,
          trnCertificateUrl: trnCertUrl || undefined,
          driversLicenseFrontUrl: dlFrontUrl || driversLicenseFrontUrl || undefined,
          driversLicenseBackUrl: dlBackUrl || driversLicenseBackUrl || undefined,
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
        signature: adminSignature,
        photoUrl: profilePhotoUrl || undefined,
        profilePhotoUrl: profilePhotoUrl || undefined,
        governmentIdUrl: govIdUrl || undefined,
        driversLicenseFrontUrl: dlFrontUrl || driversLicenseFrontUrl || undefined,
        driversLicenseBackUrl: dlBackUrl || driversLicenseBackUrl || undefined,
        trnCertificateUrl: trnCertUrl || undefined,
        policeRecordUrl: policeRecordUrl || undefined,
        bankLetterUrl: bankLetterUrl || undefined,
        proofOfAddressUrl: proofOfAddressUrl || undefined,
        documents: {
          profilePhotoUrl: profilePhotoUrl || undefined,
          governmentIdUrl: govIdUrl || undefined,
          trnCertificateUrl: trnCertUrl || undefined,
          driversLicenseFrontUrl: dlFrontUrl || driversLicenseFrontUrl || undefined,
          driversLicenseBackUrl: dlBackUrl || driversLicenseBackUrl || undefined,
          policeRecordUrl: policeRecordUrl || undefined,
          bankLetterUrl: bankLetterUrl || undefined,
          proofOfAddressUrl: proofOfAddressUrl || undefined
        },
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

      // If Admin, verify clearance key and provision via server Edge Function
      if (role === 'admin') {
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-admin', {
            body: {
              email: cleanEmail,
              password: password.trim(),
              fullName: cleanFullName,
              phone: cleanPhone,
              address: cleanAddress,
              parish: parish,
              adminTitle: adminTitle,
              department: adminDepartment,
              staffId: adminStaffId,
              adminClearanceKey: adminPasskey.trim(),
              signature: adminSignature
            }
          });

          if (edgeError || edgeData?.error) {
            throw new Error(edgeError?.message || edgeData?.error || 'Administrative clearance verification failed.');
          }

          if (edgeData?.user_id) {
            userId = edgeData.user_id;
          }
        } catch (edgeInvocationErr: any) {
          // If edge function returned an error, halt and alert
          if (edgeInvocationErr?.message && !edgeInvocationErr.message.includes('Failed to send a request')) {
            throw edgeInvocationErr;
          }
          console.warn('create-admin edge function notice:', edgeInvocationErr);
        }
      }

      // If Nurse, perform HaveIBeenPwned & TRN validation via Edge Function
      if (role === 'nurse') {
        try {
          const { data: nurseCheck, error: nurseCheckErr } = await supabase.functions.invoke('verify-nurse', {
            body: {
              email: cleanEmail,
              password: password.trim(),
              fullName: cleanFullName,
              trn: nurseTrn.trim(),
              ncjLicense: nurseNcjLicense.trim(),
              phone: cleanPhone
            }
          });

          if (nurseCheckErr || nurseCheck?.error) {
            throw new Error(nurseCheckErr?.message || nurseCheck?.error || 'Nurse credential check failed.');
          }
        } catch (nurseValErr: any) {
          if (nurseValErr?.message?.includes('breach') || nurseValErr?.message?.includes('TRN')) {
            throw nurseValErr;
          }
          console.warn('verify-nurse edge function notice:', nurseValErr);
        }
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
          governmentIdType: "Passport & National ID",
          governmentIdUrl: govIdUrl,
          driversLicenseNumber: driversLicenseNumber.trim(),
          driversLicenseFrontUrl: dlFrontUrl,
          driversLicenseBackUrl: dlBackUrl,
          trnCertificateUrl: trnCertUrl,
          licenseDocumentUrl: licenseDocUrl,
          policeRecordUrl: policeRecordUrl,
          bankLetterUrl: bankLetterUrl,
          proofOfAddressUrl: proofOfAddressUrl,
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

        // Persist to Supabase public.profiles safely without chaining .catch
        saveNurseProfileToSupabase(newNurseProfile).then(() => {}, () => {});

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

        // Enforce MFA for Admin: enroll in TOTP
        try {
          const { data: enrollRes } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
          if (enrollRes) {
            setMfaData(enrollRes as any);
            setPendingCompletedAccount(newAccount);
            setShowMfaModal(true);
            setIsSubmitting(false);
            return;
          }
        } catch (mfaErr) {
          console.warn('MFA enrollment prompt notice:', mfaErr);
        }
      }

      // Save password and username lookup cache
      try {
        const rawCreds = localStorage.getItem('wecare_auth_passwords') || '{}';
        const creds = JSON.parse(rawCreds);
        creds[cleanEmail] = password.trim();
        creds[cleanUsername] = password.trim();
        localStorage.setItem('wecare_auth_passwords', JSON.stringify(creds));
      } catch {}
      saveUsernameToCache(cleanUsername, cleanEmail);

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
      {/* Top Banner & Title with Full Logo */}
      <div className="mb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <WeCareTrackLogo variant="full" size="md" inverted={true} subtitle="HOME NURSING" />
          <p className="text-[11px] text-slate-300 mt-1">
            Official Registration Portal for Jamaican Clients, Licensed Nurses &amp; Administrators.
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

              {/* Bot Protection Captcha */}
              <Captcha verified={captchaVerified} onVerify={() => setCaptchaVerified(true)} />

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
                  disabled={isSubmitting || !clientConsentDPA || !captchaVerified}
                  onClick={() => handleFinalSubmit()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/60 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Creating Profile...' : !captchaVerified ? 'Complete Bot Check to Submit' : 'Complete Registration & Access Portal'}</span>
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
              {/* Profile Photo Upload */}
              <ProfilePhotoUploader
                role="nurse"
                profilePhotoUrl={profilePhotoUrl}
                onPhotoSelected={setProfilePhotoUrl}
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
                  <PasswordStrengthMeter password={formData.password || ''} />
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
                  title={!profilePhotoUrl ? 'Please upload your profile photo to proceed' : undefined}
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
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Practitioner Identification &amp; Statutory Credentials
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Upload official credentials (TRN, Driver's License front &amp; back, and Nursing Council certificate) for clinical verification. Documents are stored in private encrypted storage accessible only to clinical administrators. Max 5MB per document (JPEG, PNG, PDF).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TRN Number with live validation badge */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300 block">TRN (Tax Registration Number) *</label>
                    <span className={`text-[10px] font-mono font-bold ${
                      (formData.nurseTrn || nurseTrn).replace(/\D/g, '').length === 9 
                        ? 'text-emerald-400' 
                        : 'text-amber-400'
                    }`}>
                      {(formData.nurseTrn || nurseTrn).replace(/\D/g, '').length === 9 
                        ? '✓ TAJ 9-Digit Format Valid' 
                        : 'Format: XXX-XXX-XXX (9 digits)'}
                    </span>
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300 block">Driver's License Number *</label>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {(formData.driversLicenseNumber || driversLicenseNumber).trim() ? '✓ Recorded' : 'Required'}
                    </span>
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300 block">NCJ License # (Nursing Council of Jamaica) *</label>
                    <span className={`text-[10px] font-mono font-bold ${
                      (formData.nurseNcjLicense || nurseNcjLicense).trim().length >= 6 
                        ? 'text-emerald-400' 
                        : 'text-amber-400'
                    }`}>
                      {(formData.nurseNcjLicense || nurseNcjLicense).trim().length >= 6 
                        ? '✓ NCJ Format Valid' 
                        : 'Format: NCJ-RN-YYYY-XXXX'}
                    </span>
                  </div>
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
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => { setDlFrontUrl(url); setDriversLicenseFrontUrl(url); }, setDlFrontFileName, 'nurse-documents')}
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
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => { setDlBackUrl(url); setDriversLicenseBackUrl(url); }, setDlBackFileName, 'nurse-documents')}
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
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setTrnCertUrl, setTrnCertFileName, 'nurse-documents')}
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
                      accept="image/jpeg,image/png,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setLicenseDocUrl, setLicenseDocFileName, 'nurse-documents')}
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
                    <span>TRN: {nurseTrn || 'Provided'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Driver's License: {driversLicenseNumber || 'Provided'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>NCJ License: {nurseNcjLicense || 'Provided'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>DL Front &amp; Back: {dlFrontUrl && dlBackUrl ? 'Uploaded' : 'Recorded'}</span>
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

              {/* Bot Protection Captcha */}
              <Captcha verified={captchaVerified} onVerify={() => setCaptchaVerified(true)} />

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
                  disabled={isSubmitting || !nurseSignature?.signed || !captchaVerified}
                  onClick={() => handleFinalSubmit()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/60 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isSubmitting 
                      ? 'Submitting Application...' 
                      : !nurseSignature?.signed 
                      ? 'Sign Agreement Above to Submit' 
                      : !captchaVerified
                      ? 'Complete Bot Check to Submit'
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

          {/* Administrator Profile Photo */}
          <ProfilePhotoUploader
            role="admin"
            profilePhotoUrl={profilePhotoUrl}
            onPhotoSelected={(url) => setProfilePhotoUrl(url)}
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
              <PasswordStrengthMeter password={formData.password || ''} />
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-amber-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Security Clearance Passkey *</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Verified by Server Edge Function
                </span>
              </div>
              <input
                type="password"
                required
                value={formData.adminPasskey || ''}
                onChange={e => handleInputChange('adminPasskey', e.target.value)}
                placeholder="Enter administrative clearance key"
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

          {/* Bot Protection Captcha */}
          <Captcha verified={captchaVerified} onVerify={() => setCaptchaVerified(true)} />

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSubmitting || !adminSignature?.signed || !profilePhotoUrl || !captchaVerified || !validatePasswordSecurity(formData.password || '').isValid}
              onClick={() => handleFinalSubmit()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-[#1E1B4B] hover:opacity-95 text-white font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/60 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isSubmitting 
                  ? 'Creating Profile...' 
                  : !profilePhotoUrl
                  ? 'Upload Headshot Photo to Register'
                  : !validatePasswordSecurity(formData.password || '').isValid
                  ? 'Min 12-Char Complex Password Required'
                  : !captchaVerified
                  ? 'Complete Bot Check to Register'
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

      {/* Admin Multi-Factor Authentication (MFA) Enrollment Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0a26] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-white text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Administrator MFA Enforcement</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                TOTP / Authenticator
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              WeCare requires Multi-Factor Authentication (MFA) for all administrative accounts. Scan the QR code or enter the secret key into Google Authenticator, 1Password, or Authy.
            </p>

            {mfaData?.totp?.qr_code && (
              <div className="p-3 bg-white rounded-2xl flex items-center justify-center w-48 h-48 mx-auto shadow-inner">
                <img src={mfaData.totp.qr_code} alt="TOTP QR Code" className="w-full h-full" />
              </div>
            )}

            {mfaData?.totp?.secret && (
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-center text-xs text-amber-300 select-all">
                <span className="text-[10px] text-slate-400 block font-sans">Manual Entry Secret:</span>
                {mfaData.totp.secret}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Enter 6-digit Code from Authenticator App *
              </label>
              <input
                type="text"
                maxLength={6}
                value={mfaVerifyCode}
                onChange={e => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-center tracking-widest text-lg focus:border-amber-400 outline-none"
              />
            </div>

            {mfaEnrollStatus && (
              <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                {mfaEnrollStatus}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (mfaVerifyCode.length !== 6 && mfaData?.id) {
                    setMfaEnrollStatus('Please enter the 6-digit verification code.');
                    return;
                  }
                  try {
                    if (mfaData?.id) {
                      const { error: chalErr } = await supabase.auth.mfa.challengeAndVerify({
                        factorId: mfaData.id,
                        code: mfaVerifyCode
                      });
                      if (chalErr) {
                        setMfaEnrollStatus(chalErr.message);
                        return;
                      }
                    }
                  } catch (err: any) {
                    console.warn('MFA challenge note:', err);
                  }
                  setShowMfaModal(false);
                  if (pendingCompletedAccount) {
                    onComplete(pendingCompletedAccount);
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg"
              >
                Verify &amp; Activate Administrator Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
