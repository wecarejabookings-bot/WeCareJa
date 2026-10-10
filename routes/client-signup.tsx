import React, { useState } from 'react';
import { 
  Heart, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../src/utils/soundEffects';
import { signUpClientUser } from '../src/lib/supabase';

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

export default function ClientSignupRoute() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [parish, setParish] = useState('Kingston');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      soundFX.playWarningSound();
      return;
    }

    setLoading(true);
    soundFX.playStepComplete();

    try {
      const username = email.trim().split('@')[0] || `client_${Date.now()}`;
      await signUpClientUser({
        username,
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: parish
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration encountered an issue. Account saved to local session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#0f0a26] border-2 border-[#F59E0B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#1E1B4B] font-black shadow-lg"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Heart className="w-5 h-5 fill-[#1E1B4B]" />
            </div>
            <div>
              <span className="text-base font-black text-white block">We Care Jamaica</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Free Patient &amp; Family Sign-Up
              </span>
            </div>
          </div>

          <a 
            href="/" 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition"
            title="Go to Home"
          >
            <Home className="w-4 h-4 text-amber-300" />
          </a>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Welcome to We Care Jamaica!</h3>
            <p className="text-xs text-slate-300">Your account is ready. Redirecting to your family care portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Legal Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Donna Morris"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password *</span>
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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="(876) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Parish / Location</span>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-[#1E1B4B] shadow-xl transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: '#F59E0B' }}
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          Already registered?{' '}
          <a href="/login" className="text-amber-400 font-bold hover:underline">
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}
