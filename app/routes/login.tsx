import React, { useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Heart, Stethoscope, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export async function handleLoginWithSelfHeal(emailInput: string, passwordInput: string) {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error('Email not confirmed. Please check your email inbox to confirm your account.');
    }
    throw error;
  }

  if (!data?.user) {
    throw new Error('Authentication succeeded but user record not found.');
  }

  // Self-heal: check if profile exists; if not, auto-create one with role='nurse'
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, address, trn')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!existingProfile) {
    console.log('[Self-Heal] User logged in with no profile. Auto-creating profile for:', data.user.id);
    const meta = data.user.user_metadata || {};
    const fullName = meta.full_name || meta.name || email.split('@')[0] || 'Nurse Practitioner';
    const role = meta.role || 'nurse';
    const phone = meta.phone || '';
    const address = meta.address || 'Kingston, Jamaica';
    const trn = meta.trn || '';

    const { error: insertError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: role,
      phone: phone,
      address: address,
      trn: trn
    }, { onConflict: 'id' });

    if (insertError) {
      console.warn('[Self-Heal] Notice creating profile:', insertError.message);
    }
  }

  return data;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await handleLoginWithSelfHeal(email, password);
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f0a26] border-2 border-[#F59E0B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-[#1E1B4B] font-black shadow-lg"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Heart className="w-6 h-6 fill-[#1E1B4B]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">We Care Jamaica</h1>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            Clinical Registry &amp; Nurse Portal Login
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="nurse@wecare.jm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-xs font-black text-[#1E1B4B] shadow-xl transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: '#F59E0B' }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <a href="/nurse-signup" className="text-xs text-amber-300 hover:underline">
            Don't have an account? Sign up with an invite pass
          </a>
        </div>
      </div>
    </div>
  );
}
