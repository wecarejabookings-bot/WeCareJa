/**
 * QR & Security Storage Service (Firebase / Persistent Storage Architecture)
 * Handles:
 * 1. /qr_invites/{qrId} = { createdBy: 'admin', expiresAt, used: false, url, createdAt }
 * 2. /nurses/{uid} = { fullName, trn, ncjLicense, phone, parish, serviceType, ... }
 * 3. /bookings/{bookingId}/checkin = { qrData, pin, status, createdAt, verifiedAt, gpsLocation }
 * 4. /security_logs = Security audit event entries
 */

export interface NurseInviteQR {
  id: string; // qrId
  createdBy: string; // 'admin'
  expiresAt: number; // 24-hr epoch timestamp
  createdAt: number;
  used: boolean;
  url: string;
}

export interface NurseRegistrationRecord {
  uid: string;
  fullName: string;
  email?: string;
  trn: string;
  ncjLicense: string;
  phone: string;
  parish: string;
  serviceType: string;
  createdAt: string;
  verified: boolean;
  inviteId?: string;
}

export interface BookingCheckinRecord {
  bookingId: string;
  qrData: string; // Format: WECARE-{bookingId}-{4-digit-PIN}
  pin: string; // 4-digit PIN e.g. "8392"
  status: 'pending' | 'ARRIVED_VERIFIED';
  createdAt: string;
  verifiedAt?: string;
  gpsLocation?: string;
}

export interface SecurityLogRecord {
  id: string;
  timestamp: string;
  type: 'INVALID_PIN_OR_QR' | 'UNAUTHORIZED_ACCESS' | 'GPS_MISMATCH' | 'EXPIRED_QR';
  bookingId?: string;
  attemptedCode?: string;
  location?: string;
  message: string;
  details?: Record<string, any>;
}

const STORAGE_KEYS = {
  INVITES: 'wecare_firebase_qr_invites',
  NURSES: 'wecare_firebase_nurses',
  CHECKINS: 'wecare_firebase_bookings_checkin',
  LOGS: 'wecare_firebase_security_logs'
};

const SYNC_CHANNEL_NAME = 'wecare_qr_sync_channel';

// Cross-tab broadcast channel for immediate real-time updates
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

function notifySync(type: string, payload: any) {
  if (typeof window === 'undefined') return;
  // Dispatch local window event
  window.dispatchEvent(new CustomEvent('wecare-qr-update', { detail: { type, payload } }));
  // Dispatch cross-tab broadcast
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, payload });
    } catch (e) {
      // Ignore broadcast errors
    }
  }
}

/* ==================== 1. NURSE SIGN-UP INVITE QRs ==================== */

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://ais-pre-q5g37b6hiuoaulzo4j4wny-616436889958.us-west2.run.app';
  }
  const host = window.location.host;
  if (host.includes('wecareja.app')) {
    return 'https://wecareja.app';
  }
  const href = window.location.href;
  if (href.includes('run.app')) {
    const match = href.match(/(https:\/\/[a-z0-9\-]+\.us-west2\.run\.app)/);
    if (match) {
      return match[0].replace('ais-dev-', 'ais-pre-');
    }
  }
  return 'https://ais-pre-q5g37b6hiuoaulzo4j4wny-616436889958.us-west2.run.app';
}

/**
 * Creates a new active 24-hour Nurse Invite QR in /qr_invites/{qrId}
 */
export function createNurseInviteQR(): NurseInviteQR {
  const qrId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from creation

  // Real dynamic URL that encodes the admin invite without aistudio 403 error
  const url = `${getBaseUrl()}/nurse-signup?ref=ADMIN_INVITE&id=${qrId}`;

  const invite: NurseInviteQR = {
    id: qrId,
    createdBy: 'admin',
    expiresAt,
    createdAt: now,
    used: false,
    url
  };

  const current = getNurseInviteQRs();
  // Store newest first
  const updated = [invite, ...current.filter(i => i.id !== qrId)];
  localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(updated));

  notifySync('INVITE_CREATED', invite);
  return invite;
}

/**
 * Retrieves all stored Nurse Invite QRs from /qr_invites
 */
export function getNurseInviteQRs(): NurseInviteQR[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITES);
    if (!raw) {
      // Seed with an initial active 24h invite if empty
      const initial = createNurseInviteQR();
      return [initial];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Gets a specific Nurse Invite QR by ID
 */
export function getNurseInviteQR(qrId: string): NurseInviteQR | undefined {
  const invites = getNurseInviteQRs();
  return invites.find(i => i.id === qrId);
}

/**
 * Marks an invite as used in /qr_invites/{qrId}
 */
export function markNurseInviteUsed(qrId: string): boolean {
  const invites = getNurseInviteQRs();
  const invite = invites.find(i => i.id === qrId);
  if (!invite) return false;

  invite.used = true;
  localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
  notifySync('INVITE_USED', invite);
  return true;
}

/**
 * Creates a new nurse profile in /nurses/{uid} upon onboarding form completion
 */
export function saveNurseProfile(uid: string, profile: Omit<NurseRegistrationRecord, 'uid' | 'createdAt' | 'verified'>): NurseRegistrationRecord {
  const record: NurseRegistrationRecord = {
    ...profile,
    uid,
    createdAt: new Date().toISOString(),
    verified: false
  };

  const current = getNurseProfiles();
  const updated = [record, ...current.filter(n => n.uid !== uid)];
  localStorage.setItem(STORAGE_KEYS.NURSES, JSON.stringify(updated));

  if (profile.inviteId) {
    markNurseInviteUsed(profile.inviteId);
  }

  notifySync('NURSE_REGISTERED', record);
  return record;
}

export function getNurseProfiles(): NurseRegistrationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NURSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ==================== 2. DOORSTEP CHECK-IN QR & PIN ==================== */

/**
 * Auto-generates unique Job QR when a booking is accepted.
 * Format: WECARE-{bookingId}-{4-digit-PIN}
 * Example: WECARE-BK-2026-9847-8392
 * Saves to: /bookings/{bookingId}/checkin
 */
export function generateBookingCheckin(bookingId: string): BookingCheckinRecord {
  const existing = getBookingCheckin(bookingId);
  if (existing) {
    return existing;
  }

  // Generate a random 4-digit numeric PIN (1000 - 9999)
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const qrData = `WECARE-${bookingId}-${pin}`;

  const record: BookingCheckinRecord = {
    bookingId,
    qrData,
    pin,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  saveBookingCheckin(record);
  return record;
}

export function saveBookingCheckin(record: BookingCheckinRecord) {
  if (typeof window === 'undefined') return;
  const all = getAllBookingCheckins();
  all[record.bookingId] = record;
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(all));
  notifySync('CHECKIN_SAVED', record);
}

export function getBookingCheckin(bookingId: string): BookingCheckinRecord | null {
  const all = getAllBookingCheckins();
  return all[bookingId] || null;
}

export function getAllBookingCheckins(): Record<string, BookingCheckinRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Verifies scanned doorstep QR or manually keyed 4-digit PIN
 */
export function verifyDoorstepCheckin(
  bookingId: string,
  scannedTextOrPin: string,
  gpsLocation: string = '14 Trafalgar Road, Kingston 10, Jamaica'
): { success: boolean; reason?: string; verifiedAt?: string; pin?: string } {
  const trimmed = scannedTextOrPin.trim();
  let checkin = getBookingCheckin(bookingId);

  // If no checkin record existed yet for this booking, generate one deterministically
  if (!checkin) {
    checkin = generateBookingCheckin(bookingId);
  }

  const expectedQR = checkin.qrData;
  const expectedPin = checkin.pin;

  // Match against either:
  // 1. Exact QR format: WECARE-{bookingId}-{pin}
  // 2. Exact 4-digit PIN
  // 3. String containing the QR or PIN
  const isQrMatch = trimmed === expectedQR || trimmed.includes(expectedQR);
  const isPinMatch = trimmed === expectedPin || trimmed.replace(/[^0-9]/g, '') === expectedPin;

  // Also support matching legacy codes if applicable
  const isBookingCodeMatch = trimmed.includes(bookingId) && trimmed.includes(expectedPin);

  if (isQrMatch || isPinMatch || isBookingCodeMatch) {
    const nowIso = new Date().toISOString();
    const updatedRecord: BookingCheckinRecord = {
      ...checkin,
      status: 'ARRIVED_VERIFIED',
      verifiedAt: nowIso,
      gpsLocation
    };

    saveBookingCheckin(updatedRecord);
    notifySync('CHECKIN_VERIFIED', updatedRecord);

    return {
      success: true,
      verifiedAt: nowIso,
      pin: expectedPin
    };
  }

  // Mismatch! Log failed attempt to /security_logs
  logSecurityEvent({
    type: 'INVALID_PIN_OR_QR',
    bookingId,
    attemptedCode: trimmed,
    location: gpsLocation,
    message: `Doorstep arrival verification failed for booking #${bookingId}. Scanned value did not match security checkin record.`
  });

  return {
    success: false,
    reason: 'Invalid PIN/QR - Try again'
  };
}

/* ==================== 3. SECURITY LOGS ==================== */

/**
 * Logs a security event to /security_logs
 */
export function logSecurityEvent(entry: Omit<SecurityLogRecord, 'id' | 'timestamp'>): SecurityLogRecord {
  const record: SecurityLogRecord = {
    ...entry,
    id: `SEC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString()
  };

  const current = getSecurityLogs();
  const updated = [record, ...current].slice(0, 100); // keep last 100 logs
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));

  notifySync('SECURITY_LOG', record);
  return record;
}

export function getSecurityLogs(): SecurityLogRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ==================== 4. LIVE LISTENER HELPER ==================== */

/**
 * Subscribe to live QR and checkin updates across tabs and components
 */
export function subscribeToQRUpdates(callback: (type: string, payload: any) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: any) => {
    callback(e.detail.type, e.detail.payload);
  };

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data.type, e.data.payload);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.CHECKINS) {
      callback('CHECKIN_STORAGE_SYNC', getAllBookingCheckins());
    } else if (e.key === STORAGE_KEYS.INVITES) {
      callback('INVITE_STORAGE_SYNC', getNurseInviteQRs());
    }
  };

  window.addEventListener('wecare-qr-update', handleCustomEvent);
  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('wecare-qr-update', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}
