import { Booking, WhatsAppTemplate, WhatsAppMessageLogItem, TrustedFamilyMember } from '../types';
import { soundFX } from './soundEffects';

/**
 * Standard We Care Jamaica WhatsApp Business Number
 */
export const WECARE_WHATSAPP_BUSINESS_NUMBER = '+1 (876) 555-CARE';
export const WECARE_WHATSAPP_RAW_NUMBER = '18765552273';

/**
 * 4 Mandatory WhatsApp Templates for Meta Business Manager Approval
 */
export const META_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    name: 'wecare_start_code',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    body: 'We Care Jamaica: Nurse {{1}} has arrived for {{2}}. Start Code is {{3}}. Tell nurse the code or reply START {{3}} to start remotely. Visit: {{4}} at {{5}}.',
    description: 'Triggered when nurse arrives at doorstep. Dispatched to Family Helper to authorize and remotely start the clinical visit.',
    sampleVariables: ['Nurse Keisha (RN)', 'Mama Joyce', '4829', 'Elderly Care', '2:00 PM'],
    buttons: [
      { type: 'QUICK_REPLY', text: 'START 4829', value: 'START 4829' },
      { type: 'PHONE_NUMBER', text: 'Call Nurse', value: '+18765559012' },
      { type: 'URL', text: 'Open Live Map', value: 'https://wecareja.com/track/live' }
    ],
    metaSubmissionDate: '2026-09-18'
  },
  {
    name: 'wecare_end_code',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    body: 'We Care Jamaica: Nurse {{1}} is ready to finish for {{2}}. End Code is {{3}}. Reply END {{3}} to complete visit and release payment. Thank you.',
    description: 'Triggered when nurse marks care completed. Dispatched to Family Helper to verify services, complete visit, and release escrow payment.',
    sampleVariables: ['Nurse Keisha', 'Mama Joyce', '9174'],
    buttons: [
      { type: 'QUICK_REPLY', text: 'END 9174', value: 'END 9174' },
      { type: 'URL', text: 'View Notes', value: 'https://wecareja.com/notes/summary' },
      { type: 'URL', text: 'Report Issue', value: 'https://wecareja.com/support/report' }
    ],
    metaSubmissionDate: '2026-09-18'
  },
  {
    name: 'wecare_nurse_job_whatsapp',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    body: 'New Job - JMD {{1}} - {{2}}km away in {{3}}. Service: {{4}}. Accept? Reply YES to accept. View in app: {{5}}',
    description: 'Low-bandwidth fallback for nurses with poor cellular data connection to receive and accept dispatched shifts via WhatsApp SMS.',
    sampleVariables: ['JMD $3,000/hr', '1.2', 'Kingston 6', 'Elderly Care 2hrs', 'https://wecareja.com/app/jobs/102'],
    buttons: [
      { type: 'QUICK_REPLY', text: 'YES', value: 'YES' },
      { type: 'URL', text: 'View in App', value: 'https://wecareja.com/app/jobs/102' }
    ],
    metaSubmissionDate: '2026-09-18'
  },
  {
    name: 'wecare_receipt',
    category: 'UTILITY',
    status: 'APPROVED',
    language: 'en_US',
    body: 'Visit completed for {{1}}. Amount JMD {{2}} paid. Receipt: {{3}}. Rate your nurse: {{4}}',
    description: 'Automatic receipt and feedback prompt dispatched immediately upon successful remote or in-person check-out.',
    sampleVariables: ['Mama Joyce', 'JMD $6,000', 'https://wecareja.com/receipt/WC-8492', 'https://wecareja.com/rate/WC-8492'],
    buttons: [
      { type: 'URL', text: 'View Receipt PDF', value: 'https://wecareja.com/receipt/WC-8492' },
      { type: 'URL', text: 'Rate 5 Stars ⭐', value: 'https://wecareja.com/rate/WC-8492' }
    ],
    metaSubmissionDate: '2026-09-18'
  }
];

/**
 * Rate limit tracker: 5 attempts per 10 minutes per phone number
 */
interface RateLimitRecord {
  phone: string;
  timestamps: number[];
}
const RATE_LIMIT_STORAGE_KEY = 'wecare_whatsapp_rate_limits';

export function checkRateLimit(phone: string): { allowed: boolean; remainingAttempts: number; retryAfterMinutes?: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  let records: Record<string, number[]> = {};
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (raw) records = JSON.parse(raw);
  } catch {
    records = {};
  }

  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  const existingTimes = (records[cleanPhone] || []).filter(t => now - t < windowMs);

  if (existingTimes.length >= maxAttempts) {
    const oldest = existingTimes[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMinutes: Math.max(1, retryAfter)
    };
  }

  // Record this attempt
  existingTimes.push(now);
  records[cleanPhone] = existingTimes;
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(records));
  } catch {}

  return {
    allowed: true,
    remainingAttempts: maxAttempts - existingTimes.length
  };
}

/**
 * Deterministic 4-digit code generator for Start and End codes
 */
export function getBookingStartCode(booking: Booking): string {
  if (booking.startCode) return booking.startCode;
  if (booking.id === 'BK-8950' || booking.clientName.toLowerCase().includes('joyce')) return '4829';
  // Compute deterministic 4-digit number from booking id
  let hash = 0;
  for (let i = 0; i < booking.id.length; i++) {
    hash = (hash * 31 + booking.id.charCodeAt(i)) % 10000;
  }
  const code = (Math.abs(hash) || 4829).toString().padStart(4, '0');
  return code;
}

export function getBookingEndCode(booking: Booking): string {
  if (booking.endCode) return booking.endCode;
  if (booking.id === 'BK-8950' || booking.clientName.toLowerCase().includes('joyce')) return '9174';
  let hash = 0;
  for (let i = 0; i < booking.id.length; i++) {
    hash = (hash * 37 + booking.id.charCodeAt(i) + 17) % 10000;
  }
  const code = (Math.abs(hash) || 9174).toString().padStart(4, '0');
  return code;
}

/**
 * Check if the code has expired (codes expire 2 hours after scheduled end time)
 */
export function isCodeExpired(booking: Booking): boolean {
  if (!booking.scheduledDateTime) return false;
  const scheduledTime = new Date(booking.scheduledDateTime).getTime();
  const durationMs = (booking.baseDurationMinutes || 60) * 60 * 1000;
  const scheduledEnd = scheduledTime + durationMs;
  const expiryTime = scheduledEnd + 2 * 60 * 60 * 1000; // 2 hours after scheduled end
  return Date.now() > expiryTime;
}

/**
 * Local storage manager for WhatsApp Message Logs
 */
const WHATSAPP_LOGS_KEY = 'wecare_whatsapp_message_logs';

export function getStoredWhatsAppLogs(): WhatsAppMessageLogItem[] {
  try {
    const raw = localStorage.getItem(WHATSAPP_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveWhatsAppLog(item: WhatsAppMessageLogItem) {
  try {
    const existing = getStoredWhatsAppLogs();
    const updated = [item, ...existing].slice(0, 100);
    localStorage.setItem(WHATSAPP_LOGS_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactivity in all open components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wecare_whatsapp_update', { detail: item }));
    }
  } catch (e) {
    console.error('Failed to save WhatsApp log:', e);
  }
}

/**
 * Send WhatsApp Start Code to Family Helper (Template: wecare_start_code)
 */
export function sendFamilyStartCodeWhatsApp(
  booking: Booking,
  familyMember?: TrustedFamilyMember,
  nurseNameOverride?: string
): WhatsAppMessageLogItem {
  const nurseName = nurseNameOverride || booking.nurseName || 'Nurse Keisha (RN)';
  const patientName = booking.clientName || 'Mama Joyce';
  const startCode = getBookingStartCode(booking);
  const serviceName = booking.serviceName || 'Elderly Care';
  const scheduledTime = booking.scheduledDateTime 
    ? new Date(booking.scheduledDateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) 
    : '2:00 PM';
  const recipientName = familyMember?.name || booking.trustedFamilyMember?.name || booking.clientEmergencyContact?.name || 'Family Helper';
  const recipientPhone = familyMember?.phone || booking.trustedFamilyMember?.phone || booking.clientEmergencyContact?.phone || '+1 (876) 555-9988';

  const bodyText = `We Care Jamaica: Nurse ${nurseName} has arrived for ${patientName} in ${booking.zone || 'Kingston 8'}. Start Code is ${startCode}. Tell nurse the code on phone or reply START ${startCode} to start remotely now. Visit: ${serviceName} at ${scheduledTime}.`;

  const logItem: WhatsAppMessageLogItem = {
    id: `WA-MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: booking.id,
    direction: 'outbound',
    templateName: 'wecare_start_code',
    recipientPhone,
    recipientName,
    recipientRole: 'family_helper',
    body: bodyText,
    buttons: [`START ${startCode}`, 'Call Nurse', 'Open Live Map'],
    status: 'delivered',
    timestamp: new Date().toISOString(),
    actionTriggered: 'START_CODE_DISPATCHED',
    source: 'whatsapp_family_remote'
  };

  saveWhatsAppLog(logItem);

  // Setup automatic 60s SMS failover check
  setupSmsFallbackTimer(logItem);

  return logItem;
}

/**
 * Send WhatsApp End Code to Family Helper (Template: wecare_end_code)
 */
export function sendFamilyEndCodeWhatsApp(
  booking: Booking,
  familyMember?: TrustedFamilyMember,
  nurseNameOverride?: string
): WhatsAppMessageLogItem {
  const nurseName = nurseNameOverride || booking.nurseName || 'Nurse Keisha';
  const patientName = booking.clientName || 'Mama Joyce';
  const endCode = getBookingEndCode(booking);
  const amountFormatted = `JMD $${(booking.priceJMD || 6000).toLocaleString()}`;
  const recipientName = familyMember?.name || booking.trustedFamilyMember?.name || booking.clientEmergencyContact?.name || 'Family Helper';
  const recipientPhone = familyMember?.phone || booking.trustedFamilyMember?.phone || booking.clientEmergencyContact?.phone || '+1 (876) 555-9988';

  const bodyText = `We Care Jamaica: Nurse ${nurseName} is ready to finish for ${patientName}. End Code is ${endCode}. Reply END ${endCode} to complete and pay ${amountFormatted}. Thank you.`;

  const logItem: WhatsAppMessageLogItem = {
    id: `WA-MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: booking.id,
    direction: 'outbound',
    templateName: 'wecare_end_code',
    recipientPhone,
    recipientName,
    recipientRole: 'family_helper',
    body: bodyText,
    buttons: [`END ${endCode}`, 'View Notes', 'Report Issue'],
    status: 'delivered',
    timestamp: new Date().toISOString(),
    actionTriggered: 'END_CODE_DISPATCHED',
    source: 'whatsapp_family_remote'
  };

  saveWhatsAppLog(logItem);
  setupSmsFallbackTimer(logItem);

  return logItem;
}

/**
 * Unified dispatch for Start Code: sends wecare_start_code to family and big text to elderly
 */
export function sendStartCodeWhatsApp(
  booking: Booking,
  familyMember?: TrustedFamilyMember,
  nurseNameOverride?: string
): { familyMsg: WhatsAppMessageLogItem; elderlyMsg?: WhatsAppMessageLogItem } {
  const familyMsg = sendFamilyStartCodeWhatsApp(booking, familyMember, nurseNameOverride);
  let elderlyMsg: WhatsAppMessageLogItem | undefined;
  if (booking.clientPhone) {
    elderlyMsg = sendElderlyBigTextWhatsApp(booking);
  }
  return { familyMsg, elderlyMsg };
}

/**
 * Unified dispatch for End Code: sends wecare_end_code to family
 */
export function sendEndCodeWhatsApp(
  booking: Booking,
  familyMember?: TrustedFamilyMember,
  nurseNameOverride?: string
): WhatsAppMessageLogItem {
  return sendFamilyEndCodeWhatsApp(booking, familyMember, nurseNameOverride);
}

/**
 * Send Big Text WhatsApp for Elderly Client (No App Needed)
 */
export function sendElderlyBigTextWhatsApp(booking: Booking): WhatsAppMessageLogItem {
  const startCode = getBookingStartCode(booking);
  const endCode = getBookingEndCode(booking);
  const recipientPhone = booking.clientPhone || '+1 (876) 555-8833';

  const bodyText = `*WE CARE JAMAICA CODES FOR TODAY*\n\n` +
    `Dear ${booking.clientName},\n` +
    `Here are your visit codes for today's nurse:\n\n` +
    `▶ *START CODE: ${startCode}*\n` +
    `Give this code to your nurse when she arrives at your door.\n\n` +
    `▶ *END CODE: ${endCode}*\n` +
    `Give this code when your care is finished.\n\n` +
    `_No mobile app needed, just keep this WhatsApp message handy._\n` +
    `We Care Helpline: +1 (876) 555-CARE`;

  const logItem: WhatsAppMessageLogItem = {
    id: `WA-MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: booking.id,
    direction: 'outbound',
    recipientPhone,
    recipientName: booking.clientName,
    recipientRole: 'client_elderly',
    body: bodyText,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    actionTriggered: 'ELDERLY_BIG_TEXT_CODES_SENT'
  };

  saveWhatsAppLog(logItem);
  return logItem;
}

/**
 * Send Nurse Job Dispatch Fallback via WhatsApp
 */
export function sendNurseJobWhatsApp(
  job: {
    id: string;
    rateFormatted: string;
    distanceKm: number;
    zone: string;
    serviceName: string;
    duration: string;
    appUrl: string;
  },
  nursePhone: string,
  nurseName: string = 'Attending Nurse'
): WhatsAppMessageLogItem {
  const bodyText = `New Job - JMD ${job.rateFormatted} - ${job.distanceKm}km away in ${job.zone}. Service: ${job.serviceName} ${job.duration}. Accept? Reply YES to accept. View in app: ${job.appUrl}`;

  const logItem: WhatsAppMessageLogItem = {
    id: `WA-MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: job.id,
    direction: 'outbound',
    templateName: 'wecare_nurse_job_whatsapp',
    recipientPhone: nursePhone,
    recipientName: nurseName,
    recipientRole: 'nurse',
    body: bodyText,
    buttons: ['YES', 'View in App'],
    status: 'delivered',
    timestamp: new Date().toISOString(),
    actionTriggered: 'NURSE_JOB_DISPATCHED'
  };

  saveWhatsAppLog(logItem);
  return logItem;
}

/**
 * Send Receipt WhatsApp upon completion
 */
export function sendReceiptWhatsApp(booking: Booking): WhatsAppMessageLogItem {
  const patientName = booking.clientName || 'Mama Joyce';
  const amountFormatted = `JMD $${(booking.priceJMD || 6000).toLocaleString()}`;
  const receiptUrl = `https://wecareja.com/receipt/${booking.id}`;
  const rateUrl = `https://wecareja.com/rate/${booking.id}`;
  const recipientPhone = booking.trustedFamilyMember?.phone || booking.clientPhone || '+1 (876) 555-9988';
  const recipientName = booking.trustedFamilyMember?.name || booking.clientName;

  const bodyText = `Visit completed for ${patientName}. Amount ${amountFormatted} paid. Receipt: ${receiptUrl}. Rate your nurse: ${rateUrl}`;

  const logItem: WhatsAppMessageLogItem = {
    id: `WA-MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    bookingId: booking.id,
    direction: 'outbound',
    templateName: 'wecare_receipt',
    recipientPhone,
    recipientName,
    recipientRole: 'family_helper',
    body: bodyText,
    buttons: ['View Receipt', 'Rate Nurse'],
    status: 'delivered',
    timestamp: new Date().toISOString(),
    actionTriggered: 'RECEIPT_DISPATCHED'
  };

  saveWhatsAppLog(logItem);
  return logItem;
}

/**
 * Automatic 60-Second SMS Fallback Handler
 */
function setupSmsFallbackTimer(originalMsg: WhatsAppMessageLogItem) {
  // Check if simulated network failure or timeout triggers SMS failover in 60s
  // In development, also provide instant trigger
  setTimeout(() => {
    try {
      const logs = getStoredWhatsAppLogs();
      const current = logs.find(l => l.id === originalMsg.id);
      if (current && current.status !== 'read' && !current.smsFallbackSent) {
        // Send SMS Fallback
        current.smsFallbackSent = true;
        current.smsFallbackTimestamp = new Date().toISOString();
        localStorage.setItem(WHATSAPP_LOGS_KEY, JSON.stringify(logs));

        const smsLog: WhatsAppMessageLogItem = {
          id: `SMS-FB-${Date.now()}`,
          bookingId: originalMsg.bookingId,
          direction: 'outbound',
          recipientPhone: originalMsg.recipientPhone,
          recipientName: originalMsg.recipientName,
          recipientRole: originalMsg.recipientRole,
          body: `[SMS Fallback] ${originalMsg.body}`,
          status: 'delivered',
          timestamp: new Date().toISOString(),
          actionTriggered: 'SMS_FALLBACK_DELIVERED',
          source: 'sms_fallback_carrier'
        };
        saveWhatsAppLog(smsLog);
      }
    } catch {}
  }, 60000);
}

/**
 * Inbound Webhook Message Processor
 * Handles START XXXX, END XXXX, and YES replies
 */
export interface WebhookProcessResult {
  success: boolean;
  replyMessage: string;
  actionTaken?: 'START_VISIT' | 'END_VISIT' | 'ACCEPT_NURSE_JOB' | 'ERROR';
  action?: 'start_visit' | 'end_visit' | 'accept_nurse_job' | 'error';
  matchedCode?: string;
  targetBookingId?: string;
  rateLimitExceeded?: boolean;
}

export function processInboundWhatsAppMessage(
  fromPhone: string,
  incomingText: string,
  bookings: Booking[],
  onUpdateBooking?: (bookingId: string, status: Booking['status'], notes?: any, additionalData?: Partial<Booking>) => void
): WebhookProcessResult {
  const text = incomingText.trim();
  const upper = text.toUpperCase();

  // 1. Check Rate Limit
  const rateLimit = checkRateLimit(fromPhone);
  if (!rateLimit.allowed) {
    const errorMsg = `Rate limit exceeded. Too many code verification attempts. Please try again in ${rateLimit.retryAfterMinutes} minutes.`;
    saveWhatsAppLog({
      id: `WA-IN-${Date.now()}`,
      direction: 'inbound',
      recipientPhone: fromPhone,
      recipientName: 'Sender',
      recipientRole: 'family_helper',
      body: incomingText,
      status: 'failed',
      timestamp: new Date().toISOString(),
      actionTriggered: 'RATE_LIMIT_BLOCKED'
    });
    return {
      success: false,
      replyMessage: errorMsg,
      actionTaken: 'ERROR',
      rateLimitExceeded: true
    };
  }

  // 2. Parse Nurse Job Acceptance: "YES" or "ACCEPT"
  if (upper === 'YES' || upper.startsWith('YES ') || upper === 'ACCEPT' || upper.startsWith('ACCEPT')) {
    // Find active job for nurse
    const pendingJob = bookings.find(b => b.status === 'requested');
    if (pendingJob) {
      if (onUpdateBooking) {
        onUpdateBooking(pendingJob.id, 'accepted', undefined, {
          status: 'accepted',
          nurseAccepted: true,
          nurseAcceptedAt: new Date().toISOString()
        });
      }
      const reply = `✅ Job Accepted! Client Location: ${pendingJob.clientAddress}, ${pendingJob.zone}. Google Maps: https://maps.google.com/?q=18.0179,-76.8099. Proceed safely.`;
      
      saveWhatsAppLog({
        id: `WA-IN-${Date.now()}`,
        bookingId: pendingJob.id,
        direction: 'inbound',
        recipientPhone: fromPhone,
        recipientName: pendingJob.nurseName || 'Nurse',
        recipientRole: 'nurse',
        body: incomingText,
        status: 'read',
        timestamp: new Date().toISOString(),
        actionTriggered: 'NURSE_ACCEPTED_JOB_VIA_WHATSAPP'
      });

      return {
        success: true,
        replyMessage: reply,
        actionTaken: 'ACCEPT_NURSE_JOB',
        targetBookingId: pendingJob.id
      };
    }
  }

  // 3. Parse START code: "START XXXX"
  const startMatch = upper.match(/START\s*([A-Z0-9]{4,6})/);
  if (startMatch) {
    const code = startMatch[1];
    // Find active booking matching this code or active
    const target = bookings.find(b => {
      const bStartCode = getBookingStartCode(b);
      return bStartCode.toUpperCase() === code.toUpperCase() && b.status !== 'completed' && b.status !== 'cancelled';
    }) || bookings.find(b => b.status === 'en_route' || b.status === 'accepted' || b.status === 'in_progress');

    if (!target) {
      const failMsg = `Invalid code. No active booking found for START ${code}. Please check the code and try again.`;
      return { success: false, replyMessage: failMsg, actionTaken: 'ERROR' };
    }

    const expectedCode = getBookingStartCode(target);
    if (code.toUpperCase() !== expectedCode.toUpperCase()) {
      const failMsg = `Invalid code. Active codes for ${target.clientName}: Start ${expectedCode}. Please try again.`;
      return { success: false, replyMessage: failMsg, actionTaken: 'ERROR', targetBookingId: target.id };
    }

    if (isCodeExpired(target)) {
      const failMsg = `Code expired. The start code for ${target.clientName} expired 2 hours after scheduled visit time. Please call We Care support.`;
      return { success: false, replyMessage: failMsg, actionTaken: 'ERROR', targetBookingId: target.id };
    }

    // Valid START! Start visit remotely
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (onUpdateBooking) {
      onUpdateBooking(target.id, 'in_progress', undefined, {
        status: 'in_progress',
        visitStartedAt: nowIso,
        arrivalVerified: true,
        arrivalVerifiedAt: nowIso,
        arrivalVerificationMethod: 'passcode_entry',
        source: 'whatsapp_family_remote',
        startSource: 'whatsapp_family_remote',
        remoteStartedBy: {
          name: target.trustedFamilyMember?.name || 'Family Helper',
          relation: target.trustedFamilyMember?.relation || 'Family Guardian',
          phone: fromPhone,
          startedAt: nowIso,
          method: 'whatsapp',
          source: 'whatsapp_family_remote'
        }
      });
    }

    soundFX.playSuccessPing();

    const successReply = `We Care Jamaica: Visit started at ${timeFormatted}. Attending nurse ${target.nurseName || 'Keisha'} has been notified that family started the visit remotely.`;

    saveWhatsAppLog({
      id: `WA-IN-${Date.now()}`,
      bookingId: target.id,
      direction: 'inbound',
      recipientPhone: fromPhone,
      recipientName: target.trustedFamilyMember?.name || 'Family Helper',
      recipientRole: 'family_helper',
      body: incomingText,
      status: 'read',
      timestamp: nowIso,
      actionTriggered: 'VISIT_STARTED_REMOTELY',
      source: 'whatsapp_family_remote'
    });

    return {
      success: true,
      replyMessage: successReply,
      actionTaken: 'START_VISIT',
      targetBookingId: target.id
    };
  }

  // 4. Parse END code: "END XXXX"
  const endMatch = upper.match(/END\s*([A-Z0-9]{4,6})/);
  if (endMatch) {
    const code = endMatch[1];
    const target = bookings.find(b => {
      const bEndCode = getBookingEndCode(b);
      return bEndCode.toUpperCase() === code.toUpperCase();
    }) || bookings.find(b => b.status === 'in_progress');

    if (!target) {
      const failMsg = `Invalid code. No visit currently in progress for END ${code}. Please try again.`;
      return { success: false, replyMessage: failMsg, actionTaken: 'ERROR' };
    }

    const expectedCode = getBookingEndCode(target);
    if (code.toUpperCase() !== expectedCode.toUpperCase()) {
      const failMsg = `Invalid code. Active end code for ${target.clientName}: End ${expectedCode}. Please try again.`;
      return { success: false, replyMessage: failMsg, actionTaken: 'ERROR', targetBookingId: target.id };
    }

    // Valid END! Complete visit and release payment
    const nowIso = new Date().toISOString();
    const durationMins = target.visitStartedAt 
      ? Math.max(1, Math.round((new Date(nowIso).getTime() - new Date(target.visitStartedAt).getTime()) / 60000))
      : (target.baseDurationMinutes || 60);

    if (onUpdateBooking) {
      onUpdateBooking(target.id, 'completed', undefined, {
        status: 'completed',
        visitEndedAt: nowIso,
        actualDurationMinutes: durationMins,
        checkoutVerified: true,
        checkoutVerifiedAt: nowIso,
        checkoutVerificationMethod: 'passcode_entry',
        paymentStatus: 'paid_to_nurse',
        source: 'whatsapp_family_remote',
        endSource: 'whatsapp_family_remote',
        remoteCompletedBy: {
          name: target.trustedFamilyMember?.name || 'Family Helper',
          relation: target.trustedFamilyMember?.relation || 'Family Guardian',
          phone: fromPhone,
          completedAt: nowIso,
          method: 'whatsapp',
          source: 'whatsapp_family_remote'
        }
      });
    }

    soundFX.playPaymentConfirmed();

    // Send receipt WhatsApp automatically
    sendReceiptWhatsApp(target);

    const successReply = `We Care Jamaica: Visit completed for ${target.clientName}. Payment of JMD $${(target.priceJMD || 6000).toLocaleString()} has been released to ${target.nurseName || 'the nurse'}. Thank you!`;

    saveWhatsAppLog({
      id: `WA-IN-${Date.now()}`,
      bookingId: target.id,
      direction: 'inbound',
      recipientPhone: fromPhone,
      recipientName: target.trustedFamilyMember?.name || 'Family Helper',
      recipientRole: 'family_helper',
      body: incomingText,
      status: 'read',
      timestamp: nowIso,
      actionTriggered: 'VISIT_COMPLETED_REMOTELY',
      source: 'whatsapp_family_remote'
    });

    return {
      success: true,
      replyMessage: successReply,
      actionTaken: 'END_VISIT',
      targetBookingId: target.id
    };
  }

  // Fallback unrecognized message
  const fallback = `We Care Jamaica: Unrecognized command. Reply START <4-digit code> to start a visit or END <4-digit code> to complete a visit. Helpline: +1 (876) 555-CARE`;
  return {
    success: false,
    replyMessage: fallback,
    actionTaken: 'ERROR'
  };
}
