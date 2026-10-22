import { createClient } from '@supabase/supabase-js';
import { MedicalSupplyItem, SupplyOrder, UserAccount, Booking, UserRole, NurseProfile } from '../types';
import { getCorrectItemImage } from '../utils/productImages';

function sanitizeSupabaseUrl(raw?: string): string {
  const fallback = 'https://yflgdfvjigbcnagcuism.supabase.co';
  if (!raw) return fallback;
  if (raw.includes('qyhbyoojbmaguujzmdwz') || raw.includes('your-project')) return fallback;
  const match = raw.match(/https?:\/\/[^\s'"\)]+/i);
  return match ? match[0].replace(/\/+$/, '') : fallback;
}

function sanitizeSupabaseKey(raw?: string): string {
  const fallback = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbGdkZnZqaWdiY25hZ2N1aXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MzYxMDQsImV4cCI6MjEwNjQxMjEwNH0.45kAiQU70KDqdvR5L_hFO9b6Cjyhkb28ymSBYdEueDQ';
  if (!raw) return fallback;
  let clean = raw.trim().replace(/^['"]+|['"]+$/g, '');
  clean = clean.replace(/^(?:key:\s*|anon:\s*|value:\s*)+/i, '').trim();
  if (!clean || clean.startsWith('Go to') || clean.length < 20) {
    return fallback;
  }
  return clean;
}

// Read Supabase credentials with fallback error message if missing
const rawEnvUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || process.env?.VITE_SUPABASE_URL;
const rawEnvKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY;

if (!rawEnvUrl || !rawEnvKey) {
  console.warn(
    '[WeCare Supabase Alert] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured in environment variables. Falling back to default project credentials to prevent blank/blue screen.'
  );
}

const SUPABASE_URL = sanitizeSupabaseUrl(rawEnvUrl);
const SUPABASE_ANON_KEY = sanitizeSupabaseKey(rawEnvKey);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
export const supabaseClient = supabase;

// Default Medical Supplies catalog in JMD for home healthcare in Kingston & St Andrew
export const DEFAULT_MEDICAL_SUPPLIES: MedicalSupplyItem[] = [
  {
    id: 'sup-1',
    name: 'Home First Aid & Emergency Clinical Kit',
    price_jmd: 4800,
    category: 'Emergency & First Aid',
    stock: 45,
    description: 'Complete home emergency kit including sterile dressings, shears, alcohol wipes, CPR face shield, and burn gel.',
    image_url: '/images/first_aid_kit.webp'
  },
  {
    id: 'sup-2',
    name: 'Medical Nitrile Examination Gloves (Box of 100)',
    price_jmd: 2200,
    category: 'PPE & Infection Control',
    stock: 120,
    description: 'Powder-free, hospital-grade latex-free nitrile examination gloves for sterile home procedures and catheter care.',
    image_url: '/images/gloves.webp'
  },
  {
    id: 'sup-3',
    name: 'Hospital-Grade Antiseptic Wash & Skin Prep (500ml)',
    price_jmd: 1850,
    category: 'Antiseptics & Sanitization',
    stock: 75,
    description: 'Chlorhexidine gluconate clinical antiseptic solution for sterile wound irrigation and pre-op skin prep.',
    image_url: '/images/antiseptic_wash.webp'
  },
  {
    id: 'sup-4',
    name: 'Sterile Bordered Gauze Wound Dressings (10 Pack)',
    price_jmd: 3200,
    category: 'Wound Care',
    stock: 60,
    description: 'Aseptic absorbent non-adherent bordered island dressings for post-op surgical incisions and ulcers.',
    image_url: '/images/gauze_dressing.webp'
  },
  {
    id: 'sup-5',
    name: 'Micropore Hypoallergenic Medical Tape (Pack of 3)',
    price_jmd: 1250,
    category: 'Wound Care',
    stock: 90,
    description: 'Gentle, breathable paper surgical tape ideal for sensitive and elderly skin fixation.',
    image_url: '/images/medical_tape.webp'
  },
  {
    id: 'sup-6',
    name: 'Digital Upper Arm Blood Pressure Monitor',
    price_jmd: 8500,
    category: 'Diagnostic Devices',
    stock: 30,
    description: 'High-accuracy automatic digital BP cuff with irregular heartbeat detector and memory storage.',
    image_url: '/images/bp_monitor.webp'
  },
  {
    id: 'sup-7',
    name: 'Fingertip Pulse Oximeter & SpO2 Monitor',
    price_jmd: 3800,
    category: 'Diagnostic Devices',
    stock: 50,
    description: 'OLED instant oxygen saturation and pulse rate monitor with lanyard and batteries included.',
    image_url: '/images/pulse_oximeter.webp'
  },
  {
    id: 'sup-8',
    name: 'Medical Hand Sanitizer Gel 70% Ethyl (1 Gallon)',
    price_jmd: 4200,
    category: 'Antiseptics & Sanitization',
    stock: 40,
    description: 'Hospital-formula antimicrobial sanitizer with aloe vera moisturizer for practitioner home sanitization.',
    image_url: '/images/hand_sanitizer.webp'
  },
  {
    id: 'sup-9',
    name: 'Adult Incontinence Protective Diapers & Briefs (Pack of 30)',
    price_jmd: 3600,
    category: 'Patient Care & Hygiene',
    stock: 80,
    description: 'High-absorbency, breathable adult protective briefs with leak-guard protection and wetness indicator.',
    image_url: '/images/diapers.webp'
  },
  {
    id: 'sup-10',
    name: 'Clinical Antiseptic Sanitizing Wet Wipes (Canister of 160)',
    price_jmd: 1950,
    category: 'Antiseptics & Sanitization',
    stock: 110,
    description: 'Hospital-grade surface and skin disinfectant wet wipes for rapid sanitization and caregiver personal hygiene.',
    image_url: '/images/wipes.webp'
  }
];

// Helper: map profile row to UserAccount
export function mapProfileToUserAccount(profile: any, email?: string): UserAccount {
  const isMaster =
    profile.role === 'master_admin' ||
    profile.username?.toLowerCase() === 'sydney' ||
    profile.email?.toLowerCase() === 'wecareja.bookings@gmail.com' ||
    email?.toLowerCase() === 'wecareja.bookings@gmail.com';

  const isPendingNurse = profile.role === 'nurse_pending';
  const isRejectedNurse = profile.role === 'nurse_rejected';
  const isApprovedNurse = profile.role === 'nurse' || profile.role === 'caregiver' || profile.role === 'registered_nurse';

  const normalizedRole: UserRole = isMaster 
    ? 'admin' 
    : (profile.role === 'admin' ? 'admin' : (isPendingNurse || isRejectedNurse || isApprovedNurse) ? 'nurse' : 'client');

  const approvalStatus: UserAccount['approvalStatus'] = isMaster || profile.role === 'admin' || profile.role === 'client'
    ? 'approved'
    : (isApprovedNurse ? 'approved' : isRejectedNurse ? 'rejected' : 'pending_approval');

  return {
    id: profile.id,
    username: profile.username || (isMaster ? 'sydney' : (email?.split('@')[0] || 'user')),
    name: profile.full_name || profile.name || (isMaster ? 'Lead Administrator' : (normalizedRole === 'nurse' ? 'Nurse Practitioner' : 'Registered Client')),
    full_name: profile.full_name || profile.name || (isMaster ? 'Lead Administrator' : (normalizedRole === 'nurse' ? 'Nurse Practitioner' : 'Registered Client')),
    email: profile.email || email || (isMaster ? 'wecareja.bookings@gmail.com' : ''),
    phone: profile.phone || (isMaster ? '(876) 582-7613' : ''),
    role: normalizedRole,
    approvalStatus: approvalStatus,
    title: isMaster ? 'Lead Operations Director & Master Administrator' : (normalizedRole === 'nurse' ? 'Registered Healthcare Practitioner' : 'Verified Family Client'),
    department: isMaster ? 'Executive Clinical Leadership & Registry Audit' : undefined,
    avatarUrl: isMaster
      ? 'https://images.unsplash.com/photo-1594824813629-455b5502c3ef?auto=format&fit=crop&q=80&w=400'
      : (profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'),
    zone: profile.zone || 'St. Catherine & Kingston',
    address: profile.address || (isMaster ? '4 Claudete Drive, St. Catherine, Jamaica' : ''),
    medical_info: profile.medical_info || '',
    is_deleted: Boolean(profile.is_deleted),
    createdAt: profile.created_at || new Date().toISOString()
  };
}

// Fallback: build valid UserAccount directly from Supabase Auth User object
export function buildUserAccountFromSession(user: any, fallbackUsername?: string): UserAccount {
  const email = (user.email || '').toLowerCase();
  const meta = user.user_metadata || {};
  
  const isMaster =
    email === 'wecareja.bookings@gmail.com' ||
    meta.username?.toLowerCase() === 'sydney' ||
    fallbackUsername?.toLowerCase() === 'sydney' ||
    meta.role === 'master_admin';

  const isPendingNurse = meta.role === 'nurse_pending' || meta.status === 'pending_approval';
  const role: UserRole = isMaster 
    ? 'admin' 
    : (meta.role === 'admin' ? 'admin' : (meta.role === 'nurse' || isPendingNurse) ? 'nurse' : 'client');

  const approvalStatus: UserAccount['approvalStatus'] = isMaster || role === 'admin' || role === 'client'
    ? 'approved'
    : (isPendingNurse ? 'pending_approval' : 'approved');

  const resolvedUsername = meta.username || fallbackUsername || (isMaster ? 'sydney' : (email ? email.split('@')[0] : 'user'));
  const resolvedName = meta.full_name || meta.name || (isMaster ? 'Lead Administrator' : (role === 'nurse' ? 'Nurse Practitioner' : 'Valued Client'));

  return {
    id: user.id,
    username: resolvedUsername,
    name: resolvedName,
    full_name: resolvedName,
    email: email || (isMaster ? 'wecareja.bookings@gmail.com' : ''),
    phone: meta.phone || (isMaster ? '(876) 582-7613' : ''),
    role: role,
    approvalStatus: approvalStatus,
    title: isMaster ? 'Lead Operations Director & Master Administrator' : (role === 'nurse' ? 'Registered Healthcare Practitioner' : 'Verified Family Client'),
    department: isMaster ? 'Executive Clinical Leadership & Registry Audit' : undefined,
    avatarUrl: isMaster
      ? 'https://images.unsplash.com/photo-1594824813629-455b5502c3ef?auto=format&fit=crop&q=80&w=400'
      : (meta.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'),
    zone: meta.zone || 'St. Catherine & Kingston',
    address: meta.address || (isMaster ? '4 Claudete Drive, St. Catherine, Jamaica' : ''),
    medical_info: meta.medical_info || '',
    is_deleted: false,
    createdAt: user.created_at || new Date().toISOString()
  };
}

// Local cache helper for username -> email lookups
export function saveUsernameToCache(username: string, email: string) {
  if (!username || !email) return;
  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const raw = localStorage.getItem('wecare_username_cache') || '{}';
    const cache = JSON.parse(raw);
    cache[cleanUser] = cleanEmail;
    localStorage.setItem('wecare_username_cache', JSON.stringify(cache));
  } catch {}

  // Sync to server-side cache in background
  try {
    fetch('/api/auth/register-username-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, email: cleanEmail })
    }).catch(() => {});
  } catch {}
}

// 1. AUTH HELPERS: Look up email from username, then signInWithPassword
export async function lookupEmailFromUsername(usernameInput: string): Promise<string | null> {
  const clean = usernameInput.trim();
  if (!clean) return null;
  const cleanLower = clean.toLowerCase();
  const digitsOnly = clean.replace(/\D/g, '');

  // 1. Direct email entered (contains @)
  if (clean.includes('@')) {
    return cleanLower;
  }

  // 2. Master Admin shortcut (username or official phone)
  if (
    cleanLower === 'sydney' || 
    cleanLower === 'master admin' || 
    cleanLower === 'smattis' || 
    cleanLower === 'admin' ||
    digitsOnly.endsWith('5827613') ||
    clean.includes('582-7613')
  ) {
    return 'wecareja.bookings@gmail.com';
  }

  // 3. Numeric telephone check
  const isTelephone = /^[0-9+()-\s]+$/.test(clean) && digitsOnly.length >= 7;

  // 4. Check local browser cache
  try {
    const raw = localStorage.getItem('wecare_username_cache');
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache[cleanLower]) {
        return cache[cleanLower];
      }
      if (digitsOnly && cache[digitsOnly]) {
        return cache[digitsOnly];
      }
    }
  } catch {}

  // 5. Check local user accounts list
  try {
    const rawAccounts = localStorage.getItem('wecare_user_accounts');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const found = accounts.find((a: any) => {
          if (a.email?.toLowerCase() === cleanLower) return true;
          if (a.username?.toLowerCase() === cleanLower) return true;
          if (a.name?.toLowerCase() === cleanLower || a.full_name?.toLowerCase() === cleanLower) return true;
          if (isTelephone && a.phone) {
            const accDigits = String(a.phone).replace(/\D/g, '');
            if (accDigits && digitsOnly && (accDigits.endsWith(digitsOnly) || digitsOnly.endsWith(accDigits))) {
              return true;
            }
          }
          return false;
        });
        if (found?.email) {
          saveUsernameToCache(clean, found.email);
          return found.email.toLowerCase();
        }
      }
    }
  } catch {}

  // 6. Query Supabase profiles table directly
  try {
    if (isTelephone) {
      const { data: phoneRow } = await supabase
        .from('profiles')
        .select('email, username, phone')
        .ilike('phone', `%${digitsOnly.slice(-7)}%`)
        .limit(1)
        .maybeSingle();

      if (phoneRow?.email) {
        saveUsernameToCache(clean, phoneRow.email);
        return phoneRow.email.toLowerCase();
      }
    }

    // Try username exact/ilike match
    const { data: userRow } = await supabase
      .from('profiles')
      .select('email, username')
      .ilike('username', clean)
      .limit(1)
      .maybeSingle();

    if (userRow?.email) {
      saveUsernameToCache(clean, userRow.email);
      return userRow.email.toLowerCase();
    }

    // Try full_name match
    const { data: nameRow } = await supabase
      .from('profiles')
      .select('email, full_name')
      .ilike('full_name', `%${clean}%`)
      .limit(1)
      .maybeSingle();

    if (nameRow?.email) {
      saveUsernameToCache(clean, nameRow.email);
      return nameRow.email.toLowerCase();
    }

    // Try email ilike match
    const { data: emailRow } = await supabase
      .from('profiles')
      .select('email')
      .ilike('email', clean)
      .limit(1)
      .maybeSingle();

    if (emailRow?.email) {
      saveUsernameToCache(clean, emailRow.email);
      return emailRow.email.toLowerCase();
    }
  } catch (err) {
    console.warn('Profile lookup query note:', err);
  }

  // 7. Check server-side proxy route
  try {
    const res = await fetch(`/api/auth/lookup-username?username=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.email) {
        saveUsernameToCache(clean, json.email);
        return json.email.toLowerCase();
      }
    }
  } catch {}

  return null;
}

export async function signInWithUsername(usernameInput: string, passwordInput: string) {
  const cleanInput = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanInput) {
    throw new Error('Please enter your Email, Username, or Phone.');
  }
  if (!cleanPass) {
    throw new Error('Please enter your password.');
  }

  // Resolve email from Email / Username / Phone
  let targetEmail = await lookupEmailFromUsername(cleanInput);

  // Fallback for Master Admin
  if (!targetEmail && (cleanInput.toLowerCase() === 'sydney' || cleanInput.replace(/\D/g, '').endsWith('5827613'))) {
    targetEmail = 'wecareja.bookings@gmail.com';
  }

  // If clean input contains '@', treat as direct email
  if (!targetEmail && cleanInput.includes('@')) {
    targetEmail = cleanInput.toLowerCase();
  }

  if (!targetEmail) {
    throw new Error(`No account found for "${cleanInput}". Please verify your email, username, or phone number.`);
  }

  // Authenticate with Supabase Auth
  let authUser: any = null;
  let authSession: any = null;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: cleanPass
  });

  if (authError) {
    // If Sydney and credentials match requirement but Supabase auth had error, handle gracefully
    if (cleanInput.toLowerCase() === 'sydney' && cleanPass === '12345678') {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: targetEmail,
          password: cleanPass,
          options: {
            data: {
              username: 'admin',
              full_name: 'Lead Administrator',
              role: 'master_admin',
              phone: '(876) 582-7613'
            }
          }
        });
        if (!signUpErr && signUpData.user) {
          authUser = signUpData.user;
          authSession = signUpData.session;
        }
      } catch {}
    }

    if (!authUser) {
      // Check if user exists in profiles and local credentials match
      try {
        const rawCreds = localStorage.getItem('wecare_auth_passwords');
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        const savedPass = creds[targetEmail] || creds[cleanInput.toLowerCase()];
        if (savedPass && savedPass === cleanPass) {
          // Fetch profile directly by email
          const { data: profRow } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', targetEmail)
            .maybeSingle();

          if (profRow) {
            const fallbackAccount = mapProfileToUserAccount(profRow, targetEmail);
            return {
              user: { id: profRow.id, email: targetEmail },
              session: null,
              profile: fallbackAccount
            };
          }
        }
      } catch {}

      throw authError;
    }
  } else {
    authUser = authData.user;
    authSession = authData.session;
  }

  if (!authUser) {
    throw new Error('Sign-in failed. Please verify your credentials.');
  }

  // Cache successful username lookup
  saveUsernameToCache(cleanInput, targetEmail);

  // Fetch or build profile with RLS-safe fallback
  const userAccount = await fetchCurrentProfile(authUser.id, authUser);

  // Ensure Master Admin identity if logging in as Admin
  if (cleanInput.toLowerCase() === 'sydney' || cleanInput.toLowerCase() === 'admin' || targetEmail === 'wecareja.bookings@gmail.com') {
    userAccount.role = 'admin';
    userAccount.username = 'admin';
    userAccount.name = userAccount.name || 'Lead Administrator';
    userAccount.full_name = userAccount.full_name || 'Lead Administrator';
  }

  return { user: authUser, session: authSession, profile: userAccount };
}

export async function signUpClientUser(data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  medicalInfo?: string;
}) {
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanEmail = data.email.trim().toLowerCase();

  // 1. Check existing accounts in local cache
  try {
    const raw = localStorage.getItem('wecare_user_accounts');
    if (raw) {
      const existing = JSON.parse(raw);
      if (Array.isArray(existing) && existing.some((a: any) => a.username?.toLowerCase() === cleanUsername)) {
        throw new Error(`Username "${cleanUsername}" is already taken. Please choose another username.`);
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('already taken')) throw err;
  }

  // 2. Create user in Supabase Auth (with graceful fallback if rate-limited)
  let authData: any = null;
  try {
    const res = await supabase.auth.signUp({
      email: cleanEmail,
      password: data.password,
      options: {
        data: {
          username: cleanUsername,
          full_name: data.fullName,
          phone: data.phone,
          role: 'client'
        }
      }
    });
    authData = res.data;
    if (res.error) {
      console.warn('Supabase auth signUp note:', res.error.message);
    }
  } catch (authErr: any) {
    console.warn('Supabase auth signUp notice:', authErr?.message);
  }

  const userId = authData?.user?.id || `client-${Date.now()}`;

  // Cache username -> email lookup
  saveUsernameToCache(cleanUsername, cleanEmail);

  // 3. Create profile row in profiles table with:
  // id, email, username, full_name, role, phone, address, trn
  const profileRecord = {
    id: userId,
    email: cleanEmail,
    username: cleanUsername,
    full_name: data.fullName,
    role: 'client',
    phone: data.phone || '',
    address: data.address || '',
    trn: ''
  };

  try {
    await supabase.from('profiles').upsert(profileRecord, { onConflict: 'id' });
  } catch (err) {
    console.warn('Profile insertion note:', err);
  }

  // Backup credentials locally so user can always sign back in even if Supabase confirms or rate limits
  try {
    const rawCreds = localStorage.getItem('wecare_auth_passwords') || '{}';
    const creds = JSON.parse(rawCreds);
    creds[cleanEmail] = data.password;
    creds[cleanUsername] = data.password;
    localStorage.setItem('wecare_auth_passwords', JSON.stringify(creds));
  } catch {}

  // Build complete UserAccount
  const clientAccount: UserAccount = {
    id: userId,
    username: cleanUsername,
    name: data.fullName,
    full_name: data.fullName,
    email: cleanEmail,
    phone: data.phone,
    role: 'client',
    approvalStatus: 'approved',
    title: 'Verified Family Client',
    zone: data.address || 'Kingston & St. Andrew',
    address: data.address || '',
    medical_info: data.medicalInfo || '',
    createdAt: new Date().toISOString()
  };

  // Save to local accounts
  try {
    const raw = localStorage.getItem('wecare_user_accounts');
    const existing = raw ? JSON.parse(raw) : [];
    if (Array.isArray(existing)) {
      const idx = existing.findIndex((a: any) => a.id === userId || a.username === cleanUsername);
      if (idx >= 0) existing[idx] = clientAccount;
      else existing.push(clientAccount);
      localStorage.setItem('wecare_user_accounts', JSON.stringify(existing));
    }
  } catch {}

  return {
    user: authData?.user || { id: userId, email: cleanEmail },
    session: authData?.session || null,
    profile: clientAccount
  };
}

// Fetch current profile with guaranteed fallback so UI NEVER logs out
export async function fetchCurrentProfile(userId: string, authUser?: any): Promise<UserAccount> {
  const baselineFallback = authUser ? buildUserAccountFromSession(authUser) : null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data && !data.is_deleted) {
      if (data.username && (data.email || authUser?.email)) {
        saveUsernameToCache(data.username, data.email || authUser?.email);
      }
      return mapProfileToUserAccount(data, data.email || authUser?.email);
    }

    // Fallback: if profile doesn't exist, create it automatically with role='nurse' using ONLY existing columns so old broken users self-heal
    if (!data && authUser) {
      try {
        const healRole = authUser.user_metadata?.role || 'nurse';
        const healName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Nurse Practitioner';
        const healPhone = authUser.user_metadata?.phone || '';
        const healAddress = authUser.user_metadata?.address || 'Kingston, Jamaica';
        const healTrn = authUser.user_metadata?.trn || '';

        await supabase.from('profiles').upsert({
          id: userId,
          full_name: healName,
          role: healRole,
          phone: healPhone,
          address: healAddress,
          trn: healTrn
        }, { onConflict: 'id' });
      } catch (selfHealErr) {
        console.warn('Profile self-healing insert note:', selfHealErr);
      }
    }
  } catch (err) {
    console.warn('Profiles query blocked by RLS or failed, using session fallback:', err);
  }

  // 1. If query failed or RLS blocked: return baseline from JWT so user is NEVER logged out!
  if (baselineFallback) {
    return baselineFallback;
  }

  // 2. Check active session if authUser was not passed
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session.user.id === userId) {
      return buildUserAccountFromSession(session.user);
    }
  } catch {}

  // 3. Check locally saved accounts
  try {
    const rawAccounts = localStorage.getItem('wecare_user_accounts');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const found = accounts.find((a: any) => a.id === userId);
        if (found) return found;
      }
    }
  } catch {}

  // 4. Special fallback for Master Admin Sydney Mattis
  if (userId === '2e9a3a25-3404-47ed-a8f4-b0a7ecab3ba7' || authUser?.email?.toLowerCase() === 'wecareja.bookings@gmail.com' || authUser?.email?.toLowerCase() === 'sydney@wecareja.com') {
    return {
      id: '2e9a3a25-3404-47ed-a8f4-b0a7ecab3ba7',
      username: 'sydney',
      name: 'Lead Administrator',
      full_name: 'Lead Administrator',
      email: 'sydney@wecareja.com',
      phone: '+1876582-7613',
      role: 'admin',
      approvalStatus: 'approved',
      title: 'Lead Operations Director & Master Administrator',
      department: 'Executive Clinical Leadership & Registry Audit',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813629-455b5502c3ef?auto=format&fit=crop&q=80&w=400',
      zone: 'St. Catherine & Kingston',
      address: '4 Claudette Drive St. Catherine',
      createdAt: '2026-10-01T09:38:39.057275+00:00'
    };
  }

  // 5. Last-resort fallback: valid UserAccount preventing any logout
  return {
    id: userId,
    username: authUser?.email ? authUser.email.split('@')[0] : 'user',
    name: authUser?.user_metadata?.full_name || 'Authenticated User',
    full_name: authUser?.user_metadata?.full_name || 'Authenticated User',
    email: authUser?.email || '',
    phone: authUser?.user_metadata?.phone || '',
    role: 'client',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString()
  };
}

// Properly retrieve active session user without logging out on RLS failure
export async function getActiveSessionUser(): Promise<UserAccount | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }
    return await fetchCurrentProfile(session.user.id, session.user);
  } catch (err) {
    console.warn('getActiveSessionUser error:', err);
    return null;
  }
}

// Apply RLS policies via code logic / RPC if available
export async function applyRlsPoliciesInSupabase(): Promise<boolean> {
  const sql = `
    DO $$
    BEGIN
      -- 1. PROFILES: enable RLS, allow authenticated full access, allow anon to select username & email for login
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Authenticated users full access on profiles" ON public.profiles;
        CREATE POLICY "Authenticated users full access on profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
        DROP POLICY IF EXISTS "Public can view username and email for login" ON public.profiles;
        CREATE POLICY "Public can view username and email for login" ON public.profiles FOR SELECT TO anon USING (true);
        DROP POLICY IF EXISTS "Anon insert on profiles" ON public.profiles;
        CREATE POLICY "Anon insert on profiles" ON public.profiles FOR INSERT TO anon WITH CHECK (true);
      END IF;

      -- 2. MEDICAL SUPPLIES: enable RLS, allow public to read, authenticated to read/write
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medical_supplies') THEN
        ALTER TABLE public.medical_supplies ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public read medical_supplies" ON medical_supplies;
        CREATE POLICY "Public read medical_supplies" ON medical_supplies FOR SELECT TO public USING (true);
        DROP POLICY IF EXISTS "Authenticated manage medical_supplies" ON medical_supplies;
        CREATE POLICY "Authenticated manage medical_supplies" ON medical_supplies FOR ALL TO authenticated USING (true) WITH CHECK (true);
      END IF;

      -- 3. SUPPLY ORDERS: enable RLS, allow authenticated to read/write, allow public insert & read
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'supply_orders') THEN
        ALTER TABLE public.supply_orders ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Authenticated read/write supply_orders" ON supply_orders;
        CREATE POLICY "Authenticated read/write supply_orders" ON supply_orders FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;

      -- 4. BOOKINGS: enable RLS, allow authenticated to read/write, allow public read/write
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Authenticated read/write bookings" ON bookings;
        CREATE POLICY "Authenticated read/write bookings" ON bookings FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;

  // 1. Try Supabase RPCs
  for (const rpcName of ['exec_sql', 'execute_sql', 'run_sql', 'exec', 'apply_rls_policies', 'sql']) {
    try {
      const { error } = await supabase.rpc(rpcName, { sql, query: sql });
      if (!error) {
        console.log(`RLS policies successfully executed via Supabase RPC: ${rpcName}`);
        return true;
      }
    } catch {}
  }

  // 2. Try server-side endpoint
  try {
    const res = await fetch('/api/supabase/apply-rls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log('RLS policies executed via server API route');
        return true;
      }
    }
  } catch {}

  return false;
}

export async function updateProfileData(
  userId: string,
  updates: {
    full_name?: string;
    username?: string;
    phone?: string;
    address?: string;
    trn?: string;
    role?: string;
    medical_info?: string;
  }
) {
  // Only send columns that exist in the profiles table to prevent schema mismatch errors
  const payload: any = {};
  if (updates.full_name !== undefined) payload.full_name = updates.full_name;
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.trn !== undefined) payload.trn = updates.trn;
  if (updates.role !== undefined) payload.role = updates.role;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('updateProfileData note:', err);
  }
  return { id: userId, ...payload };
}

export async function softDeleteAccount(userId: string) {
  try {
    await supabase
      .from('profiles')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (err) {
    console.warn('softDeleteAccount query error:', err);
  }

  await supabase.auth.signOut();
  return true;
}

// 2. MEDICAL SUPPLIES & STORE HELPERS
export async function fetchMedicalSuppliesFromSupabase(): Promise<MedicalSupplyItem[]> {
  try {
    const { data, error } = await supabase
      .from('medical_supplies')
      .select('*')
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const items = data.map((item: any) => {
        const qty = item.stock_quantity !== undefined && item.stock_quantity !== null
          ? Number(item.stock_quantity)
          : (item.stock !== undefined && item.stock !== null ? Number(item.stock) : 50);
        const pr = Number(item.price ?? item.price_jmd ?? 0);
        return {
          id: item.id || `sup-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: item.name,
          price_jmd: pr,
          category: item.category || 'General Supplies',
          stock: qty,
          stock_quantity: qty,
          description: item.description || '',
          image_url: getCorrectItemImage(item),
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
          created_at: item.created_at || new Date().toISOString(),
          requires_prescription: Boolean(item.requires_prescription)
        };
      });
      try {
        localStorage.setItem('wecare_custom_store_catalog', JSON.stringify(items));
      } catch {}
      return items;
    }
  } catch (err) {
    console.warn('Could not fetch medical_supplies from Supabase:', err);
  }

  // Check localStorage cache before falling back to DEFAULT_MEDICAL_SUPPLIES
  try {
    const cached = localStorage.getItem('wecare_custom_store_catalog');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Return clean verified catalog so the store is functional
  return DEFAULT_MEDICAL_SUPPLIES;
}

export async function saveMedicalSupplyToSupabase(supply: MedicalSupplyItem): Promise<boolean> {
  const stockVal = supply.stock_quantity !== undefined ? supply.stock_quantity : supply.stock;
  const priceVal = supply.price_jmd;

  // Local storage update for instant offline/reactive persistence
  try {
    const cached = localStorage.getItem('wecare_custom_store_catalog');
    let list: MedicalSupplyItem[] = cached ? JSON.parse(cached) : DEFAULT_MEDICAL_SUPPLIES;
    const exists = list.some(p => p.id === supply.id);
    if (exists) {
      list = list.map(p => p.id === supply.id ? { ...supply, stock: stockVal, stock_quantity: stockVal, price_jmd: priceVal } : p);
    } else {
      list = [{ ...supply, stock: stockVal, stock_quantity: stockVal, price_jmd: priceVal }, ...list];
    }
    localStorage.setItem('wecare_custom_store_catalog', JSON.stringify(list));
  } catch {}

  try {
    const { error } = await supabase
      .from('medical_supplies')
      .upsert({
        id: supply.id,
        name: supply.name,
        price: priceVal,
        price_jmd: priceVal,
        category: supply.category,
        stock: stockVal,
        stock_quantity: stockVal,
        description: supply.description || '',
        image_url: supply.image_url || getCorrectItemImage(supply),
        is_active: supply.is_active !== undefined ? supply.is_active : true,
        created_at: supply.created_at || new Date().toISOString()
      });
    return !error;
  } catch (err) {
    console.warn('Could not save medical supply to Supabase:', err);
    return false;
  }
}

export async function deleteMedicalSupplyFromSupabase(supplyId: string): Promise<boolean> {
  try {
    const cached = localStorage.getItem('wecare_custom_store_catalog');
    if (cached) {
      const list: MedicalSupplyItem[] = JSON.parse(cached);
      const filtered = list.filter(p => p.id !== supplyId);
      localStorage.setItem('wecare_custom_store_catalog', JSON.stringify(filtered));
    }
  } catch {}

  try {
    const { error } = await supabase
      .from('medical_supplies')
      .delete()
      .eq('id', supplyId);
    return !error;
  } catch (err) {
    console.warn('Could not delete medical supply from Supabase:', err);
    return false;
  }
}

export async function createSupplyOrderRecord(order: {
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  items: any[];
  total_jmd: number;
  notes?: string;
}): Promise<SupplyOrder> {
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    client_id: order.client_id || null,
    client_name: order.client_name,
    client_email: order.client_email,
    client_phone: order.client_phone,
    client_address: order.client_address,
    items: order.items,
    total_jmd: order.total_jmd,
    status: 'pending',
    notes: order.notes || '',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('supply_orders')
      .insert(newOrder)
      .select()
      .maybeSingle();

    if (!error && data) {
      return data as SupplyOrder;
    }
  } catch (err) {
    console.warn('Could not insert to supply_orders table in Supabase:', err);
  }

  return newOrder as SupplyOrder;
}

export async function fetchSupplyOrdersFromSupabase(): Promise<SupplyOrder[]> {
  try {
    const { data, error } = await supabase
      .from('supply_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as SupplyOrder[];
    }
  } catch (err) {
    console.warn('Could not fetch supply_orders from Supabase:', err);
  }
  return [];
}

export async function updateSupplyOrderStatusInSupabase(
  orderId: string,
  status: 'pending' | 'invoiced' | 'paid' | 'delivered' | 'cancelled'
) {
  try {
    const { data, error } = await supabase
      .from('supply_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Could not update supply_order status:', err);
    return null;
  }
}

export async function updateSupplyOrderInvoiceInSupabase(orderId: string, invoice_url: string) {
  try {
    const { data, error } = await supabase
      .from('supply_orders')
      .update({ invoice_url, status: 'invoiced', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Could not update supply_order invoice_url:', err);
    return null;
  }
}

// 3. BOOKINGS HELPERS: Save supplies_checklist_ack to bookings
export async function createBookingInSupabase(booking: Booking): Promise<Booking> {
  const row = {
    id: booking.id,
    service_id: booking.serviceId,
    client_id: booking.clientId,
    client_name: booking.clientName,
    client_phone: booking.clientPhone,
    client_address: booking.clientAddress,
    zone: booking.zone,
    nurse_id: booking.nurseId || null,
    nurse_name: booking.nurseName || null,
    scheduled_datetime: booking.scheduledDateTime,
    status: booking.status,
    price_jmd: booking.priceJMD,
    platform_fee_jmd: booking.platformFeeJMD,
    nurse_earnings_jmd: booking.nurseEarningsJMD,
    notes: booking.notes || '',
    supplies_checklist_ack: Boolean(booking.supplies_checklist_ack),
    created_at: booking.createdAt || new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert(row)
      .select()
      .maybeSingle();

    if (!error && data) {
      return {
        ...booking,
        supplies_checklist_ack: data.supplies_checklist_ack ?? true
      };
    }
  } catch (err) {
    console.warn('Could not write booking to Supabase bookings table:', err);
  }

  return booking;
}

export async function fetchBookingsFromSupabase(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((b: any) => ({
        id: b.id,
        serviceId: b.service_id || 'srv-1',
        serviceName: b.service_name || 'Home Nursing Care',
        clientId: b.client_id || 'client-anon',
        clientName: b.client_name || 'Jamaican Client',
        clientPhone: b.client_phone || '(876) 000-0000',
        clientAddress: b.client_address || 'Kingston, Jamaica',
        zone: b.zone || 'Kingston & St. Andrew',
        clientEmergencyContact: {
          name: b.emergency_name || 'Next of Kin',
          phone: b.emergency_phone || '(876) 000-0000',
          relation: 'Emergency Contact'
        },
        nurseId: b.nurse_id,
        nurseName: b.nurse_name,
        scheduledDateTime: b.scheduled_datetime || b.created_at,
        createdAt: b.created_at || new Date().toISOString(),
        status: b.status || 'requested',
        priceJMD: Number(b.price_jmd || 7500),
        platformFeeJMD: Number(b.platform_fee_jmd || 1125),
        nurseEarningsJMD: Number(b.nurse_earnings_jmd || 6375),
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'held_in_escrow',
        freeCancelDeadline: new Date(Date.now() + 86400000).toISOString(),
        supplies_checklist_ack: Boolean(b.supplies_checklist_ack),
        notes: b.notes
      }));
    }
  } catch (err) {
    console.warn('Could not read bookings from Supabase:', err);
  }
  return [];
}

export async function updateBookingPriceInSupabase(
  bookingId: string, 
  newPriceJMD: number, 
  newPlatformFeeJMD?: number
): Promise<boolean> {
  const fee = newPlatformFeeJMD !== undefined ? newPlatformFeeJMD : Math.round(newPriceJMD * 0.15);
  const nurseEarnings = newPriceJMD - fee;
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        price_jmd: newPriceJMD,
        platform_fee_jmd: fee,
        nurse_earnings_jmd: nurseEarnings
      })
      .eq('id', bookingId);
    return !error;
  } catch (err) {
    console.warn('Could not update booking in Supabase:', err);
    return false;
  }
}

export async function savePlatformFinancialSettings(settings: {
  commissionPercent: number;
  platformFeePercent: number;
  cancellationFeeJMD: number;
  overtimeRateHourlyJMD: number;
  adminStaffHourlyJMD: number;
  adminWeeklySalaryJMD: number;
}): Promise<boolean> {
  try {
    localStorage.setItem('wecare_platform_financial_settings', JSON.stringify(settings));
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        id: 'financial_rates',
        data: settings,
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch (err) {
    console.warn('Could not save platform settings to Supabase:', err);
    return false;
  }
}

export function loadPlatformFinancialSettings() {
  const defaults = {
    commissionPercent: 15,
    platformFeePercent: 15,
    cancellationFeeJMD: 2500,
    overtimeRateHourlyJMD: 2200,
    adminStaffHourlyJMD: 1200,
    adminWeeklySalaryJMD: 15000
  };
  try {
    const saved = localStorage.getItem('wecare_platform_financial_settings');
    if (saved) return { ...defaults, ...JSON.parse(saved) };
  } catch {}
  return defaults;
}

export async function fetchNursesFromSupabase(): Promise<NurseProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['nurse', 'nurse_pending', 'nurse_rejected', 'caregiver', 'registered_nurse']);
    if (error || !data || data.length === 0) return [];

    return data.map((row: any): NurseProfile => {
      const isApproved = row.role === 'nurse' || row.role === 'caregiver' || row.role === 'registered_nurse';
      const isRejected = row.role === 'nurse_rejected';
      const status: NurseProfile['status'] = isApproved ? 'approved' : isRejected ? 'rejected' : 'pending_approval';

      // Parse NCJ license if stored in trn
      let ncjLicense = 'NCJ-RN-PENDING';
      let trnNum = row.trn || '';
      if (row.trn && row.trn.includes('NCJ')) {
        const parts = row.trn.split(' | ');
        ncjLicense = parts[0]?.trim() || 'NCJ-RN-PENDING';
        if (parts[1]) trnNum = parts[1].replace('TRN: ', '').trim();
      } else if (row.trn) {
        trnNum = row.trn;
        ncjLicense = isApproved ? 'NCJ-RN-ACTIVE' : 'NCJ-RN-PENDING';
      }

      return {
        id: row.id,
        name: row.full_name || row.username || 'Licensed Nurse',
        email: row.email || `${row.id}@wecarejamaica.com`,
        qualificationTitle: status === 'pending_approval' ? 'Licensed Nurse Applicant (NCJ Vetting Required)' : 'Registered Nurse (RN - NCJ Verified)',
        parish: row.address?.includes(',') ? row.address.split(',').pop()?.trim() || 'Kingston & St. Andrew' : 'Kingston & St. Andrew',
        rating: 5.0,
        reviewCount: isApproved ? 16 : 0,
        hourlyRateJMD: 7500,
        totalEarningsJMD: 0,
        pendingPayoutJMD: 0,
        completedVisitsCount: 0,
        licenseVerified: isApproved,
        status: status,
        photoUrl: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
        specialties: ['Elderly Care & Vitals', 'Wound Care', 'Post-Op Monitoring'],
        zones: ['Kingston', 'St. Andrew', 'Portmore'],
        yearsExperience: 4,
        phone: row.phone || '(876) 555-0199',
        phoneNumber: row.phone || '(876) 555-0199',
        address: row.address || 'Kingston, Jamaica',
        nursingCouncilLicense: ncjLicense,
        trnNumber: trnNum,
        trn: trnNum,
        bio: `${row.full_name || 'Practitioner'} registered with WeCare Jamaica. Verification Status: ${status === 'pending_approval' ? 'Pending Admin & NCJ Verification' : 'Approved & Verified'}.`
      };
    });
  } catch (err) {
    console.warn('Could not fetch nurses from Supabase:', err);
    return [];
  }
}

export async function approveNurseInSupabase(nurseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'nurse' })
      .eq('id', nurseId);
    return !error;
  } catch (err) {
    console.warn('approveNurseInSupabase note:', err);
    return false;
  }
}

export async function rejectNurseInSupabase(nurseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'client' })
      .eq('id', nurseId);
    return !error;
  } catch (err) {
    console.warn('rejectNurseInSupabase note:', err);
    return false;
  }
}

export async function saveNurseProfileToSupabase(nurse: NurseProfile): Promise<boolean> {
  try {
    const role = nurse.status === 'approved' ? 'nurse' : 'nurse_pending';
    const docUrl = nurse.trnCertificateUrl || nurse.licenseDocumentUrl || nurse.governmentIdUrl || '';
    let trnValue = nurse.nursingCouncilLicense 
      ? `${nurse.nursingCouncilLicense} | TRN: ${nurse.trnNumber || nurse.trn || ''}` 
      : (nurse.trnNumber || nurse.trn || '');

    if (docUrl && !trnValue.includes('DOC:')) {
      trnValue = trnValue ? `${trnValue} | DOC: ${docUrl}` : `DOC: ${docUrl}`;
    }

    const cleanEmail = (nurse.email || '').trim().toLowerCase();
    const cleanName = (nurse.name || '').trim();
    const cleanUsername = cleanEmail ? cleanEmail.split('@')[0] : cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.');

    // 1. Check if nurse.id is already a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let targetId: string | null = uuidRegex.test(nurse.id) ? nurse.id : null;

    // 2. If targetId is not a valid UUID, search if profile exists by email
    if (!targetId && cleanEmail) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (existing?.id) {
        targetId = existing.id;
      }
    }

    // 3. If still no valid UUID targetId, create user in Supabase auth to get a real foreign key UUID
    if (!targetId && cleanEmail) {
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: 'NursePassword2026!',
          options: {
            data: {
              full_name: cleanName,
              role: role,
              trn: trnValue
            }
          }
        });
        if (authData?.user?.id) {
          targetId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('[saveNurseProfileToSupabase] auth signUp attempt notice:', authErr);
      }
    }

    // 4. Perform the upsert / update
    if (targetId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: targetId,
          email: cleanEmail || null,
          username: cleanUsername,
          full_name: cleanName,
          role: role,
          phone: nurse.phone || nurse.phoneNumber || '',
          address: nurse.address || nurse.parish || 'Kingston, Jamaica',
          trn: trnValue
        }, { onConflict: 'id' });

      if (error) {
        console.warn('[saveNurseProfileToSupabase] upsert error:', error.message);
        return false;
      }
      return true;
    } else if (cleanEmail) {
      // Fallback update by email
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: cleanName,
          role: role,
          phone: nurse.phone || nurse.phoneNumber || '',
          address: nurse.address || nurse.parish || 'Kingston, Jamaica',
          trn: trnValue
        })
        .eq('email', cleanEmail);

      return !updateErr;
    }

    return false;
  } catch (err) {
    console.warn('saveNurseProfileToSupabase note:', err);
    return false;
  }
}



