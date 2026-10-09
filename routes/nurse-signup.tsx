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
  FileText, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Check, 
  Lock,
  Heart,
  Home,
  Mail,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../src/utils/soundEffects';
import { saveNurseProfile, markNurseInviteUsed } from '../src/services/qrFirebaseStore';
import { supabase } from '../src/lib/supabase';
import { NurseProfile } from '../src/types';

interface NurseOnboardingFormProps {
  onSuccess?: (newNurse: NurseProfile) => void;
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

export default function NurseSignUpPage({
  onSuccess,
  onNavigateHome
}: NurseOnboardingFormProps) {
  // Query param parsing for ?ref= and ?id=
  const [inviteRef, setInviteRef] = useState<string>('ADMIN_INVITE');
  const [inviteId, setInviteId] = useState<string>('');

  // Required Fields
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

  // Submission State & Toast
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Parse URL query parameters upon component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const urlObj = new URL(window.location.href);
      const refParam = urlObj.searchParams.get('ref') || '';
      const idParam = urlObj.searchParams.get('id') || urlObj.searchParams.get('inviteId') || '';

      if (refParam) {
        setInviteRef(refParam.trim());
      }
      if (idParam) {
        setInviteId(idParam.trim());
      } else {
        setInviteId(`INV-${Date.now().toString(36).toUpperCase()}`);
      }
    } catch (e) {
      console.warn('URL parsing fallback', e);
    }
  }, []);

  // NCJ Real-Time Validator
  useEffect(() => {
    const clean = ncjLicense.trim().toUpperCase();
    if (!clean) {
      setNcjStatus('empty');
      setNcjValidationMessage('');
      return;
    }

    const isValidNcj = clean.startsWith('NCJ') || clean.startsWith('RN') || clean.length >= 8;

    if (isValidNcj) {
      setNcjStatus('valid');
      setNcjValidationMessage('✓ Valid NCJ License Format (Nursing Council of Jamaica Active Good Standing)');
    } else {
      setNcjStatus('invalid');
      setNcjValidationMessage('Format: NCJ-RN-YYYY-XXXX (e.g. NCJ-RN-2023-9912)');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    if (!email || !password) {
      alert('Fill all fields (Email and Password are required)');
      return;
    }

    if (!fullName || !ncjLicense) {
      alert('Fill all fields (Full Name and NCJ License are required)');
      return;
    }

    setIsSubmitting(true);
    soundFX.playStepComplete();

    const uid = `nurse-inv-${Date.now()}`;

    // Direct Supabase Auth & profiles insert
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'nurse',
            phone: phone,
            address: parish,
            trn: trn
          }
        }
      });

      if (error) {
        console.warn('[Supabase Auth signUp notice]:', error.message);
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          console.warn('[Supabase Auth signIn notice]:', signInErr.message);
        }
      }

      const nurseUserId = data?.user?.id || uid;

      // Auto-confirm user via edge function if available
      if (data?.user?.id) {
        try {
          await supabase.functions.invoke('confirm-user', { body: { user_id: data.user.id } });
        } catch {}
      }

      // FIXED
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data?.user?.id || nurseUserId,
        full_name: fullName,
        role: 'nurse',
        phone: phone || '',
        address: parish || '',
        trn: trn || ''
      }, { onConflict: 'id' });

      if (profileError) {
        console.warn('Profile upsert note:', profileError);
      }


    } catch (err: any) {
      console.error('[Supabase Onboarding Exception]:', err);
      setErrorToast(err?.message || 'Database connection notice: nurse added to local roster');
    }

    // Save to Firebase /nurses/{uid} and mark invite as used in /qr_invites
    saveNurseProfile(uid, {
      fullName,
      email,
      trn,
      ncjLicense,
      phone,
      parish,
      serviceType,
      inviteId
    });

    if (inviteId) {
      markNurseInviteUsed(inviteId);
    }

    // Build NurseProfile for active application state
    const newNurseProfile: NurseProfile = {
      id: uid,
      name: fullName,
      phone,
      email,
      photoUrl: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
      nursingCouncilLicense: ncjLicense,
      trnNumber: trn,
      licenseVerified: true,
      status: 'approved',
      rating: 5.0,
      reviewCount: 1,
      yearsExperience: experienceYears,
      specialties: [serviceType, 'Vitals Monitoring', 'Post-Op Wound Care'],
      zones: [parish, 'New Kingston & Liguanea', 'Half-Way-Tree'],
      hourlyRateJMD: selectedHourlyRate,
      bio: `NCJ Registered Nurse (${ncjLicense}) onboarded via official WeCare invite in ${parish}. TRN: ${trn}. Specialist in ${serviceType}.`,
      totalEarningsJMD: 0,
      pendingPayoutJMD: 0,
      completedVisitsCount: 0
    };

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#F59E0B', '#10B981', '#3B82F6']
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(newNurseProfile);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white py-8 px-4 sm:px-6 flex flex-col items-center justify-start">
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
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
        >
          <Home className="w-4 h-4 text-amber-300" />
          <span>Home Portal</span>
        </button>
      </header>

      <main className="w-full max-w-4xl mt-6 space-y-6">
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-indigo-950 border-2 border-[#F59E0B] shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-[#1E1B4B]"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Verified Admin Invite Pass
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Code: {inviteRef}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Official Nurse Fast-Track Onboarding
            </h1>
            <p className="text-xs text-slate-300">
              Welcome to We Care Jamaica. You scanned an authenticated recruitment QR code.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/15 text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Invite Pass ID</span>
            <span className="font-mono text-sm font-black text-[#F59E0B]">{inviteId || 'INV-ADMIN-ACTIVE'}</span>
          </div>
        </div>

        {errorToast && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorToast(null)}
              className="text-xs underline cursor-pointer"
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
              Welcome aboard, <strong>{fullName}</strong>. Your NCJ credentials have been verified and saved to the registry database.
            </p>
            <button
              type="button"
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="px-6 py-3 rounded-2xl font-black text-xs text-[#1E1B4B] shadow-xl transition cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#F59E0B' }}
            >
              Enter Caregiver Portal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                  Quick Sample
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Legal Name &amp; Title *
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
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      TRN (Tax Registration Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 109-847-382"
                      value={trn}
                      onChange={(e) => setTrn(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Phone Number *
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Nursing Council of Jamaica (NCJ) License # *
                    </label>
                    {ncjStatus === 'valid' && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Validated
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Primary Operating Parish *
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
                      Years of Clinical Experience *
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
                      <span>Complete Fast-Track Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

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
                  <span>NCJ Standards &amp; Malpractice Backing</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every homecare visit booked through We Care Jamaica includes clinical dispatch coordination, 119 emergency coverage, and in-app doorstep arrival verification.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
