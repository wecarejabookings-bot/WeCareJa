import { createClient } from '@supabase/supabase-js';

// Safe URL sanitation
function sanitizeUrl(raw?: string): string {
  const fallback = 'https://qyhbyoojbmaguujzmdwz.supabase.co';
  if (!raw) return fallback;
  const match = raw.match(/https?:\/\/[^\s'"\)]+/i);
  return match ? match[0].replace(/\/+$/, '') : fallback;
}

function sanitizeKey(raw?: string): string {
  const fallback = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmbGdkZnZqaWdiY25hZ2N1aXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MzYxMDQsImV4cCI6MjEwNjQxMjEwNH0.45kAiQU70KDqdvR5L_hFO9b6Cjyhkb28ymSBYdEueDQ';
  if (!raw) return fallback;
  let clean = raw.trim().replace(/^['"]+|['"]+$/g, '');
  clean = clean.replace(/^(?:key:\s*|anon:\s*|value:\s*)+/i, '').trim();
  if (!clean || clean.startsWith('Go to') || clean.length < 20) {
    return fallback;
  }
  return clean;
}

const rawUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || process.env?.VITE_SUPABASE_URL;
const rawKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || !rawKey || rawUrl.includes('your-project') || rawKey.startsWith('Go to')) {
  console.error('MISSING SUPABASE ENV', { url: rawUrl, keyExists: !!rawKey });
}

export const url = sanitizeUrl(rawUrl);
export const key = sanitizeKey(rawKey);

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const supabaseClient = supabase;
export default supabase;
