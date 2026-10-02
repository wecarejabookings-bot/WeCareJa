import { Booking, ArrivalQRPayload, VisitQRAction, VisitQRPayload } from '../types';
import { KINGSTON_ZONE_GEO } from '../data/geoData';

/**
 * Clean deterministic 4-character ID suffix
 */
function getBookingSuffix(booking: Booking): string {
  const cleanId = String(booking?.id || '7294').replace(/[^a-zA-Z0-9]/g, '');
  return cleanId.slice(-4).toUpperCase() || '7294';
}

/**
 * Generate deterministic or booking-specific Check-In verification passcode
 */
export function getArrivalPassCode(booking: Booking): string {
  if (booking.arrivalPassCode) {
    return booking.arrivalPassCode;
  }
  const suffix = getBookingSuffix(booking);
  return `IN-${suffix}`;
}

/**
 * Generate deterministic or booking-specific Check-Out verification passcode
 */
export function getCheckoutPassCode(booking: Booking): string {
  if (booking.checkoutPassCode) {
    return booking.checkoutPassCode;
  }
  const suffix = getBookingSuffix(booking);
  return `OUT-${suffix}`;
}

/**
 * Generates unified structured JSON payload for either Check-In or Check-Out
 */
export function generateVisitQRPayload(booking: Booking, action: VisitQRAction = 'check_in'): string {
  const passCode = action === 'check_in' ? getArrivalPassCode(booking) : getCheckoutPassCode(booking);
  const token = btoa(`${booking.id}:${action}:${passCode}:${booking.clientName}`).slice(0, 16);

  const payload: VisitQRPayload = {
    type: 'WECARE_VISIT_VERIFICATION',
    action,
    bookingId: booking.id,
    patientName: booking.clientName,
    nurseName: booking.nurseName,
    serviceName: booking.serviceName,
    clientAddress: booking.clientAddress,
    zone: booking.zone,
    passCode,
    scheduledDateTime: booking.scheduledDateTime,
    generatedAt: new Date().toISOString(),
    geofenceRadiusMeters: 75,
    visitStartedAt: booking.visitStartedAt,
    securityToken: `SEC-JM-${token}`
  };

  return JSON.stringify(payload);
}

/**
 * Legacy wrapper: Creates the structured JSON payload for arrival / check-in
 */
export function generateArrivalQRPayload(booking: Booking): string {
  return generateVisitQRPayload(booking, 'check_in');
}

/**
 * Creates the structured JSON payload for visit completion / check-out
 */
export function generateCheckoutQRPayload(booking: Booking): string {
  return generateVisitQRPayload(booking, 'check_out');
}

export interface ScannedVisitVerificationResult {
  success: boolean;
  action: VisitQRAction;
  reason?: string;
  verifiedPassCode?: string;
  elapsedMinutes?: number;
}

/**
 * Validates scanned QR code data or manually entered passcode against a target booking
 * Supports both Check-In (Initiate Visit) and Check-Out (Complete Visit)
 */
export function verifyScannedVisitData(
  scannedText: string,
  targetBooking: Booking,
  expectedAction?: VisitQRAction
): ScannedVisitVerificationResult {
  const cleanInput = scannedText.trim();
  const checkInCode = getArrivalPassCode(targetBooking);
  const checkOutCode = getCheckoutPassCode(targetBooking);
  const suffix = getBookingSuffix(targetBooking);

  // 1. Structured JSON payload match
  try {
    const parsed = JSON.parse(cleanInput) as Partial<VisitQRPayload>;
    if (parsed.type === 'WECARE_VISIT_VERIFICATION' || parsed.type === 'WECARE_ARRIVAL_VERIFICATION') {
      if (parsed.bookingId && parsed.bookingId !== targetBooking.id) {
        return {
          success: false,
          action: parsed.action || 'check_in',
          reason: `QR code belongs to a different visit (#${(parsed.bookingId || '').slice(0, 8)}). Please scan the QR code for visit #${targetBooking.id}.`
        };
      }

      const detectedAction: VisitQRAction = parsed.action || (cleanInput.includes('"action":"check_out"') ? 'check_out' : 'check_in');

      if (expectedAction && detectedAction !== expectedAction) {
        return {
          success: false,
          action: detectedAction,
          reason: `You scanned a ${detectedAction === 'check_in' ? 'Check-In' : 'Check-Out'} QR code, but this scanner is currently in ${expectedAction === 'check_in' ? 'Check-In' : 'Check-Out'} mode. Switch modes to proceed.`
        };
      }

      return {
        success: true,
        action: detectedAction,
        verifiedPassCode: parsed.passCode || (detectedAction === 'check_in' ? checkInCode : checkOutCode)
      };
    }
  } catch {
    // Not JSON, continue to string/code matching
  }

  // 2. Direct string / passcode matching
  const upper = cleanInput.toUpperCase();
  const rawStartCode = targetBooking.startCode || (targetBooking.id === 'BK-8950' ? '4829' : '');
  const rawEndCode = targetBooking.endCode || (targetBooking.id === 'BK-8950' ? '9174' : '');

  // 1b. WhatsApp Remote Care 4-Digit Code match (Way A: Elderly client reads 4 numbers to nurse)
  if (rawEndCode && (upper === rawEndCode.toUpperCase() || upper === `END ${rawEndCode.toUpperCase()}`)) {
    if (expectedAction && expectedAction === 'check_in') {
      return {
        success: false,
        action: 'check_out',
        reason: 'This is the WhatsApp End Code. Please enter the Start Code (e.g. 4829) to initiate the visit.'
      };
    }
    return {
      success: true,
      action: 'check_out',
      verifiedPassCode: rawEndCode
    };
  }

  if (rawStartCode && (upper === rawStartCode.toUpperCase() || upper === `START ${rawStartCode.toUpperCase()}`)) {
    if (expectedAction && expectedAction === 'check_out') {
      return {
        success: false,
        action: 'check_in',
        reason: 'This is the WhatsApp Start Code. Please enter the End Code (e.g. 9174) to complete the visit.'
      };
    }
    return {
      success: true,
      action: 'check_in',
      verifiedPassCode: rawStartCode
    };
  }

  // Explicit Check-Out passcode match
  if (
    upper === checkOutCode.toUpperCase() ||
    upper === `WC-${checkOutCode.toUpperCase()}` ||
    upper === `OUT-${suffix}`
  ) {
    if (expectedAction && expectedAction === 'check_in') {
      return {
        success: false,
        action: 'check_out',
        reason: 'This is the Check-Out passcode. Please scan or enter the Check-In pass to initiate the visit.'
      };
    }
    return {
      success: true,
      action: 'check_out',
      verifiedPassCode: checkOutCode
    };
  }

  // Explicit Check-In passcode match
  if (
    upper === checkInCode.toUpperCase() ||
    upper === `WC-${checkInCode.toUpperCase()}` ||
    upper === `IN-${suffix}` ||
    upper === `WC-${suffix}` // legacy code
  ) {
    if (expectedAction && expectedAction === 'check_out') {
      return {
        success: false,
        action: 'check_in',
        reason: 'This is the Check-In passcode. Please scan or enter the Check-Out pass to complete the visit.'
      };
    }
    return {
      success: true,
      action: 'check_in',
      verifiedPassCode: checkInCode
    };
  }

  // Booking ID match fallback (defaults to expectedAction or check_in)
  if (upper === targetBooking.id.toUpperCase() || cleanInput.includes(targetBooking.id)) {
    const action = expectedAction || (targetBooking.status === 'in_progress' ? 'check_out' : 'check_in');
    return {
      success: true,
      action,
      verifiedPassCode: action === 'check_in' ? checkInCode : checkOutCode
    };
  }

  return {
    success: false,
    action: expectedAction || 'check_in',
    reason: `Invalid visit QR code. Expected pass code ${expectedAction === 'check_out' ? checkOutCode : checkInCode} for patient ${targetBooking.clientName}.`
  };
}

/**
 * Validates scanned arrival data (legacy backward-compatible helper)
 */
export function verifyScannedArrivalData(
  scannedText: string, 
  targetBooking: Booking
): { success: boolean; reason?: string; verifiedPassCode?: string } {
  const result = verifyScannedVisitData(scannedText, targetBooking, 'check_in');
  return {
    success: result.success,
    reason: result.reason,
    verifiedPassCode: result.verifiedPassCode
  };
}

/**
 * Returns estimated or actual GPS coordinate description for Jamaican attendance verification
 */
export function getZoneGpsDescription(zoneName: string): { lat: number; lng: number; label: string } {
  const geo = KINGSTON_ZONE_GEO[zoneName] || { lat: 18.0179, lng: -76.8099 }; // Default Kingston Barbican
  return {
    lat: geo.lat,
    lng: geo.lng,
    label: `${geo.lat.toFixed(4)}° N, ${Math.abs(geo.lng).toFixed(4)}° W (${zoneName}, Jamaica)`
  };
}
