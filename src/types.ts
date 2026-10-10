export type UserRole = 'client' | 'nurse' | 'admin';

export type LogoVariation = 'heart-cross' | 'hands-heart' | 'icon-appstore';

export type BookingStatus = 
  | 'requested'
  | 'accepted'
  | 'en_route'
  | 'ARRIVED_VERIFIED'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type NurseCareLevel = 'registered_nurse' | 'geriatric_caregiver' | 'practical_nurse_aide' | 'nurse_practitioner';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'clinical' | 'elderly' | 'specialized' | 'wellness';
  description: string;
  durationMinutes: number;
  priceJMD: number;
  icon: string;
  imageUrl?: string;
  popular?: boolean;
  careLevelRequired?: 'any' | 'registered_nurse' | 'geriatric_caregiver' | 'nurse_practitioner' | 'practical_nurse_aide';
  suitableForGeriatricCaregiver?: boolean;
  careScopeSummary?: string;
  badgeLabel?: string;
  logoTheme?: 'emerald' | 'cyan' | 'purple' | 'rose' | 'amber' | 'blue' | 'indigo';
  iconType?: string;
  tagline?: string;
}

export interface AttachedDocumentRecord {
  id: string;
  name: string;
  type: 'government_id' | 'nursing_council_license' | 'diploma_certificate' | 'proof_of_address' | 'trn_certificate' | 'bank_account_letter' | 'other';
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  verificationStatus: 'verified' | 'pending' | 'flagged';
  notes?: string;
}

export interface SignedContractAgreement {
  id: string;
  contractNumber: string;
  agreementDate: string;
  effectiveDate: string;
  companyName: string;
  companyNumber: string;
  companyAddress: string;
  companyRepName: string;
  companyRepTitle: string;
  companySignature?: string;
  companySignedAt?: string;
  nurseLegalName: string;
  nurseAddress: string;
  nursingCouncilLicense: string;
  trnNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountType?: string;
  nurseSignature: string;
  nurseSignatureImage?: string; // Drawn canvas signature data URL
  nurseSignedAt: string;
  ipAddressAudit?: string;
  status: 'executed' | 'pending_admin_countersign' | 'countersigned_active';
  version: string;
  attachedDocuments: {
    governmentId?: AttachedDocumentRecord;
    nursingCouncilLicense?: AttachedDocumentRecord;
    diplomaCertificate?: AttachedDocumentRecord;
    proofOfAddress?: AttachedDocumentRecord;
    trnCertificate?: AttachedDocumentRecord;
    bankAccountLetter?: AttachedDocumentRecord;
  };
  specialConditions?: string;
}

export interface NurseVehicleInfo {
  makeModel: string;
  color: string;
  licensePlate: string;
  type: 'car' | 'suv' | 'motorcycle' | 'courier';
}

export interface NurseBioData {
  dateOfBirth: string; // ISO date format YYYY-MM-DD (e.g., "1993-06-14")
  gender?: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  nationality?: string; // e.g., "Jamaican"
  placeOfBirth?: string; // e.g., "Kingston, Jamaica"
  residentialAddress?: string; // e.g., "14 Hope Road, Liguanea, Kingston 6"
  residentialParish?: string; // e.g., "St. Andrew", "Kingston", "St. Catherine"
  bloodGroup?: string; // Optional
  institutionAttended?: string; // e.g., "University of the West Indies School of Nursing (UWI MONA)"
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string; // e.g., "Spouse", "Mother", "Sibling", "Next of Kin"
  };
  nationalIdNumber?: string; // Jamaican Passport, National Elector ID, Driver's License
  allergiesOrMedicalAlerts?: string;
  confidentialPrivacyNotice?: string;
}

export type SkillBadgeStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export interface NurseSkillBadge {
  id: string;
  skillName: string;
  description?: string;
  category?: 'clinical' | 'pediatric' | 'surgical' | 'geriatric' | 'critical' | 'specialized';
  status: SkillBadgeStatus;
  requestedAt?: string;
  verifiedAt?: string;
  verifiedByAdminName?: string;
  supportingNote?: string;
  rejectionReason?: string;
  documentProofName?: string;
  iconName?: string;
}

export interface NurseProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  institutionAttended?: string; // Nursing school, college or vocational institution attended
  diplomaDocumentUrl?: string; // Copy of diploma or degree certificate
  diplomaFileName?: string;
  // Private Bio Data (Strictly confidential: visible ONLY to login nurse under their profile and Admins, HIDDEN from clients & peer nurses)
  bioData?: NurseBioData;
  dateOfBirth?: string; // Shortcut for direct lookup (confidential)
  gender?: string;
  residentialAddress?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  careLevel?: NurseCareLevel; // 'registered_nurse' | 'geriatric_caregiver' | 'practical_nurse_aide'
  qualificationTitle?: string; // e.g. "Registered General Nurse (NCJ)" or "HEART/NTA Certified Geriatric Aide"
  requiresNcjRegistration?: boolean; // false for Geriatric Caregiver / Practical Caregiver, true for RN/BSN/RM
  scopeOfCare?: {
    canProvide: string[];
    cannotProvide: string[];
  };
  certifications?: string[];
  skillBadges?: NurseSkillBadge[]; // Specialized skill badges with verified / pending / requested status
  payTierDescription?: string;
  nursingCouncilLicense: string;
  licenseVerified: boolean;
  licenseDocumentUrl?: string; // Strictly confidential: Admin only
  licenseExpiryDate?: string;
  trnNumber?: string; // Strictly confidential: Admin only
  trn?: string; // Alias
  phoneNumber?: string; // Alias
  qualification?: string; // Alias
  governmentIdType?: string;
  governmentIdUrl?: string; // Strictly confidential: Admin only
  proofOfAddressUrl?: string; // Strictly confidential: Admin only
  trnCertificateUrl?: string; // Strictly confidential: Admin only
  bankLetterUrl?: string; // Strictly confidential: Admin only
  signedContract?: SignedContractAgreement; // Strictly confidential: Admin file record
  status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  specialties: string[];
  zones: string[]; // e.g., 'New Kingston', 'Liguanea', 'Half-Way-Tree', 'Barbican'
  hourlyRateJMD: number;
  bio: string;
  currentLat?: number;
  currentLng?: number;
  // Quick Toggle Availability & Geofencing
  availabilityStatus?: 'on_call' | 'offline'; // 'on_call' = active in client dispatch pool, 'offline' = off-duty
  lastAvailabilityToggleAt?: string;
  geofenceRadiusKm?: number; // Configurable coverage boundary in kilometers (e.g. 5, 10, 15, 25, 35 km)
  geofenceStrictEnforcement?: boolean; // Whether to strictly restrict bookings to within radius
  geofenceAnchorName?: string; // e.g. "Liguanea & Mona, Kingston 6"
  geofenceActiveParish?: string; // e.g. "Kingston & St Andrew"
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    lynkWallet?: string;
  };
  // Section 4 & 10 Police Record 60-Day Compliance & Verification
  signupTrack?: 'track_1_rn_lpn' | 'track_2_caregiver_companion';
  policeRecordStatus?: 'not_uploaded' | 'due_soon' | 'verified' | 'overdue_suspended';
  policeRecordDueDays?: number; // Days remaining out of 60
  policeRecordApprovedDate?: string;
  policeRecordUploadedAt?: string;
  policeRecordVerifiedAt?: string;
  policeRecordUrl?: string;
  policeRecordFileName?: string;
  references?: { name: string; phone: string; relationship?: string; verified?: boolean }[];
  nonClinicalCareOnly?: boolean;
  vehicleInfo?: NurseVehicleInfo;
  totalEarningsJMD: number;
  pendingPayoutJMD: number;
  completedVisitsCount: number;
}

export interface VisitUpdateLog {
  id: string;
  timestamp: string;
  nurseName: string;
  authorName?: string;
  text: string;
  category?: 'vitals' | 'wound_care' | 'medication' | 'general' | 'patient_condition' | 'discharge';
  recordedViaVoice?: boolean;
  audioDurationSeconds?: number;
}

export interface BiometricScanResult {
  id: string;
  scannedAt: string;
  patientName?: string;
  heartRateBpm: number;
  bloodOxygenSpO2: number;
  bloodOxygenPercent?: number; // Alias for bloodOxygenSpO2
  respiratoryRate: number;
  heartRateVariabilityMs: number;
  perfusionIndex: number;
  stressLevel: 'low' | 'normal' | 'elevated';
  estimatedBloodPressure: string; // e.g. "118/76 mmHg"
  bloodPressureEstimated?: string; // Alias for estimatedBloodPressure
  confidenceScore: number; // e.g. 96%
  method: 'optical_rppg' | 'camera_photoplethysmography' | 'clinical_sensor';
  waveformPoints?: number[];
  statusAssessment?: string;
  notes?: string;
}

export interface ClinicalNotes {
  bloodPressure?: string;
  pulseRate?: string;
  bloodGlucose?: string;
  oxygenSaturation?: string;
  temperature?: string;
  medicationsAdministered?: string;
  careSummary: string;
  nurseRecommendations: string;
  completedAt: string;
  visitUpdates?: VisitUpdateLog[];
  biometricScan?: BiometricScanResult;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitRateJMD: number;
  totalJMD: number;
}

export interface InvoiceSummary {
  invoiceNumber: string;
  issuedAt: string;
  startedAt: string;
  endedAt: string;
  baseDurationMinutes: number;
  actualDurationMinutes: number;
  overtimeMinutes: number;
  basePriceJMD: number;
  overtimeRatePerHourJMD: number;
  overtimeFeeJMD: number;
  totalChargedJMD: number;
  platformFeeJMD: number; // 15%
  nurseEarningsJMD: number; // 85%
  paymentMethod: 'card' | 'stripe' | 'lynk_mobile_money' | 'ncb_quik' | 'cash_on_delivery';
  paymentStatus: 'held_in_escrow' | 'paid_to_nurse' | 'refunded';
  timeBreakdownText: string;
  items: InvoiceItem[];
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  zone: string; // Kingston / St Andrew neighborhood
  clientEmergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  clientPhotoUrl?: string;
  patientBioData?: ClientPatientBioData;
  patientMedications?: PatientMedication[];
  knownIllnesses?: string[];
  allergies?: string[];
  trustedFamilyMember?: TrustedFamilyMember;
  nurseId?: string;
  nurseName?: string;
  nursePhoto?: string;
  nursePhone?: string;
  scheduledDateTime: string;
  date?: string;
  createdAt: string;
  status: BookingStatus;
  priceJMD: number;
  basePriceJMD?: number;
  baseDurationMinutes?: number;
  hourlyRateJMD?: number;
  platformFeeJMD: number; // 15%
  nurseEarningsJMD: number; // 85%
  paymentMethod: 'card' | 'stripe' | 'lynk_mobile_money' | 'ncb_quik' | 'cash_on_delivery';
  paymentStatus: 'held_in_escrow' | 'paid_to_nurse' | 'refunded';
  notes?: string;
  clinicalNotes?: ClinicalNotes;
  biometricScan?: BiometricScanResult;
  visitUpdates?: VisitUpdateLog[];
  medicationsAdministeredLog?: {
    medicationId: string;
    medicationName: string;
    administeredAt: string;
    administeredBy: string;
  }[];
  visitStartedAt?: string;
  visitEndedAt?: string;
  actualDurationMinutes?: number;
  invoiceSummary?: InvoiceSummary;
  rating?: number;
  reviewComment?: string;
  cancelReason?: string;
  cancelledAt?: string;
  freeCancelDeadline: string; // ISO string 2 hours before scheduled
  unreadMessagesCount?: number;
  // QR-Based In-Person Doorstep Arrival & Attendance Verification
  arrivalVerified?: boolean;
  pinVerified?: boolean;
  arrivalVerifiedAt?: string;
  arrivalVerificationMethod?: 'qr_scan' | 'gps_pinpoint' | 'passcode_entry';
  arrivalGpsLocation?: string;
  arrivalPassCode?: string;
  checkinData?: {
    qrData: string;
    pin: string;
    status: 'pending' | 'ARRIVED_VERIFIED';
    createdAt: string;
    verifiedAt?: string;
    gpsLocation?: string;
  };
  // QR-Based Visit Completion / Check-Out Verification
  checkoutVerified?: boolean;
  checkoutVerifiedAt?: string;
  checkoutVerificationMethod?: 'qr_scan' | 'gps_pinpoint' | 'passcode_entry';
  checkoutGpsLocation?: string;
  checkoutPassCode?: string;
  safetyPin?: string;
  supplies_checklist_ack?: boolean;
  dispatchTier?: 'standard' | 'comfort' | 'urgent' | 'assist';
  entryCode?: string;
  specialRequests?: string;
  isBookingOnBehalf?: boolean;
  careRecipientName?: string;
  careRecipientAddress?: string;
  careRecipientPhone?: string;
  careRecipientAge?: number;
  careRecipientParish?: string;
  ppeConfirmed?: boolean;
  proceduresConfirmed?: string[];
  fiveMinuteAlertSent?: boolean;
  doorbellRang?: boolean;
  nurseLiveLocation?: { lat: number; lng: number; updatedAt: string };
  geofenceWarningActive?: boolean;
  dispatchMode?: 'fixed' | 'negotiated_offer' | 'custom_bid';
  offeredPriceJMD?: number;
  vehicleInfo?: NurseVehicleInfo;
  liveEtaMinutes?: number;
  distanceKm?: number;
  nurseLiveLat?: number;
  nurseLiveLng?: number;
  offlinePendingNotes?: boolean;
  offlinePendingArrival?: boolean;
  offlinePendingCheckout?: boolean;
  lastOfflineSyncAt?: string;
  // Personal Protection Equipment (PPE) Acknowledgement & Readiness
  clientPPEAcknowledged?: boolean;
  clientPPEAcknowledgedAt?: string;
  nursePPEAcknowledged?: boolean;
  nursePPEAcknowledgedAt?: string;
  // One-Click Doorstep Arrival Alert
  arrivalAlertSent?: boolean;
  arrivalAlertSentAt?: string;
  arrivalAlertCount?: number;
  arrivalAlertAcknowledged?: boolean;
  arrivalAlertAcknowledgedAt?: string;
  // Nurse Arrival ETA Notification
  arrivalEtaMinutes?: number;
  arrivalEtaDistanceKm?: number;
  arrivalNotificationSentAt?: string;
  arrivalNotificationMessage?: string;
  arrivalEtaThresholdAlert?: boolean;
  // Quick-SOS Emergency Trigger
  quickSosTriggered?: boolean;
  quickSosTriggeredAt?: string;
  quickSosTriggeredBy?: 'nurse' | 'client' | 'admin';
  quickSosAcknowledged?: boolean;
  quickSosAlertDetails?: {
    location: string;
    contactNotifiedName: string;
    contactNotifiedPhone: string;
    message: string;
  };
  // WhatsApp Remote Start / End for Family Helper, Nurse & Client
  startCode?: string; // 4-digit numeric code e.g. "4829"
  endCode?: string; // 4-digit numeric code e.g. "9174"
  source?: string; // e.g. "whatsapp_family_remote" | "app_doorstep_qr"
  startSource?: string;
  endSource?: string;
  remoteStartedBy?: {
    name: string;
    relation: string;
    phone: string;
    startedAt: string;
    method: 'whatsapp' | 'sms' | 'portal';
    source?: string;
  };
  remoteCompletedBy?: {
    name: string;
    relation: string;
    phone: string;
    completedAt: string;
    method: 'whatsapp' | 'sms' | 'portal';
    source?: string;
  };
  familyWhatsAppOptIn?: boolean;
  elderlyWhatsAppOptIn?: boolean;
  whatsappStartCodeSent?: boolean;
  whatsappStartCodeSentAt?: string;
  whatsappEndCodeSent?: boolean;
  whatsappEndCodeSentAt?: string;
  nurseAccepted?: boolean;
  nurseAcceptedAt?: string;
  clientActivated?: boolean;
  clientActivatedAt?: string;
  requestSentAt?: string;
  acceptanceTimeoutSeconds?: number;
  delayMinutes?: number;
  delayReason?: string;
  delayAlertSentAt?: string;
  adminPreArrivalCheckedAt?: string;
  adminPreArrivalNotes?: string;
  rerouteCount?: number;
  previousNurseIds?: string[];
  declinedNurseIds?: string[];
  lastReroutedAt?: string;
  lastRerouteReason?: string;
  verifiedBy?: string;
  startCodeVerifiedBy?: string;
  startCodeVerifiedAt?: string;
  endCodeVerifiedBy?: string;
  endCodeVerifiedAt?: string;
}

export type VisitQRAction = 'check_in' | 'check_out';

export interface VisitQRPayload {
  type: 'WECARE_VISIT_VERIFICATION' | 'WECARE_ARRIVAL_VERIFICATION';
  action: VisitQRAction;
  bookingId: string;
  patientName: string;
  nurseName?: string;
  serviceName: string;
  clientAddress: string;
  zone: string;
  passCode: string;
  scheduledDateTime: string;
  generatedAt: string;
  geofenceRadiusMeters?: number;
  visitStartedAt?: string;
  securityToken?: string;
}

export interface ArrivalQRPayload {
  type: 'WECARE_ARRIVAL_VERIFICATION' | 'WECARE_VISIT_VERIFICATION';
  action?: VisitQRAction;
  bookingId: string;
  patientName: string;
  nurseName?: string;
  serviceName: string;
  clientAddress: string;
  zone: string;
  arrivalPassCode: string;
  passCode?: string;
  scheduledDateTime: string;
  generatedAt: string;
  geofenceRadiusMeters?: number;
  visitStartedAt?: string;
  securityToken?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: 'client' | 'nurse' | 'admin' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  recipient: 'Client' | 'Nurse' | 'Admin';
  trigger: string;
  channel: 'SMS' | 'WhatsApp' | 'Push' | 'Email';
  messageBody: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Client' | 'Nurse' | 'Safety & Payments';
}

export interface AdminProfile {
  name: string;
  officeNumber: string;
  formattedPhone: string;
  email: string;
  role: string;
  title: string;
  officeAddress: string;
  status: string;
}

export interface PayoutRecord {
  id: string;
  payoutReference?: string;
  nurseId: string;
  nurseName: string;
  amountJMD: number; // 85% net payout
  grossAmountJMD?: number; // Total billed to clients
  platformFeeJMD?: number; // 15% platform deduction
  periodStart?: string;
  periodEnd: string;
  payoutDate?: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  payoutMethod: string;
  destinationAccount?: string;
  bookingIds: string[];
  visitCount?: number;
  notes?: string;
}

export interface HealthNewsItem {
  id: string;
  title: string;
  category: string;
  urgency: 'alert' | 'advisory' | 'info';
  date: string;
  source: string;
  url?: string;
  summary: string;
  takeaways: string[];
}

export interface HealthNewsResponse {
  success: boolean;
  isLiveSearch: boolean;
  topic?: string;
  parish?: string;
  rawMarkdown?: string;
  sources: { title: string; uri: string }[];
  timestamp: string;
  data?: {
    overview: string;
    lastUpdated: string;
    articles: HealthNewsItem[];
  };
  fallback?: {
    overview: string;
    lastUpdated: string;
    articles: HealthNewsItem[];
  };
  fallbackReason?: string;
}

export interface MedicationComplianceEntry {
  timestamp: string;
  status: 'taken' | 'missed' | 'skipped';
  loggedBy?: string;
  notes?: string;
}

export interface PatientMedication {
  id: string;
  name: string; // e.g. "Amlodipine 5mg", "Metformin 500mg"
  dosage: string; // e.g. "1 tablet daily"
  frequency?: string; // e.g. "Once daily", "Twice daily"
  instructions?: string; // e.g. "Take after breakfast with water"
  timesOfDay: ('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[];
  scheduledTime: string; // e.g. "08:00 AM" or "13:00"
  purpose?: string; // e.g. "Blood pressure control"
  administeredToday?: boolean;
  lastAdministeredAt?: string;
  takenToday?: boolean;
  takenAt?: string;
  complianceHistory?: MedicationComplianceEntry[];
}

export interface DailyMedicationReminder {
  id: string;
  medicationName: string;
  dosage: string; // e.g. "1 Tablet", "500mg", "2 Puffs", "5ml Liquid"
  frequency: string; // e.g. "Once daily", "Twice daily", "3 times daily", "Every 4-6 hours (As needed)", "Nightly before bed"
  time: string; // e.g. "08:00 AM", "01:00 PM", "06:00 PM", "09:00 PM"
  scheduledTimes?: string[]; // Multiple times if frequency is 2x or 3x daily
  instructions?: string; // e.g. "Take with food and warm water"
  purpose?: string; // e.g. "High Blood Pressure", "Type 2 Diabetes"
  iconType?: 'pill' | 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'drops';
  timesOfDay?: ('morning' | 'midday' | 'evening' | 'bedtime' | 'as_needed')[];
  takenToday?: boolean;
  takenAt?: string;
  complianceHistory?: MedicationComplianceEntry[];
  notifySound?: boolean;
  active?: boolean;
  createdAt: string;
}

export interface TrustedFamilyMember {
  name: string;
  relation: string; // e.g., "Son", "Daughter", "Spouse", "Sibling", "Legal Guardian"
  phone: string;
  email?: string;
  photoUrl: string; // Uploaded profile photo of the trusted family member
  canManageCare: boolean;
  notes?: string;
  whatsAppUpdatesOptIn?: boolean; // Required opt-in for Meta WhatsApp Cloud API
  whatsAppPhone?: string;
}

export interface ClientPatientBioData {
  dateOfBirth?: string; // e.g. "1948-03-12"
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string; // e.g. "O+", "A+"
  residentialAddress?: string;
  zone?: string;
  knownIllnesses: string[]; // e.g. ["Hypertension", "Type 2 Diabetes", "Mobility Limitation"]
  allergies: string[]; // e.g. ["Penicillin", "Sulfa drugs"]
  mobilityStatus?: 'independent' | 'needs_cane_walker' | 'wheelchair_bound' | 'bedbound';
  dietaryRestrictions?: string;
  specialCareInstructions?: string;
  medications: PatientMedication[];
  trustedFamilyMember: TrustedFamilyMember;
  profileSharedWith?: string[]; // email addresses or phone numbers
  vitalsLog?: SyncedHealthReading[];
}

export interface SyncedHealthReading {
  id: string;
  timestamp: string;
  deviceType: 'blood_pressure' | 'pulse_oximeter' | 'glucometer' | 'thermometer' | 'weight_scale';
  deviceName: string;
  metrics: {
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    spo2?: number;
    glucoseMmol?: number;
    temperatureC?: number;
    weightKg?: number;
  };
  formattedValue: string;
  status: 'normal' | 'attention' | 'critical';
  notes?: string;
  syncedVia: 'bluetooth_ble' | 'manual_sync';
}

export interface HealthDevice {
  id: string;
  name: string;
  type: 'blood_pressure' | 'pulse_oximeter' | 'glucometer' | 'thermometer' | 'weight_scale';
  model: string;
  connectionType: 'Bluetooth BLE' | 'NFC' | 'USB';
  batteryPercent: number;
  lastSyncedAt?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'streaming';
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  approvalStatus?: 'approved' | 'pending_approval' | 'rejected';
  name: string;
  full_name?: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  avatar?: string;
  zone?: string;
  address?: string;
  medical_info?: string;
  is_deleted?: boolean;
  gateCode?: string;
  trn?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  patientBioData?: ClientPatientBioData;
  bioData?: ClientPatientBioData;
  medicationReminders?: DailyMedicationReminder[];
  nurseProfileId?: string;
  title?: string;
  department?: string;
  createdAt: string;
  lastLoginAt?: string;
  biometricsEnabled?: boolean;
  biometricCredentialId?: string;
  biometricType?: 'fingerprint' | 'face_id' | 'passkey';
  biometricDeviceName?: string;
  biometricRegisteredAt?: string;
  whatsAppUpdatesOptIn?: boolean;
  whatsAppPhone?: string;
  whatsAppPhoneNumber?: string;
  zoneAlertSettings?: ClientZoneAvailabilityAlertSettings;
  isBookingOnBehalf?: boolean;
  accountHolder?: {
    name: string;
    email: string;
    phone: string;
    country: string;
    billingAddress: string;
    relationshipToPatient: string;
  };
  careRecipient?: {
    name: string;
    age: number;
    phone: string;
    address: string;
    parish: string;
    zone: string;
    medicalNotes?: string;
  };
}

export interface ZoneAlertHistoryItem {
  id: string;
  nurseId: string;
  nurseName: string;
  nursePhoto: string;
  careLevel: 'registered_nurse' | 'practical_nurse' | 'certified_caregiver' | string;
  zone: string;
  parish: 'Kingston' | 'St. Andrew' | 'Corporate Area';
  estWaitMinutes: number;
  savedWaitMinutes: number;
  timestamp: string;
}

export interface ClientZoneAvailabilityAlertSettings {
  enabled: boolean;
  watchedZones: string[];
  selectedParish: 'all' | 'Kingston' | 'St. Andrew' | 'Kingston & St. Andrew';
  careLevelPreference: 'all' | 'registered_nurse' | 'practical_nurse' | 'certified_caregiver';
  channels: {
    inAppAudio: boolean;
    inAppBanner: boolean;
    browserPush: boolean;
    smsWhatsapp: boolean;
  };
  maxWaitTimeMinutes: number;
  autoFastTrack: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  lastAlertedAt?: string;
  lastAlertedNurseId?: string;
  history?: ZoneAlertHistoryItem[];
}

export interface BiometricCredentialRecord {
  id: string; // Base64 credential id or raw id
  userId: string;
  username: string;
  userRole: UserRole;
  displayName: string;
  biometricType: 'fingerprint' | 'face_id' | 'passkey';
  deviceName: string;
  rawCredentialId?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  nearestZone: string;
  distanceKm: number;
  parish: string;
  formattedAddress: string;
  isSimulated?: boolean;
  timestamp: string;
}

export interface NursePeerChatMessage {
  id: string;
  senderNurseId: string;
  senderNurseName: string;
  senderNursePhoto: string;
  recipientNurseId?: string; // Optional: undefined means broadcast to all active nurses in network
  recipientNurseName?: string;
  zone?: string;
  text: string;
  timestamp: string;
  category: 'direct' | 'broadcast' | 'shift_assist' | 'clinical_tip' | 'traffic_alert';
  isEmergencyBackup?: boolean;
}

export type ActivityNotificationType = 
  | 'booking_request'
  | 'booking_confirmed'
  | 'visit_completed'
  | 'nurse_enroute'
  | 'nurse_assigned'
  | 'payment_confirmed'
  | 'rating_received'
  | 'nurse_late'
  | 'time_up'
  | 'chat_message'
  | 'incoming_call'
  | 'cancellation'
  | 'health_news'
  | 'visit_reminder_30min'
  | 'system_alert'
  | 'nurse_signup'
  | 'nurse_arrived'
  | 'arrival_checkin'
  | 'sos_emergency'
  | 'medication_push_alert'
  | 'milestone_unlocked'
  | 'zone_nurse_available';

export interface ActivityNotificationItem {
  id: string;
  type: ActivityNotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetRole: 'client' | 'nurse' | 'admin' | 'all';
  bookingId?: string;
  senderName?: string;
  meta?: Record<string, any>;
}

export interface NursingSchool {
  id: string;
  name: string;
  shortName?: string;
  category?: 'university' | 'college' | 'vocational' | 'private_institute' | 'other';
  parish?: string;
  status: 'approved' | 'pending_approval' | 'rejected';
  submittedByNurseName?: string;
  submittedByNurseId?: string;
  submittedAt?: string;
  approvedAt?: string;
  accreditedBy?: string;
  programTypes?: string[];
  notes?: string;
}

export type MilestoneCategory = 
  | 'therapy_sessions' 
  | 'medication_adherence' 
  | 'practitioner_visits' 
  | 'clinical_excellence';

export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  completedAt?: string;
  rewardLabel: string;
  rewardClaimed?: boolean;
  tier: MilestoneTier;
  iconName: string;
  targetRole: 'patient' | 'nurse';
  motivationalQuote: string;
}

export interface CelebrationPayload {
  milestoneId: string;
  title: string;
  subtitle: string;
  milestoneTitle: string;
  category: MilestoneCategory;
  tier: MilestoneTier;
  count: number;
  targetRole: 'patient' | 'nurse';
  recipientName: string;
  rewardText: string;
  motivationalQuote: string;
  certificateData?: {
    recipientName: string;
    achievementTitle: string;
    dateAwarded: string;
    issuer: string;
    verificationCode: string;
  };
}

export interface VideoMeeting {
  id: string;
  title: string;
  meetingType: 'onboarding_review' | 'care_consultation' | 'dispute_resolution' | 'routine_checkin' | 'emergency_triage';
  type?: string;
  hostRole: 'admin' | 'nurse' | 'client';
  hostName: string;
  participantRole: 'nurse' | 'client' | 'admin';
  participantId: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  scheduledDateTime: string;
  date?: string;
  time?: string;
  durationMinutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingRoomId: string;
  meetingUrl?: string;
  roomUrl?: string;
  notes?: string;
  createdAt?: string;
}

// WhatsApp Cloud API & Remote Visit Management Types
export interface WhatsAppTemplate {
  name: string; // e.g. "wecare_start_code"
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  status: 'APPROVED' | 'IN_REVIEW' | 'REJECTED';
  language: string;
  body: string;
  description: string;
  sampleVariables: string[];
  buttons?: { type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'; text: string; value?: string }[];
  metaSubmissionDate: string;
}

export interface WhatsAppMessageLogItem {
  id: string;
  bookingId?: string;
  direction: 'outbound' | 'inbound';
  templateName?: string;
  recipientPhone: string;
  recipientName: string;
  recipientRole: 'family_helper' | 'client_elderly' | 'nurse';
  body: string;
  buttons?: string[];
  status: 'delivered' | 'read' | 'failed' | 'sent';
  timestamp: string;
  actionTriggered?: string;
  deliveryLatencySeconds?: number;
  smsFallbackSent?: boolean;
  smsFallbackTimestamp?: string;
  source?: string; // e.g. "whatsapp_family_remote"
}

// Admin Payroll & Accountability System Types
export type AdminStaffRole = 'Support' | 'Dispatcher' | 'Manager' | 'Operations Director';
export type AdminPayStatus = 'paid' | 'due' | 'overdue';

export interface AdminPayrollRecord {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  role: AdminStaffRole;
  weeklySalaryJMD: number; // default 4000
  startDate: string; // YYYY-MM-DD
  weeksWorked?: number;
  status: 'Active' | 'Inactive';
  totalPaid: number;
  totalEarned: number;
  balanceDue: number;
  lastPayDate?: string;
  lynkOrBankInfo: string;
  phone?: string;
  lastAccrualMonday?: string; // YYYY-MM-DD to prevent duplicate automated Monday runs
}

export interface AdminPaymentHistoryItem {
  id: string;
  adminId: string;
  adminName: string;
  role: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method: string; // Lynk, NCB, Scotiabank, JN Bank, etc.
  transactionId: string;
  paidBy: string; // "We Care Jamaica (wecareja.bookings@gmail.com)"
  note?: string;
  weekPeriod: string; // e.g. "Mon Sep 22, 2025 - Sun Sep 28, 2025"
  weeklySalary: number;
  balanceAfterPayment: number;
  lynkOrBankInfo?: string;
}

export interface MedicalSupplyItem {
  id: string;
  name: string;
  price_jmd: number;
  category: string;
  stock: number;
  stock_quantity?: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  requires_prescription?: boolean;
  created_at?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price_jmd: number;
  stock_qty: number;
  image_url: string;
  is_active: boolean;
}

export interface SupplyOrderItem {
  supply_id: string;
  name: string;
  price_jmd: number;
  quantity: number;
}

export interface SupplyOrder {
  id: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  items: SupplyOrderItem[];
  total_jmd: number;
  delivery_date?: string;
  status: 'pending' | 'invoiced' | 'paid' | 'delivered' | 'cancelled';
  invoice_url?: string;
  notes?: string;
  created_at: string;
}


