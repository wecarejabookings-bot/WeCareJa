import React, { useState } from 'react';
import { 
  X, 
  User, 
  Camera, 
  Upload, 
  ShieldCheck, 
  Heart, 
  Pill, 
  Users, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Share2,
  FileText
} from 'lucide-react';
import { 
  UserAccount, 
  ClientPatientBioData, 
  PatientMedication, 
  TrustedFamilyMember 
} from '../../types';
import { ALL_SERVICE_ZONES } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { compressImageFile } from '../../utils/imageCompression';
import { supabase, clearAllSupabaseAuthTokens, saveUsernameToCache } from '../../lib/supabase';
import { saveApplicantDossier, uploadDocument } from '../../utils/dossierStore';
import confetti from 'canvas-confetti';

export const CORPORATE_AREA_LAUNCH_ZONES = [
  'Kingston 5',
  'Kingston 6',
  'Kingston 8',
  'Kingston 10',
  'Kingston 19',
  'St Andrew',
  'Portmore',
  'Spanish Town'
];

interface PatientSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPatient: (account: UserAccount) => void;
  onOpenSignIn?: () => void;
}

const COMMON_ILLNESSES = [
  'Hypertension (High Blood Pressure)',
  'Type 2 Diabetes Mellitus',
  'Arthritis / Joint Pain',
  'Alzheimer\'s / Dementia',
  'Cardiovascular / Heart Condition',
  'Asthma / Respiratory Condition',
  'Post-Op Surgical Recovery',
  'Stroke Recovery / Hemiparesis',
  'Limited Mobility / Fall Risk',
  'Bedbound / Pressure Injury Risk',
  'Renal / Kidney Disease',
  'Cancer Support'
];

const COMMON_ALLERGIES = [
  'Penicillin / Amoxicillin',
  'Sulfa Antibiotics',
  'Latex Gloves & Products',
  'Aspirin / NSAIDs',
  'Iodine / Contrast Dye',
  'Codeine / Morphine',
  'Food Allergies (Shellfish/Nuts)',
  'No Known Drug Allergies (NKDA)'
];

export const PatientSignUpModal: React.FC<PatientSignUpModalProps> = ({
  isOpen,
  onClose,
  onRegisterPatient,
  onOpenSignIn
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isCameraOpenForPatient, setIsCameraOpenForPatient] = useState(false);
  const [isCameraOpenForFamily, setIsCameraOpenForFamily] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Patient Credentials & Photo
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [patientPhotoUrl, setPatientPhotoUrl] = useState('');

  // Step 2: Patient Bio Data & Health History
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [bloodType, setBloodType] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedIllnesses, setSelectedIllnesses] = useState<string[]>([]);
  const [customIllness, setCustomIllness] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [mobilityStatus, setMobilityStatus] = useState<'independent' | 'needs_cane_walker' | 'wheelchair_bound' | 'bedbound' | ''>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [specialCareInstructions, setSpecialCareInstructions] = useState('');
  const [consentDataProtection, setConsentDataProtection] = useState<boolean>(false);

  // Step 3: Scheduled Medications & Timings
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedTimeOfDay, setNewMedTimeOfDay] = useState<('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[]>(['morning']);
  const [newMedScheduledTime, setNewMedScheduledTime] = useState('08:00 AM');
  const [newMedPurpose, setNewMedPurpose] = useState('');

  // Step 4: Trusted Family Member / Guardian Bio & Photo
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyPhotoUrl, setFamilyPhotoUrl] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');
  const [allowProfileSharing, setAllowProfileSharing] = useState(false);
  const [clientWhatsAppOptIn, setClientWhatsAppOptIn] = useState(false);
  const [familyWhatsAppOptIn, setFamilyWhatsAppOptIn] = useState(false);

  if (!isOpen) return null;

  // File Upload Handlers with automatic compression
  const handlePatientFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.82);
        setPatientPhotoUrl(compressed);
        soundFX.playSuccessPing();
      } catch (err) {
        console.warn('Image compression fallback', err);
        const reader = new FileReader();
        reader.onload = () => {
          setPatientPhotoUrl(reader.result as string);
          soundFX.playSuccessPing();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFamilyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.82);
        setFamilyPhotoUrl(compressed);
        soundFX.playSuccessPing();
      } catch (err) {
        console.warn('Image compression fallback', err);
        const reader = new FileReader();
        reader.onload = () => {
          setFamilyPhotoUrl(reader.result as string);
          soundFX.playSuccessPing();
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Toggle Illnesses & Allergies
  const toggleIllness = (item: string) => {
    if (selectedIllnesses.includes(item)) {
      setSelectedIllnesses(selectedIllnesses.filter(i => i !== item));
    } else {
      setSelectedIllnesses([...selectedIllnesses, item]);
    }
  };

  const handleAddCustomIllness = () => {
    if (customIllness.trim() && !selectedIllnesses.includes(customIllness.trim())) {
      setSelectedIllnesses([...selectedIllnesses, customIllness.trim()]);
      setCustomIllness('');
    }
  };

  const toggleAllergy = (item: string) => {
    if (item === 'No Known Drug Allergies (NKDA)') {
      setSelectedAllergies(prev =>
        prev.includes('No Known Drug Allergies (NKDA)') ? [] : ['No Known Drug Allergies (NKDA)']
      );
      return;
    }
    const filtered = selectedAllergies.filter(a => a !== 'No Known Drug Allergies (NKDA)');
    if (filtered.includes(item)) {
      setSelectedAllergies(filtered.filter(a => a !== item));
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

  // Medication Management
  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      setError('Please enter medication name and dosage.');
      return;
    }
    setError(null);
    const newMed: PatientMedication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 dose',
      instructions: newMedInstructions.trim(),
      timesOfDay: newMedTimeOfDay.length > 0 ? newMedTimeOfDay : ['morning'],
      scheduledTime: newMedScheduledTime,
      purpose: newMedPurpose.trim()
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

  const toggleNewMedTime = (time: 'morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed') => {
    if (newMedTimeOfDay.includes(time)) {
      if (newMedTimeOfDay.length > 1) {
        setNewMedTimeOfDay(newMedTimeOfDay.filter(t => t !== time));
      }
    } else {
      setNewMedTimeOfDay([...newMedTimeOfDay, time]);
    }
  };

  // Validation per step
  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter the patient’s full legal name.');
        return;
      }
      if (!username.trim()) {
        setError('Please choose a username for logging in.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Please create a password (at least 4 characters).');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setStep(2);
      soundFX.playSuccessPing();
    } else if (step === 2) {
      if (!zone.trim()) {
        setError('Please select a Parish / Zone.');
        return;
      }
      if (!address.trim()) {
        setError('Please enter the home street address for nurse visits.');
        return;
      }
      setStep(3);
      soundFX.playSuccessPing();
    } else if (step === 3) {
      setStep(4);
      soundFX.playSuccessPing();
    } else if (step === 4) {
      if (!familyMemberName.trim()) {
        setError('Please provide the trusted family member / guardian’s name.');
        return;
      }
      if (!familyPhone.trim()) {
        setError('Please provide a contact phone number for the trusted family member.');
        return;
      }
      setStep(5);
      soundFX.playSuccessPing();
    }
  };

  const handleCompleteRegistration = async () => {
    setError(null);
    
    if (!consentDataProtection) {
      setError('Please review and check the mandatory Jamaica Data Protection Act 2020 consent checkbox before completing registration.');
      return;
    }

    if (typeof window !== 'undefined') {
      (window as any).__wecareSignupInProgress = true;
    }

    try {
      // Clear any previous user session before creating this patient account
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {}
      clearAllSupabaseAuthTokens();
      try {
        sessionStorage.removeItem('wecare_session_user_id');
        localStorage.removeItem('wecare_current_user_id');
      } catch {}

      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim().toLowerCase();
      const cleanFullName = name.trim();
      const cleanPhone = phone.trim();

      let userId = `user-client-${Date.now()}`;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanFullName,
              role: 'client',
              phone: cleanPhone,
              address
            }
          }
        });
        if (!authError && authData?.user?.id) {
          userId = authData.user.id;
        }
      } catch {}

      // Calculate approximate age ONLY if DOB provided
      let calculatedAge: number | undefined = undefined;
      if (dob) {
        const birthYear = new Date(dob).getFullYear();
        if (!isNaN(birthYear)) {
          calculatedAge = Math.max(1, new Date().getFullYear() - birthYear);
        }
      }

      let defaultPatientPhoto = patientPhotoUrl || '';
      if (patientPhotoUrl && patientPhotoUrl.startsWith('data:image/')) {
        try {
          const uploaded = await uploadDocument(patientPhotoUrl, 'patient-photo.jpg', 'profile_photo', userId);
          if (uploaded?.url) defaultPatientPhoto = uploaded.url;
        } catch {}
      }
      const defaultFamilyPhoto = familyPhotoUrl || '';

      const trustedFamily: TrustedFamilyMember = {
        name: familyMemberName.trim(),
        relation: familyRelation.trim(),
        phone: familyPhone.trim(),
        email: familyEmail.trim(),
        photoUrl: defaultFamilyPhoto,
        canManageCare: true,
        notes: familyNotes.trim(),
        whatsAppUpdatesOptIn: familyWhatsAppOptIn,
        whatsAppPhone: familyPhone.trim()
      };

      const patientBio: ClientPatientBioData = {
        dateOfBirth: dob,
        age: calculatedAge,
        gender: (gender || undefined) as any,
        bloodType: bloodType || undefined,
        residentialAddress: address.trim(),
        zone: zone.trim(),
        knownIllnesses: selectedIllnesses,
        allergies: selectedAllergies,
        mobilityStatus: (mobilityStatus || undefined) as any,
        dietaryRestrictions: dietaryRestrictions.trim(),
        specialCareInstructions: specialCareInstructions.trim(),
        medications,
        trustedFamilyMember: trustedFamily,
        profileSharedWith: allowProfileSharing ? [familyEmail.trim(), cleanEmail].filter(Boolean) : []
      };

      const newAccount: UserAccount = {
        id: userId,
        username: cleanUsername,
        password,
        role: 'client',
        approvalStatus: 'approved',
        name: cleanFullName,
        full_name: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        avatarUrl: defaultPatientPhoto || undefined,
        zone: zone.trim(),
        address: address.trim(),
        emergencyContact: familyMemberName.trim() || familyPhone.trim()
          ? {
              name: familyRelation.trim() ? `${familyMemberName.trim()} (${familyRelation.trim()})` : familyMemberName.trim(),
              phone: familyPhone.trim(),
              relation: familyRelation.trim()
            }
          : undefined,
        patientBioData: patientBio,
        whatsAppUpdatesOptIn: clientWhatsAppOptIn,
        whatsAppPhone: cleanPhone || undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Persist login lookup & credentials so patient can sign out and sign back in seamlessly
      saveUsernameToCache(cleanUsername, cleanEmail);
      try {
        const rawCreds = localStorage.getItem('wecare_auth_passwords') || '{}';
        const creds = JSON.parse(rawCreds);
        creds[cleanEmail] = password;
        creds[cleanUsername] = password;
        localStorage.setItem('wecare_auth_passwords', JSON.stringify(creds));

        sessionStorage.setItem('wecare_session_user_id', userId);
        localStorage.setItem('wecare_current_user_id', userId);

        const rawAccounts = localStorage.getItem('wecare_user_accounts');
        const list = rawAccounts ? JSON.parse(rawAccounts) : [];
        const deduped = Array.isArray(list)
          ? list.filter((u: any) => u.id !== userId && u.email?.toLowerCase() !== cleanEmail)
          : [];
        localStorage.setItem('wecare_user_accounts', JSON.stringify([newAccount, ...deduped]));
      } catch {}

      saveApplicantDossier({
        id: userId,
        userId,
        username: cleanUsername,
        email: cleanEmail,
        fullName: cleanFullName,
        name: cleanFullName,
        role: 'client',
        phone: cleanPhone,
        address,
        parish: zone,
        photoUrl: defaultPatientPhoto,
        profilePhotoUrl: defaultPatientPhoto,
        emergencyContact: newAccount.emergencyContact,
        status: 'approved',
        submittedAt: new Date().toISOString()
      }).catch(() => {});

      onRegisterPatient(newAccount);
      soundFX.playBookingConfirmed();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } finally {
      if (typeof window !== 'undefined') {
        (window as any).__wecareSignupInProgress = false;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c062c] to-[#0d0116] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-6">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1E1B4B]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1E1B4B] to-[#F59E0B] flex items-center justify-center text-white shadow-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Patient &amp; Family Sign Up</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Step {step} of 5
                </span>
              </div>
              <p className="text-xs text-purple-200">
                {step === 1 && 'Create patient login credentials & upload photo'}
                {step === 2 && 'Patient bio data, known conditions & allergies'}
                {step === 3 && 'Daily medication schedule & reminders'}
                {step === 4 && 'Trusted family member bio & profile photo'}
                {step === 5 && 'Review profile & activate care network account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="relative z-10 px-6 pt-4 pb-2 border-b border-white/5 bg-black/20">
          <div className="grid grid-cols-5 gap-1 sm:gap-2 text-[10px] sm:text-xs text-center font-bold">
            {[
              { num: 1, label: 'Login & Photo' },
              { num: 2, label: 'Bio & Health' },
              { num: 3, label: 'Medications' },
              { num: 4, label: 'Family Member' },
              { num: 5, label: 'Confirm' }
            ].map(s => (
              <div
                key={s.num}
                onClick={() => s.num < step && setStep(s.num as any)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  step === s.num
                    ? 'border-purple-400 bg-purple-600/40 text-white shadow-sm'
                    : step > s.num
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-white/[0.02] text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {step > s.num ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <span>{s.num}.</span>
                  )}
                  <span className="truncate hidden xs:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: LOGIN CREDENTIALS & PATIENT PHOTO */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Create your client login username and password to manage nursing visits, review clinical notes, and access secure health records.
                </span>
              </div>

              {/* Patient Photo Upload / Camera */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Patient Profile Photo <span className="text-purple-300 font-normal">(Visible to your assigned nurses &amp; administrators)</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-purple-900/40 border-2 border-dashed border-purple-400/50 flex items-center justify-center overflow-hidden shrink-0 group">
                    {patientPhotoUrl ? (
                      <img loading="lazy" decoding="async" src={patientPhotoUrl} alt="Patient Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-purple-300/60" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-xs text-slate-300">
                      Upload a clear headshot or take a quick photo with your camera.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePatientFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpenForPatient(true)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Take Selfie</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Patient Full Legal Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Patricia Campbell"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. patricia_campbell"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="w-full p-3 pr-10 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patricia@gmail.com"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Patient Phone (+1 876) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (876) 555-8833"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* WhatsApp Cloud API Client Opt-In */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#075E54]/25 border border-emerald-500/30">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clientWhatsAppOptIn}
                      onChange={(e) => setClientWhatsAppOptIn(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-emerald-500/50 text-emerald-500 focus:ring-emerald-400 bg-black/50 accent-emerald-500"
                    />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-emerald-200">
                          Send updates on WhatsApp? {phone.trim() || '876-XXX-XXXX'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          Opt-In
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Receive visit codes, nurse arrival doorbell alerts, and medical summaries directly on WhatsApp. Works without internet app access. Standard WhatsApp rates apply.
                      </p>
                      <p className="text-[10px] text-amber-300 font-medium">
                        * Required by Meta WhatsApp Cloud API policies to prevent delivery blocks.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIO DATA & HEALTH HISTORY */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>
                  This health and bio information is shared directly with licensed nurses attending to the patient so they know all medical requirements beforehand.
                </span>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#1c062c] border border-white/15 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select gender...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#1c062c] border border-white/15 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select blood type...</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Parish / Zone <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#1c062c] border border-white/15 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-xs"
                  >
                    <option value="">Select parish / zone...</option>
                    {CORPORATE_AREA_LAUNCH_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Physical Home Street Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 22 Mona Road, Kingston 6"
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Mobility Status */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 text-xs">Mobility Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
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
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        mobilityStatus === m.id
                          ? 'border-purple-400 bg-purple-600/30 text-white ring-1 ring-purple-400'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Known Illnesses / Conditions */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 text-xs">
                  Known Illnesses &amp; Chronic Conditions (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ILLNESSES.map(ill => {
                    const isSelected = selectedIllnesses.includes(ill);
                    return (
                      <button
                        key={ill}
                        type="button"
                        onClick={() => toggleIllness(ill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#1E1B4B] to-purple-600 text-white border border-purple-400/50 shadow-xs'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{ill}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Custom Illness input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customIllness}
                    onChange={(e) => setCustomIllness(e.target.value)}
                    placeholder="Add other medical illness or condition..."
                    className="flex-1 p-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomIllness())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomIllness}
                    className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-400/30 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Known Allergies */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 text-xs">
                  Known Allergies (Medications / Materials / Food)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ALLERGIES.map(allergy => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#F59E0B]/30 text-red-200 border border-red-400/50'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                        <span>{allergy}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="Add other known allergy..."
                    className="flex-1 p-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAllergy())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-bold border border-red-400/30 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Special Care Instructions */}
              <div>
                <label className="font-bold text-slate-300 block mb-1 text-xs">
                  Special Care / Nurse Directions
                </label>
                <textarea
                  value={specialCareInstructions}
                  onChange={(e) => setSpecialCareInstructions(e.target.value)}
                  placeholder="e.g. Patient lives alone during the day, requires gentle transfer assistance, prefers morning BP check before breakfast."
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none h-16 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULED MEDICATIONS & TIME OF DAY */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2.5">
                <Pill className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Enter medications and exact time of day taken. WeCare automatically reminds assigned nurses and caregivers when visits coincide with medication timings!
                </span>
              </div>

              {/* Existing Medications List */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Current Scheduled Medications ({medications.length})
                </label>

                {medications.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                    No medications added yet. Use the form below to add the patient's prescriptions.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medications.map((med, idx) => (
                      <div
                        key={med.id}
                        className="p-3.5 rounded-2xl bg-white/[0.04] border border-purple-500/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-sm">{med.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                              {med.dosage}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {med.scheduledTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                            <span>Times: <strong className="text-purple-200">{med.timesOfDay.join(', ')}</strong></span>
                            {med.purpose && <span>• Purpose: {med.purpose}</span>}
                            {med.instructions && <span>• Note: {med.instructions}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(med.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition"
                          title="Remove medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Medication Box */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <h4 className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" /> Add a Prescription Medication
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Medication Name &amp; Strength</label>
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="e.g. Metformin 500mg, Losartan 50mg"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Dosage / Frequency</label>
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="e.g. 1 tablet twice daily with food"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Exact Scheduled Time</label>
                    <select
                      value={newMedScheduledTime}
                      onChange={(e) => setNewMedScheduledTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#1c062c] border border-white/15 text-white focus:outline-none"
                    >
                      <option value="06:00 AM">06:00 AM (Early Morning)</option>
                      <option value="08:00 AM">08:00 AM (Morning / Breakfast)</option>
                      <option value="10:00 AM">10:00 AM (Mid-Morning)</option>
                      <option value="01:00 PM">01:00 PM (Midday / Lunch)</option>
                      <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                      <option value="06:00 PM">06:00 PM (Evening / Dinner)</option>
                      <option value="09:00 PM">09:00 PM (Bedtime / Night)</option>
                      <option value="PRN / As Needed">PRN / As Needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Clinical Purpose (Optional)</label>
                    <input
                      type="text"
                      value={newMedPurpose}
                      onChange={(e) => setNewMedPurpose(e.target.value)}
                      placeholder="e.g. Blood sugar, pain, cholesterol"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1 text-xs">Times of Day Taken</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 'morning', label: '🌅 Morning (8 AM)' },
                      { id: 'midday', label: '☀️ Midday (1 PM)' },
                      { id: 'evening', label: '🌇 Evening (6 PM)' },
                      { id: 'bedtime', label: '🌙 Bedtime (9 PM)' },
                      { id: 'as_needed', label: '⚡ As Needed' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleNewMedTime(t.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          newMedTimeOfDay.includes(t.id as any)
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1 text-xs">Instructions / Notes</label>
                  <input
                    type="text"
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    placeholder="e.g. Take with a full glass of water after breakfast"
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication to Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TRUSTED FAMILY MEMBER / GUARDIAN BIO & PHOTO */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  To ensure maximum patient safety, WeCare links one verified <strong>Trusted Family Member / Guardian</strong> to the patient account with their photo, contact info, and care management rights.
                </span>
              </div>

              {/* Family Member Photo Upload / Camera */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  Trusted Family Member Profile Photo <span className="text-purple-300 font-normal">(Shared with nurses and administrators)</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-purple-900/40 border-2 border-dashed border-purple-400/50 flex items-center justify-center overflow-hidden shrink-0 group">
                    {familyPhotoUrl ? (
                      <img loading="lazy" decoding="async" src={familyPhotoUrl} alt="Family Member Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-purple-300/60" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-xs text-slate-300">
                      Upload family member's photo or capture directly using the device camera.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Family Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFamilyFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpenForFamily(true)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Take Selfie</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Member Bio Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Family Member Legal Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={familyMemberName}
                    onChange={(e) => setFamilyMemberName(e.target.value)}
                    placeholder="e.g. David Campbell"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Relationship to Patient</label>
                  <select
                    value={familyRelation}
                    onChange={(e) => setFamilyRelation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1c062c] border border-white/15 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select relationship...</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Sibling">Sister / Brother</option>
                    <option value="Grandchild">Grandson / Granddaughter</option>
                    <option value="Legal Guardian">Legal Guardian / Power of Attorney</option>
                    <option value="Close Relative / Friend">Close Relative / Friend</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Family Contact Phone (+1 876) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={familyPhone}
                    onChange={(e) => setFamilyPhone(e.target.value)}
                    placeholder="+1 (876) 555-9988"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Family Email Address</label>
                  <input
                    type="email"
                    value={familyEmail}
                    onChange={(e) => setFamilyEmail(e.target.value)}
                    placeholder="david.campbell@gmail.com"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-300 block mb-1">
                    Family Authorization &amp; Emergency Notes
                  </label>
                  <textarea
                    value={familyNotes}
                    onChange={(e) => setFamilyNotes(e.target.value)}
                    placeholder="e.g. Primary contact for billing and medical updates. Call immediately if systolic blood pressure exceeds 160."
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none h-16 resize-none"
                  />
                </div>

                {/* Family WhatsApp Cloud API Opt-In Checkbox */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#075E54]/30 to-[#128C7E]/20 border border-emerald-500/40">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={familyWhatsAppOptIn}
                      onChange={(e) => setFamilyWhatsAppOptIn(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-emerald-500/50 text-emerald-500 focus:ring-emerald-400 bg-black/50 accent-emerald-500"
                    />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">
                          Send updates on WhatsApp? {familyPhone.trim() || '876-XXX-XXXX'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          Required Opt-In
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Authorize remote start/end visit codes via WhatsApp. When nurse arrives at doorstep, receive Start Code (e.g. reply <code className="text-emerald-300 font-bold">START 4829</code> to start remotely). When nurse is done, receive End Code (reply <code className="text-emerald-300 font-bold">END 9174</code> to complete and release payment).
                      </p>
                      <p className="text-[10px] text-amber-300 font-medium">
                        ⚠️ Meta WhatsApp Cloud API Opt-in Mandate: You must obtain explicit opt-in or Meta blocks message delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Profile Sharing Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Allow Family Profile Sharing</span>
                    <span className="text-slate-400 text-[11px]">
                      Enables trusted family members to receive visit summaries, medication logs, and nurse check-in reports.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowProfileSharing}
                  onChange={(e) => setAllowProfileSharing(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20"
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & ACTIVATION */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-black text-white text-sm">Account &amp; Health Profile Ready!</h4>
                  <p className="text-slate-300">
                    Review your complete clinical profile below. Once activated, you can immediately book registered nurses and schedule 3x daily senior visits.
                  </p>
                </div>
              </div>

              {/* Patient Card Preview */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center gap-3.5 pb-3 border-b border-white/10">
                  {patientPhotoUrl ? (
                    <img loading="lazy" decoding="async"
                      src={patientPhotoUrl}
                      alt={name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-purple-900/50 border-2 border-purple-400/50 flex items-center justify-center shrink-0">
                      <User className="w-7 h-7 text-purple-300" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300">Patient Account</span>
                    <h3 className="text-base font-black text-white">{name}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{[address, zone].filter(Boolean).join(', ') || 'Not specified'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Username</span>
                    <span className="font-mono text-purple-300 font-bold">@{username}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Blood Type</span>
                    <span className="font-bold text-red-400">{bloodType || 'Not specified'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Mobility</span>
                    <span className="font-bold text-white capitalize">{mobilityStatus ? String(mobilityStatus).replace(/_/g, ' ') : 'Not specified'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-bold text-white">{phone || 'Not provided'}</span>
                  </div>
                </div>

                {/* Medical & Allergies Pill Box */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div>
                    <strong className="text-slate-300">Known Conditions: </strong>
                    <span className="text-purple-200">
                      {selectedIllnesses.length > 0 ? selectedIllnesses.join(', ') : 'None Reported'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-300">Allergies: </strong>
                    <span className="text-red-300 font-bold">
                      {selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'None Reported'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-300">Scheduled Meds ({medications.length}): </strong>
                    <span className="text-emerald-300">
                      {medications.length > 0 ? medications.map(m => `${m.name} (${m.scheduledTime})`).join(' • ') : 'None added'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trusted Family Member Preview Card */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Verified Trusted Family Member &amp; Guardian
                </span>
                <div className="flex items-center gap-3">
                  {familyPhotoUrl ? (
                    <img loading="lazy" decoding="async"
                      src={familyPhotoUrl}
                      alt={familyMemberName}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-400/50 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-emerald-300" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{familyMemberName}</h4>
                    <p className="text-xs text-purple-200">
                      {[familyRelation, familyPhone, familyEmail].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Jamaica Data Protection Act 2020 & Booking Platform Consent Checkbox (REQUIRED) */}
              <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-400/40 shadow-lg space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentDataProtection}
                    onChange={(e) => setConsentDataProtection(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-white/30 bg-black/50 shrink-0 cursor-pointer"
                    required
                  />
                  <div className="space-y-1">
                    <span className="text-xs text-slate-100 leading-relaxed block">
                      <strong className="text-emerald-400 font-bold block mb-0.5">
                        Client Consent Agreement (Required)
                      </strong>
                      "I consent to We Care storing my wellness information for care continuity under Jamaica Data Protection Act 2020. I understand We Care is a booking platform that connects me with independent licensed nurses and certified caregivers. We Care does not provide medical services directly. I am 18+ and booking for myself or authorized dependent."
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="relative z-10 p-5 sm:p-6 border-t border-white/10 bg-black/30 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
            >
              Back
            </button>
          ) : (
            <div className="text-xs text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignIn && onOpenSignIn();
                }}
                className="text-[#C77DFF] font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <span>Continue to Step {step + 1}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteRegistration}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] via-purple-600 to-[#F59E0B] hover:opacity-95 text-white font-extrabold text-xs shadow-xl shadow-purple-950/60 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sign Up &amp; Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpenForPatient}
        onClose={() => setIsCameraOpenForPatient(false)}
        onPhotoCaptured={(photo) => {
          setPatientPhotoUrl(photo);
          soundFX.playSuccessPing();
        }}
        title="Take Patient Profile Photo"
      />

      {/* Family Member Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpenForFamily}
        onClose={() => setIsCameraOpenForFamily(false)}
        onPhotoCaptured={(photo) => {
          setFamilyPhotoUrl(photo);
          soundFX.playSuccessPing();
        }}
        title="Take Trusted Family Member Photo"
      />
    </div>
  );
};
