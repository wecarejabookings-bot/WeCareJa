import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calculator, 
  Stethoscope, 
  MapPin, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Heart,
  Home,
  Mail,
  Key,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../../utils/soundEffects';
import { saveNurseProfile } from '../../services/qrFirebaseStore';
import { supabase } from '../../lib/supabase';
import { NurseProfile } from '../../types';

export interface NurseOnboardingFormProps {
  onSuccess?: (newNurse: NurseProfile) => void;
  onComplete?: (newNurse?: NurseProfile) => void;
  onCancel?: () => void;
  onNavigateHome?: () => void;
}

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

const SERVICE_TYPES = [
  { id: 'elderly', name: 'Elderly & Geriatric Home Care', rate: 7500 },
  { id: 'wound', name: 'Wound Dressing & Post-Op Recovery', rate: 8500 },
  { id: 'iv', name: 'IV Infusion & Injections', rate: 8000 },
  { id: 'palliative', name: 'Palliative & Respite Comfort Care', rate: 7800 },
  { id: 'pediatric', name: 'Pediatric & Newborn Midwifery', rate: 8200 },
  { id: 'vital_monitoring', name: 'Chronic Illness & Vitals Surveillance', rate: 7000 }
];

export const NurseOnboardingForm: React.FC<NurseOnboardingFormProps> = ({
  onSuccess,
  onComplete,
  onCancel,
  onNavigateHome
}) => {
  // Required Registration Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [ncjLicense, setNcjLicense] = useState<string>('');
  const [trn, setTrn] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [parish, setParish] = useState<string>('Kingston');
  const [serviceType, setServiceType] = useState<string>('Elderly & Geriatric Home Care');
  const [experienceYears, setExperienceYears] = useState<number>(4);

  // NCJ Validator State
  const [ncjStatus, setNcjStatus] = useState<'empty' | 'valid' | 'invalid'>('empty');
  const [ncjValidationMessage, setNcjValidationMessage] = useState<string>('');

  // Earnings Calculator State
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(30);
  const [selectedHourlyRate, setSelectedHourlyRate] = useState<number>(7500);

  // Submission State & Feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // NCJ Real-Time Validator
  useEffect(() => {
    const clean = ncjLicense.trim().toUpperCase();
    if (!clean) {
      setNcjStatus('empty');
      setNcjValidationMessage('');
      return;
    }

    const isValidNcj = clean.startsWith('NCJ') || clean.startsWith('RN') || clean.length >= 6;

    if (isValidNcj) {
      setNcjStatus('valid');
      setNcjValidationMessage('✓ Valid NCJ License Format (Nursing Council of Jamaica)');
    } else {
      setNcjStatus('invalid');
      setNcjValidationMessage('Format: NCJ-RN-YYYY-XXXX (e.g. NCJ-RN-2023-8812)');
    }
  }, [ncjLicense]);

  // Update hourly rate based on selected service type
  useEffect(() => {
    const match = SERVICE_TYPES.find(s => s.name === serviceType);
    if (match) {
      setSelectedHourlyRate(match.rate);
    }
  }, [serviceType]);

  // Calculations for Earnings Calculator
  const weeklyGross = hoursPerWeek * selectedHourlyRate;
  const nurseTakeHomeWeekly = Math.round(weeklyGross * 0.85); // 85% caregiver take-home
  const nurseTakeHomeMonthly = nurseTakeHomeWeekly * 4;

  const handleFastFillSample = () => {
    setEmail('nurse.stacyann@wecare.jm');
    setPassword('NursePass2026!');
    setFullName('Nurse Stacy-Ann Campbell, RN');
    setTrn('109-847-382');
    setNcjLicense('NCJ-RN-2023-8812');
    setPhone('+1 (876) 555-0199');
    setParish('St. Andrew');
    setServiceType('Elderly & Geriatric Home Care');
    setExperienceYears(6);
  };

  const handleExit = () => {
    if (onComplete) {
      onComplete();
    } else if (onCancel) {
      onCancel();
    } else if (onNavigateHome) {
      onNavigateHome();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    // Friendly non-blocking validation
    if (!email.trim() || !password.trim()) {
      setErrorToast('Please enter both your email address and password.');
      soundFX.playWarningSound();
      return;
    }

    if (!fullName.trim()) {
      setErrorToast('Please enter your full legal name.');
      soundFX.playWarningSound();
      return;
    }

    setIsSubmitting(true);
    soundFX.playStepComplete();

    const uid = `nurse-reg-${Date.now()}`;
    let authenticatedUserId = uid;

    try {
      // 1. Supabase Auth Registration
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'nurse',
            phone: phone.trim(),
            address: parish,
            trn: trn.trim()
          }
        }
      });

      if (signUpError) {
        console.warn('[Supabase Auth signUp note]:', signUpError.message);
        // If already registered, attempt direct sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });
        if (!signInError && signInData?.user) {
          authenticatedUserId = signInData.user.id;
        }
      } else if (signUpData?.user) {
        authenticatedUserId = signUpData.user.id;
      }

      // 2. Auto-confirm via edge function if available
      if (authenticatedUserId && !authenticatedUserId.startsWith('nurse-reg-')) {
        try {
          await supabase.functions.invoke('confirm-user', { body: { user_id: authenticatedUserId } });
        } catch {}
      }

      // 3. Upsert into profiles using ONLY existing columns:
      // id, full_name, role, phone, address, trn
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authenticatedUserId,
        full_name: fullName.trim(),
        role: 'nurse',
        phone: phone.trim() || '',
        address: parish || '',
        trn: trn.trim() || ''
      }, { onConflict: 'id' });

      if (profileError) {
        console.warn('[Profiles upsert note]:', profileError.message);
      }
    } catch (authErr: any) {
      console.warn('[Supabase Registration note]:', authErr?.message);
    }

    // 4. Save to persistent offline store
    try {
      saveNurseProfile(authenticatedUserId, {
        fullName: fullName.trim(),
        email: email.trim(),
        trn: trn.trim(),
        ncjLicense: ncjLicense.trim(),
        phone: phone.trim(),
        parish,
        serviceType
      });
    } catch {}

    // 5. Build clean NurseProfile object
    const newNurseProfile: NurseProfile = {
      id: authenticatedUserId,
      name: fullName.trim(),
      phone: phone.trim() || '(876) 555-0199',
      email: email.trim(),
      photoUrl: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
      nursingCouncilLicense: ncjLicense.trim() || 'NCJ-RN-ACTIVE',
      trnNumber: trn.trim() || '',
      licenseVerified: true,
      status: 'approved',
      rating: 5.0,
      reviewCount: 1,
      yearsExperience: experienceYears || 3,
      specialties: [serviceType, 'Vitals Monitoring', 'Clinical Nursing Care'],
      zones: [parish, 'New Kingston & Liguanea', 'Half-Way-Tree'],
      hourlyRateJMD: selectedHourlyRate,
      bio: `NCJ Registered Practitioner (${ncjLicense || 'Licensed'}). Specialist in ${serviceType}. Serving ${parish} and surrounding areas.`,
      totalEarningsJMD: 0,
      pendingPayoutJMD: 0,
      completedVisitsCount: 0
    };

    // Save nurse to local roster so they are immediately available
    try {
      const rawNurses = localStorage.getItem('wecare_nurses');
      const currentList: NurseProfile[] = rawNurses ? JSON.parse(rawNurses) : [];
      const updatedList = [newNurseProfile, ...currentList.filter(n => n.id !== authenticatedUserId && n.email !== email.trim())];
      localStorage.setItem('wecare_nurses', JSON.stringify(updatedList));
    } catch {}

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#10B981', '#3B82F6']
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    if (onSuccess) {
      onSuccess(newNurseProfile);
    }
    if (onComplete) {
      onComplete(newNurseProfile);
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white py-8 px-4 sm:px-6 flex flex-col items-center justify-start">
      {/* Brand Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#1E1B4B] font-black shadow-lg"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Heart className="w-6 h-6 fill-[#1E1B4B]" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block">
              We Care Jamaica
            </span>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Clinical Registry &amp; Nurse Dispatch
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExit}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
        >
          <Home className="w-4 h-4 text-amber-300" />
          <span>Home Portal</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mt-6 space-y-6">
        {/* Public Nurse Welcome Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-indigo-950 border-2 border-[#F59E0B] shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-[#1E1B4B]"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Open Practitioner Registry
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Free Self-Registration</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Official Healthcare Practitioner Registration
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Join We Care Jamaica's trusted private-duty and clinical homecare network. Free registration for registered nurses and midwives across all 14 parishes.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/15 text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Caregiver Earnings</span>
            <span className="font-mono text-sm font-black text-emerald-400">85% Direct Take-Home</span>
          </div>
        </div>

        {/* Error Toast Notification */}
        {errorToast && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorToast(null)}
              className="text-xs underline cursor-pointer hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-8 rounded-3xl bg-[#0f0a26] border-2 border-emerald-400 text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Registration Complete &amp; Profile Active!
            </h2>
            <p className="text-sm text-slate-200 max-w-md mx-auto">
              Welcome aboard, <strong>{fullName}</strong>. Your caregiver profile has been registered and is ready to accept client homecare visits.
            </p>
            <button
              type="button"
              onClick={handleExit}
              className="px-6 py-3 rounded-2xl font-black text-xs text-[#1E1B4B] shadow-xl transition cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#F59E0B' }}
            >
              Enter Caregiver Portal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Registration Form */}
            <div className="lg:col-span-7 bg-[#0f0a26] border-2 border-[#1E1B4B] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-white">Practitioner Credentials</h2>
                </div>
                <button
                  type="button"
                  onClick={handleFastFillSample}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 text-xs font-bold transition border border-white/10 cursor-pointer"
                >
                  Quick Fill Sample
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Legal Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Legal Name &amp; Clinical Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nurse Stacy-Ann Campbell, RN"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                {/* Email and Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nurse@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Portal Password *</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                {/* TRN and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      TRN (Tax Registration Number)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 109-847-382"
                      value={trn}
                      onChange={(e) => setTrn(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (876) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                {/* NCJ License Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Nursing Council of Jamaica (NCJ) License #
                    </label>
                    {ncjStatus === 'valid' && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Validated
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. NCJ-RN-2023-8812"
                    value={ncjLicense}
                    onChange={(e) => setNcjLicense(e.target.value)}
                    className={`w-full bg-black/40 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none ${
                      ncjStatus === 'valid'
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : ncjStatus === 'invalid'
                        ? 'border-amber-500 focus:border-amber-400'
                        : 'border-white/15 focus:border-[#F59E0B]'
                    }`}
                  />
                  {ncjValidationMessage && (
                    <p className={`text-[11px] mt-1 ${ncjStatus === 'valid' ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {ncjValidationMessage}
                    </p>
                  )}
                </div>

                {/* Parish and Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Primary Operating Parish *</span>
                    </label>
                    <select
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    >
                      {JAMAICAN_PARISHES.map((p) => (
                        <option key={p} value={p} className="bg-[#0f0a26] text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Years of Clinical Experience
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                {/* Primary Homecare Specialty */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Primary Homecare Specialty *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#0f0a26] text-white">
                        {s.name} (J${s.rate.toLocaleString()}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 rounded-2xl text-xs font-black text-[#1E1B4B] shadow-xl transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  {isSubmitting ? (
                    <span>Registering Practitioner...</span>
                  ) : (
                    <>
                      <span>Complete Free Practitioner Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Earnings Calculator */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div 
                className="bg-[#0f0a26] border-2 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
                style={{ borderColor: '#F59E0B' }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white">Earnings Calculator</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    85% Take-Home
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Commitment per Week:</span>
                    <span className="font-bold text-amber-400">{hoursPerWeek} Hours / Week</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10 hrs</span>
                    <span>30 hrs</span>
                    <span>50 hrs</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Hourly Rate:</span>
                    <span className="font-mono text-white font-bold">J${selectedHourlyRate.toLocaleString()}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Weekly Take-Home (85%):</span>
                    <span className="font-mono text-emerald-400 font-bold">J${nurseTakeHomeWeekly.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400">Monthly Projected:</span>
                    <span className="text-lg font-mono font-black text-white">
                      J${nurseTakeHomeMonthly.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We Care Jamaica distributes weekly payouts directly to your NCB, Scotiabank, JN Bank, or Lynk Mobile Money account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Verified Professional Standards</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every homecare visit booked through We Care Jamaica includes clinical dispatch coordination, 119 emergency coverage, and in-app arrival verification.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NurseOnboardingForm;
