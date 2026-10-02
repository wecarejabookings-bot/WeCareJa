import { NurseProfile, UserRole } from '../types';

/**
 * Strips private and confidential information from a NurseProfile based on viewer role.
 * - 'admin': Can see all confidential fields (license numbers, TRN, IDs, bank details, contracts, full audit).
 * - 'client': Can only see public practitioner details, active status, map location, and NCJ verification status (WITHOUT license number or private personal data).
 * - 'nurse': Can only see their OWN full details. For other nurses, can only see name, photo, active status, rating, specialties, zones, and map location for peer networking & shift collaboration.
 */
export function sanitizeNurseProfileForViewer(
  nurse: NurseProfile,
  viewerRole: UserRole,
  viewerNurseId?: string
): NurseProfile {
  if (!nurse) return nurse;

  // Admin has complete unrestricted visibility
  if (viewerRole === 'admin') {
    return nurse;
  }

  // Nurse viewing their own profile has full access to their own data
  if (viewerRole === 'nurse' && viewerNurseId && (viewerNurseId === nurse.id || viewerNurseId === nurse.name)) {
    return nurse;
  }

  // Sanitized profile for Clients or Peer Nurses
  return {
    ...nurse,
    // Mask license number to prevent exposing private identification codes
    nursingCouncilLicense: nurse.licenseVerified || nurse.status === 'approved' 
      ? 'NCJ Registered & Verified' 
      : 'Pending Verification',
    // Strip strictly private Bio Data (DOB, home address, emergency contacts, blood group, etc.)
    bioData: undefined,
    dateOfBirth: undefined,
    gender: undefined,
    residentialAddress: undefined,
    emergencyContact: undefined,
    // Strip sensitive legal and compliance documents
    licenseDocumentUrl: undefined,
    trnNumber: undefined,
    trnCertificateUrl: undefined,
    governmentIdType: undefined,
    governmentIdUrl: undefined,
    proofOfAddressUrl: undefined,
    bankLetterUrl: undefined,
    signedContract: undefined,
    // Strip financial details
    bankDetails: undefined,
    totalEarningsJMD: 0,
    pendingPayoutJMD: 0,
    // Hide direct contact numbers before booking is approved (protects nurse privacy)
    phone: viewerRole === 'client' ? '+1 (876) Contact via Secure In-App Booking' : '+1 (876) Verified Colleague',
    email: viewerRole === 'client' ? 'verified.practitioner@wecare.jm' : 'colleague@wecare.jm'
  };
}

/**
 * Sanitizes an array of nurse profiles for a specific viewer role.
 */
export function sanitizeNurseListForViewer(
  nurses: NurseProfile[],
  viewerRole: UserRole,
  viewerNurseId?: string
): NurseProfile[] {
  return nurses.map(nurse => sanitizeNurseProfileForViewer(nurse, viewerRole, viewerNurseId));
}
