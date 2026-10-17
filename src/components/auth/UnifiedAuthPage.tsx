import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Award,
  Check,
  Fingerprint,
  Clock
} from 'lucide-react';
import { UserRole, NurseProfile, UserAccount } from '../../types';
import { UnifiedSignupPortal } from './UnifiedSignupPortal';
import { supabase, lookupEmailFromUsername } from '../../lib/supabase';
import confetti from 'canvas-confetti';

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

interface UnifiedAuthPageProps {
  onComplete?: (user?: any) => void;
  onCancel?: () => void;
  initialRole?: UserRole;
  initialMode?: 'signup' | 'signin';
}

export const UnifiedAuthPage: React.FC<UnifiedAuthPageProps> = ({
  onComplete,
  onCancel,
  initialRole = 'client',
  initialMode = 'signup'
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(true);
  const [phone, setPhone] = useState('');
  const [parish, setParish] = useState('Kingston');
  const [address, setAddress] = useState('');
  
  // Nurse 5-step registration package & credential uploads
  const [nurseStep, setNurseStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [institutionAttended, setInstitutionAttended] = useState('The UWI School of Nursing Mona (UWISON)');
  const [dateOfBirth, setDateOfBirth] = useState('1994-04-18');
  const [gender, setGender] = useState('female');
  const [yearsExperience, setYearsExperience] = useState<number>(5);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Next of Kin / Relative');
  
  // Credentials & Document uploads
  const [trn, setTrn] = useState('');
  const [ncjLicense, setNcjLicense] = useState('');
  const [specialty, setSpecialty] = useState('Elderly & Geriatric Home Care');
  const [hourlyRate, setHourlyRate] = useState<number>(7500);
  const [bio, setBio] = useState('');
  
  // Uploaded Files State (Base64 data URLs)
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [govIdFrontUrl, setGovIdFrontUrl] = useState<string>('');
  const [govIdFrontFileName, setGovIdFrontFileName] = useState<string>('');
  const [govIdBackUrl, setGovIdBackUrl] = useState<string>('');
  const [govIdBackFileName, setGovIdBackFileName] = useState<string>('');
  const [driversLicenseNumber, setDriversLicenseNumber] = useState<string>('');
  const [dlFrontUrl, setDlFrontUrl] = useState<string>('');
  const [dlFrontFileName, setDlFrontFileName] = useState<string>('');
  const [dlBackUrl, setDlBackUrl] = useState<string>('');
  const [dlBackFileName, setDlBackFileName] = useState<string>('');
  const [trnCertUrl, setTrnCertUrl] = useState<string>('');
  const [trnCertFileName, setTrnCertFileName] = useState<string>('');
  const [licenseDocUrl, setLicenseDocUrl] = useState<string>('');
  const [licenseDocFileName, setLicenseDocFileName] = useState<string>('');
  
  // Banking / Lynk for Payouts
  const [bankName, setBankName] = useState('National Commercial Bank (NCB) Jamaica');
  const [accountNumber, setAccountNumber] = useState('');
  const [lynkWallet, setLynkWallet] = useState('');
  const [signedTerms, setSignedTerms] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Parse URL query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role');
        const urlMode = urlParams.get('mode');

        if (urlRole === 'nurse' || urlRole === 'client' || urlRole === 'admin') {
          setRole(urlRole as UserRole);
        }
        if (urlMode === 'signin' || urlMode === 'login') {
          setMode('signin');
        } else if (urlMode === 'signup' || urlMode === 'register') {
          setMode('signup');
        }
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim() ? `${address.trim()}, ${parish}` : parish;
    const cleanUsername = cleanEmail.split('@')[0] || `user_${Date.now()}`;

    try {
      if (mode === 'signin') {
        const cleanIdent = email.trim();
        let targetEmail = await lookupEmailFromUsername(cleanIdent);
        if (!targetEmail && cleanIdent.includes('@')) {
          targetEmail = cleanIdent.toLowerCase();
        }
        if (!targetEmail && (cleanIdent.toLowerCase() === 'sydney' || cleanIdent.replace(/\D/g, '').endsWith('5827613'))) {
          targetEmail = 'wecareja.bookings@gmail.com';
        }
        if (!targetEmail) {
          throw new Error(`No account found for "${cleanIdent}". Please check your email, username, or phone.`);
        }

        // Sign In Flow
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: cleanPassword
        });

        if (authError) {
          throw new Error(authError.message || 'Invalid email or password');
        }

        const user = authData.user;
        if (user) {
          // Check profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const activeRole: UserRole = (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || 'client';
          
          // Save to localStorage
          try {
            localStorage.setItem('wecare_current_user_id', user.id);
            const userObj: UserAccount = {
              id: user.id,
              username: cleanUsername,
              name: profile?.full_name || user.user_metadata?.full_name || cleanFullName || 'User',
              email: cleanEmail,
              role: activeRole,
              phone: profile?.phone || cleanPhone,
              address: profile?.address || cleanAddress,
              trn: profile?.trn || '',
              createdAt: profile?.created_at || new Date().toISOString()
            };
            const existingRaw = localStorage.getItem('wecare_user_accounts');
            const list = existingRaw ? JSON.parse(existingRaw) : [];
            localStorage.setItem('wecare_user_accounts', JSON.stringify([userObj, ...list.filter((u: any) => u.id !== user.id)]));
          } catch {}

          setIsSuccess(true);
          setSuccessNotice(`Signed in successfully as ${profile?.full_name || cleanEmail}!`);
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          
          setTimeout(() => {
            if (onComplete) onComplete(user);
            else if (typeof window !== 'undefined') window.location.href = '/';
          }, 1000);
        }
        return;
      }

      // Sign Up Flow - ALWAYS FULL REGISTRATION WITH SELECTED ROLE
      if (!cleanFullName || !cleanEmail || !cleanPassword) {
        throw new Error('Please fill in your name, email, and password.');
      }

      let userId = `user-${Date.now()}`;

      // 1. Supabase Auth Sign Up
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanFullName,
              role: role, // NEVER default to client! Use selected role
              phone: cleanPhone,
              address: cleanAddress,
              trn: trn.trim()
            }
          }
        });

        if (authError) {
          console.warn('Supabase auth signUp note:', authError.message);
          // Attempt sign in if already registered
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword
          });
          if (signInData?.user) userId = signInData.user.id;
        } else if (authData?.user) {
          userId = authData.user.id;
        }
      } catch (authErr: any) {
        console.warn('Auth caught:', authErr);
      }

      // 2. Invoke confirm-user edge function
      if (userId && !userId.startsWith('user-')) {
        try {
          await supabase.functions.invoke('confirm-user', { body: { user_id: userId } });
        } catch {}
      }

      // 3. Upsert profiles table in Supabase
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: cleanFullName,
          role: role, // CRITICAL: Preserve exact selected role (nurse, client, admin)
          phone: cleanPhone,
          address: cleanAddress,
          trn: trn.trim() || ''
        }, { onConflict: 'id' });
      } catch (profErr) {
        console.warn('profiles upsert note:', profErr);
      }

      // 4. If Nurse, create and append NurseProfile to roster in 'pending_approval' for Admin Review
      if (role === 'nurse') {
        const newNurseProfile: NurseProfile = {
          id: userId,
          name: cleanFullName,
          phone: cleanPhone || '(876) 555-0199',
          email: cleanEmail,
          parish: parish,
          address: cleanAddress,
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
          institutionAttended: institutionAttended,
          nursingCouncilLicense: ncjLicense.trim() || 'NCJ-RN-PENDING',
          trnNumber: trn.trim() || '',
          trn: trn.trim() || '',
          licenseVerified: false,
          status: 'pending_approval',
          rating: 5.0,
          reviewCount: 0,
          yearsExperience: Number(yearsExperience) || 4,
          specialties: [specialty.trim() || 'Elderly & Geriatric Home Care', 'Vitals Monitoring'],
          zones: [parish, 'New Kingston', 'St. Andrew', 'Portmore'],
          hourlyRateJMD: Number(hourlyRate) || 7500,
          bio: bio.trim() || `Licensed Healthcare Practitioner serving ${parish} and surrounding areas.`,
          // Uploaded credential documents for Admin review
          governmentIdType: "Driver's License & National ID",
          governmentIdUrl: govIdFrontUrl || undefined,
          governmentIdBackUrl: govIdBackUrl || undefined,
          driversLicenseNumber: driversLicenseNumber.trim() || undefined,
          driversLicenseFrontUrl: dlFrontUrl || govIdFrontUrl || undefined,
          driversLicenseBackUrl: dlBackUrl || govIdBackUrl || undefined,
          trnCertificateUrl: trnCertUrl || undefined,
          licenseDocumentUrl: licenseDocUrl || undefined,
          bankDetails: {
            bankName: bankName,
            accountNumber: accountNumber || '•••• •••• PENDING',
            accountType: 'Savings',
            lynkWallet: lynkWallet || undefined
          },
          bioData: {
            dateOfBirth: dateOfBirth,
            gender: gender as any,
            residentialAddress: cleanAddress,
            residentialParish: parish,
            emergencyContact: {
              name: emergencyContactName || 'Family Contact',
              phone: emergencyContactPhone || cleanPhone,
              relation: emergencyContactRelation || 'Next of Kin'
            },
            nationalIdNumber: trn.trim()
          },
          submittedForReviewAt: new Date().toISOString(),
          totalEarningsJMD: 0,
          pendingPayoutJMD: 0,
          completedVisitsCount: 0
        };

        try {
          const rawNurses = localStorage.getItem('wecare_nurses');
          const currentList = rawNurses ? JSON.parse(rawNurses) : [];
          const updatedList = [newNurseProfile, ...currentList.filter((n: any) => n.id !== userId && n.email !== cleanEmail)];
          localStorage.setItem('wecare_nurses', JSON.stringify(updatedList));
        } catch {}
      }

      // 5. Build and save UserAccount locally
      const newAccount: UserAccount = {
        id: userId,
        username: cleanUsername,
        name: cleanFullName,
        email: cleanEmail,
        role: role,
        phone: cleanPhone,
        address: cleanAddress,
        trn: trn.trim() || '',
        createdAt: new Date().toISOString(),
        approvalStatus: role === 'nurse' ? 'pending_approval' : 'approved'
      };

      try {
        localStorage.setItem('wecare_current_user_id', userId);
        const rawAccounts = localStorage.getItem('wecare_user_accounts');
        const list = rawAccounts ? JSON.parse(rawAccounts) : [];
        localStorage.setItem('wecare_user_accounts', JSON.stringify([newAccount, ...list.filter((u: any) => u.id !== userId)]));
      } catch {}

      setIsSuccess(true);
      setSuccessNotice(role === 'nurse' ? 'Application submitted! All credentials uploaded for Admin review & approval before activation.' : `Registration successful as ${role === 'admin' ? 'Administrator' : 'Client / Patient'}!`);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

      setTimeout(() => {
        if (onComplete) onComplete(newAccount);
        else if (typeof window !== 'undefined') window.location.href = '/';
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white flex items-center justify-center p-4 sm:p-6 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-[#0f0a26]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#1E1B4B] font-black shadow-lg"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Heart className="w-5 h-5 fill-[#1E1B4B]" />
            </div>
            <div>
              <span className="text-base font-black text-white block">We Care Jamaica</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                {mode === 'signup' ? 'Unified Public Registration' : 'Account Sign In'}
              </span>
            </div>
          </div>

          <a 
            href="/"
            onClick={(e) => {
              if (onCancel) {
                e.preventDefault();
                onCancel();
              }
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition cursor-pointer"
            title="Go to Home"
          >
            <Home className="w-4 h-4 text-amber-300" />
          </a>
        </div>

        {/* Tab Toggle: Sign Up vs Sign In */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              if (typeof window !== 'undefined') {
                try {
                  window.history.replaceState({}, '', `/auth?mode=signup&role=${role}`);
                } catch {}
              }
            }}
            className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Account</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              if (typeof window !== 'undefined') {
                try {
                  window.history.replaceState({}, '', '/auth?mode=signin');
                } catch {}
              }
            }}
            className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-[#1E1B4B] to-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notice */}
        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">{successNotice}</h3>
            <p className="text-xs text-slate-300">Redirecting to your personalized portal...</p>
          </div>
        ) : (
          mode === 'signup' ? (
          <UnifiedSignupPortal
            initialRole={role}
            onComplete={(acc) => {
              if (onComplete) onComplete(acc);
              else if (typeof window !== 'undefined') window.location.href = '/';
            }}
            onSwitchToSignIn={() => setMode('signin')}
            embedded={true}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Global Toggle Button: Show / Hide Login Info */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Account Credentials</span>
              <button
                type="button"
                onClick={() => setShowLoginInfo(!showLoginInfo)}
                className="text-[11px] text-amber-300 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
              >
                <span>{showLoginInfo ? 'Hide Login Info' : 'Show Login Info'}</span>
              </button>
            </div>

            {/* Single Login Field: Email or Username or Phone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email or Username or Phone *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="px-2 py-0.5 text-xs text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  aria-label={showLogin ? 'Hide login info' : 'Show login info'}
                >
                  {showLogin ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showLogin ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLogin ? "text" : "password"}
                  required
                  placeholder="Email or Username or Phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                >
                  {showLogin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {showLoginInfo && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter your Email, Username (e.g. sydney), or Jamaican Phone (+876).
                </p>
              )}
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-[#1E1B4B] shadow-xl transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: '#F59E0B' }}
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )
        )}

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          {mode === 'signup' ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In here
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Sign Up free
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default UnifiedAuthPage;
