import { 
  ServiceItem, 
  NurseProfile, 
  Booking, 
  NotificationTemplate, 
  FAQItem, 
  PayoutRecord, 
  AdminProfile, 
  UserAccount, 
  NursePeerChatMessage, 
  ActivityNotificationItem, 
  NursingSchool, 
  VideoMeeting 
} from '../types';

export const ADMIN_PROFILE: AdminProfile = {
  name: 'Sydney Mattis',
  officeNumber: '(876) 582-7613',
  formattedPhone: '(876) 582-7613',
  email: 'wecareja.bookings@gmail.com',
  role: 'Lead Administrator & Operations Director',
  title: 'Master Administrator',
  officeAddress: '4 Claudete Drive, St. Catherine, Jamaica',
  status: 'Active Duty'
};

export const KINGSTON_ZONES = [
  'New Kingston',
  'Liguanea & Mona',
  'Barbican & Cherry Gardens',
  'Half-Way-Tree',
  'Constant Spring & Manor Park',
  'Cross Roads & Vineyard Town',
  'Red Hills & Meadowbrook',
  'Stony Hill & Golden Spring',
  'Hope Pastures & Papine',
  'Downtown Kingston & Waterfront'
];

export const PORTMORE_ZONES = [
  'Portmore - Greater Portmore',
  'Portmore - Braeton & Hellshire',
  'Portmore - Bridgeport & Waterford',
  'Portmore - Edgewater & Bayside',
  'Portmore - Portmore Pines & Caribbean Estate'
];

export const SPANISH_TOWN_ZONES = [
  'Spanish Town - Town Centre & Cathedral',
  'Spanish Town - Ensom City & Eltham',
  'Spanish Town - Brunswick & St Jago Heights',
  'Spanish Town - Innswood & Willowdene'
];

export const ALL_SERVICE_ZONES = [
  ...KINGSTON_ZONES,
  ...PORTMORE_ZONES,
  ...SPANISH_TOWN_ZONES
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Wound Dressing & Post-Op Care',
    category: 'clinical',
    description: 'Sterile surgical wound cleansing, suture/staple assessment, and modern dressing application for faster recovery.',
    durationMinutes: 45,
    priceJMD: 7500,
    icon: 'Bandage',
    imageUrl: '/images/wound_dressing.jpg',
    popular: true,
    careLevelRequired: 'registered_nurse',
    careScopeSummary: 'Licensed clinical procedure requiring sterile NCJ Registered Nurse',
    logoTheme: 'emerald',
    badgeLabel: 'Wound Care',
    iconType: 'bandage',
    tagline: 'Sterile surgical dressings & suture care'
  },
  {
    id: 'srv-2',
    name: 'Elderly Vitals & Medication Management',
    category: 'elderly',
    description: 'Comprehensive blood pressure, pulse, glucose check, pill organizer setup, and general senior wellness inspection.',
    durationMinutes: 45,
    priceJMD: 6500,
    icon: 'HeartPulse',
    imageUrl: '/images/elderly_vitals.jpg',
    popular: true,
    careLevelRequired: 'any',
    careScopeSummary: 'Full vitals check, pill dispenser setup & wellness audit',
    logoTheme: 'cyan',
    badgeLabel: 'Vitals & Meds',
    iconType: 'vitals',
    tagline: 'Comprehensive vitals & pill organizer'
  },
  {
    id: 'srv-3',
    name: 'IV Therapy & Injectable Admin',
    category: 'clinical',
    description: 'Doctor-prescribed IV hydration, vitamin infusions, IM/SC injections, and cannula care by certified infusion nurses.',
    durationMinutes: 60,
    priceJMD: 9000,
    icon: 'Syringe',
    imageUrl: '/images/iv_therapy.jpg',
    popular: true,
    careLevelRequired: 'registered_nurse',
    careScopeSummary: 'Invasive IV therapy strictly performed by NCJ Registered Nurse',
    logoTheme: 'purple',
    badgeLabel: 'IV Infusion',
    iconType: 'syringe',
    tagline: 'Sterile intravenous & injectable therapy'
  },
  {
    id: 'srv-4',
    name: 'Catheter & Stoma Tube Care',
    category: 'specialized',
    description: 'Foley/Suprapubic catheter bag flush/replacement, colostomy care, and infection prevention monitoring.',
    durationMinutes: 60,
    priceJMD: 8200,
    icon: 'Activity',
    imageUrl: '/images/medication_management.jpg',
    careLevelRequired: 'registered_nurse',
    careScopeSummary: 'Specialized urinary/stoma tube care by NCJ Clinical Nurse',
    logoTheme: 'blue',
    badgeLabel: 'Catheter Care',
    iconType: 'catheter',
    tagline: 'Foley, suprapubic & stoma maintenance'
  },
  {
    id: 'srv-5',
    name: 'Postnatal & Newborn Mother Care',
    category: 'wellness',
    description: 'Postpartum check, C-section incision review, newborn umbilical cord care, latching & feeding support.',
    durationMinutes: 75,
    priceJMD: 8800,
    icon: 'Baby',
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=600',
    popular: true,
    careLevelRequired: 'registered_nurse',
    careScopeSummary: 'Certified Registered Midwife/Nurse mother & baby care',
    logoTheme: 'rose',
    badgeLabel: 'Maternal & Baby',
    iconType: 'baby',
    tagline: 'Midwife-led postpartum & newborn care'
  },
  {
    id: 'srv-6',
    name: 'Palliative & Comfort Nursing',
    category: 'specialized',
    description: 'Compassionate symptom management, positioning, pain protocol assistance, and respite for family caregivers.',
    durationMinutes: 90,
    priceJMD: 10500,
    icon: 'Sparkles',
    imageUrl: '/images/palliative_comfort.jpg',
    careLevelRequired: 'any',
    careScopeSummary: 'Comprehensive comfort and pain symptom care',
    logoTheme: 'amber',
    badgeLabel: 'Comfort Care',
    iconType: 'palliative',
    tagline: 'Dignified symptom & pain management'
  },
  {
    id: 'srv-7',
    name: 'Geriatric Companion & ADL Care',
    category: 'elderly',
    description: 'Assistance with activities of daily living: personal hygiene, bathing, dressing, meal prep, mobility transfer, and senior companionship. Non-invasive minimal care.',
    durationMinutes: 60,
    priceJMD: 3200,
    icon: 'HeartHandshake',
    imageUrl: '/images/mobility_hydration.jpg',
    popular: true,
    careLevelRequired: 'geriatric_caregiver',
    suitableForGeriatricCaregiver: true,
    careScopeSummary: 'Non-NCJ Minimal Care: Assisted bathing, hygiene, meal prep, mobility & companion care',
    logoTheme: 'amber',
    badgeLabel: 'Companion ADL',
    iconType: 'companion',
    tagline: 'Hygiene, meal prep & companionship'
  },
  {
    id: 'srv-8',
    name: 'Senior Morning/Bedtime Routine & Vitals',
    category: 'elderly',
    description: 'Morning awakening or evening tuck-in, assisted mobility, non-clinical vital sign check (BP, pulse, temp), hydration, and medication reminder.',
    durationMinutes: 60,
    priceJMD: 3500,
    icon: 'Sun',
    imageUrl: '/images/vitals_monitoring.jpg',
    popular: true,
    careLevelRequired: 'geriatric_caregiver',
    suitableForGeriatricCaregiver: true,
    careScopeSummary: 'Non-NCJ Care: Awakening/tuck-in routine, vitals logging, hydration & pill reminders',
    logoTheme: 'indigo',
    badgeLabel: 'Routine Care',
    iconType: 'routine',
    tagline: 'Awakening & evening tuck-in visits'
  },
  {
    id: 'srv-9',
    name: 'Senior Respite Care (2-Hour Block)',
    category: 'elderly',
    description: 'Dedicated 2-hour family caregiver relief block: supervision, conversational companionship, cognitive games, light meal assistance, and personal care.',
    durationMinutes: 120,
    priceJMD: 5800,
    icon: 'Clock',
    imageUrl: '/images/senior_respite.jpg',
    careLevelRequired: 'geriatric_caregiver',
    suitableForGeriatricCaregiver: true,
    careScopeSummary: 'Non-NCJ Care: 2-Hour family respite relief, companionship & supervision',
    logoTheme: 'cyan',
    badgeLabel: '2-Hr Respite',
    iconType: 'respite',
    tagline: 'Dedicated 2-hour family relief block'
  },
  {
    id: 'srv-10',
    name: 'Mobility & Assisted Transfer Support',
    category: 'elderly',
    description: 'Gentle assisted walking, transfer support, wheelchair transfer, active range of motion exercise support, and fall prevention guidance.',
    durationMinutes: 40,
    priceJMD: 2800,
    icon: 'Activity',
    imageUrl: '/images/mobility_hydration.jpg',
    careLevelRequired: 'geriatric_caregiver',
    suitableForGeriatricCaregiver: true,
    careScopeSummary: 'Non-NCJ Care: Safe wheelchair/bed transfers, fall prevention & walking support',
    logoTheme: 'blue',
    badgeLabel: 'Mobility Care',
    iconType: 'mobility',
    tagline: 'Wheelchair, transfer & fall prevention'
  },
  {
    id: 'srv-11',
    name: '3x Daily Practitioner Guardian Care (Morning, Afternoon & Evening Visits)',
    category: 'elderly',
    description: 'Comprehensive 3-visit daily care regimen for elderly loved ones left alone at home: Morning awakening, vitals & breakfast/meds (8am), Afternoon hydration, meal & mobility check (1pm), Evening dinner, night meds & bedtime safety audit (6pm).',
    durationMinutes: 180,
    priceJMD: 14500,
    icon: 'Heart',
    imageUrl: '/images/elderly_vitals.jpg',
    popular: true,
    careLevelRequired: 'any',
    suitableForGeriatricCaregiver: true,
    careScopeSummary: 'Comprehensive Triple-Daily Care: Morning routine, midday nutrition/mobility & evening tuck-in safety check',
    logoTheme: 'emerald',
    badgeLabel: '3x Guardian',
    iconType: 'guardian3x',
    tagline: 'Triple-daily morning, midday & night care'
  }
];

// Clean Initial Nurses - Ready for real nurse onboarding (no demo users on launch)
export const INITIAL_NURSES: NurseProfile[] = [];

// Clean Initial Bookings - Ready for real clients
export const INITIAL_BOOKINGS: Booking[] = [];

// Clean Initial Payouts - Ready for real payouts
export const INITIAL_PAYOUTS: PayoutRecord[] = [];

// Master Administrator (Pre-Launch Launch Ready)
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-admin-01',
    username: 'sydney',
    password: '12345678',
    role: 'admin',
    approvalStatus: 'approved',
    name: 'Sydney Mattis',
    email: 'wecareja.bookings@gmail.com',
    phone: '(876) 582-7613',
    title: 'Lead Operations Director & Master Administrator',
    department: 'Executive Clinical Leadership & Registry Audit',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813629-455b5502c3ef?auto=format&fit=crop&q=80&w=400',
    zone: 'St. Catherine & Kingston',
    address: '4 Claudete Drive, St. Catherine, Jamaica',
    createdAt: '2026-01-01T08:00:00.000Z',
    lastLoginAt: '2026-09-30T03:30:00.000Z'
  }
];

// Clean Initial Peer Messages
export const INITIAL_PEER_MESSAGES: NursePeerChatMessage[] = [];

// Clean Initial Activity Notifications
export const INITIAL_ACTIVITY_NOTIFICATIONS: ActivityNotificationItem[] = [];

// Official Accredited Jamaican Nursing Schools
export const INITIAL_NURSING_SCHOOLS: NursingSchool[] = [
  {
    id: 'school-1',
    name: 'The UWI School of Nursing, Mona (UWISON)',
    shortName: 'UWISON',
    category: 'university',
    parish: 'St. Andrew',
    status: 'approved',
    accreditedBy: 'Nursing Council of Jamaica (NCJ) & UCJ',
    programTypes: ['BSc Nursing', 'MSc Advanced Practice Nursing', 'PhD Nursing']
  },
  {
    id: 'school-2',
    name: 'University of Technology, Jamaica (UTech)',
    shortName: 'UTech',
    category: 'university',
    parish: 'St. Andrew',
    status: 'approved',
    accreditedBy: 'Nursing Council of Jamaica (NCJ) & UCJ',
    programTypes: ['Bachelor of Science in Nursing', 'Post-Diploma RN to BSN']
  },
  {
    id: 'school-3',
    name: 'Kingston School of Nursing (KSN)',
    shortName: 'KSN',
    category: 'college',
    parish: 'Kingston',
    status: 'approved',
    accreditedBy: 'Nursing Council of Jamaica (NCJ)',
    programTypes: ['Diploma in General Nursing', 'Midwifery Certification']
  },
  {
    id: 'school-4',
    name: 'Excelsior Community College (ECC) School of Nursing',
    shortName: 'ECC',
    category: 'college',
    parish: 'Kingston',
    status: 'approved',
    accreditedBy: 'Nursing Council of Jamaica (NCJ)',
    programTypes: ['Associate & Bachelor of Science in Nursing']
  },
  {
    id: 'school-5',
    name: 'Northern Caribbean University (NCU) Department of Nursing',
    shortName: 'NCU',
    category: 'university',
    parish: 'Manchester',
    status: 'approved',
    accreditedBy: 'Nursing Council of Jamaica (NCJ)',
    programTypes: ['BSc Nursing']
  }
];

// Clean Video Meetings
export const INITIAL_VIDEO_MEETINGS: VideoMeeting[] = [];

// Notification Templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Booking Confirmed (Client)',
    recipient: 'Client',
    trigger: 'Immediate upon escrow payment approval',
    channel: 'SMS',
    messageBody: 'We Care Jamaica: Your booking for [Service] with [Nurse] has been confirmed. Arriving at [Time]. Track live at: wecare.com.jm'
  },
  {
    id: 'tmpl-2',
    title: 'Nurse En Route (Client)',
    recipient: 'Client',
    trigger: 'Nurse taps Start Travel in app',
    channel: 'WhatsApp',
    messageBody: 'We Care Jamaica Alert: [Nurse] is now en route to your location in [Zone]. Estimated arrival in [ETA] mins. Emergency hotline: (876) 582-7613.'
  },
  {
    id: 'tmpl-3',
    title: 'Visit Completion & Clinical Receipt (Client)',
    recipient: 'Client',
    trigger: 'Nurse completes care visit',
    channel: 'Email',
    messageBody: 'Your official We Care Jamaica Clinical Summary and Invoice are ready for download. Thank you for choosing We Care Jamaica, 4 Claudete Drive, St. Catherine.'
  }
];

// FAQ Items
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Are all nurses licensed by the Nursing Council of Jamaica (NCJ)?',
    answer: 'Yes. Every clinical healthcare professional on We Care Jamaica holds an active, verified license with the Nursing Council of Jamaica (NCJ), police background checks, and verified credentials.',
    category: 'Safety & Payments'
  },
  {
    id: 'faq-2',
    question: 'How does payment and escrow protection work?',
    answer: 'Your payment is securely authorized and held in escrow when booking. Funds are only released to the healthcare professional after the visit is completed and verified.',
    category: 'Safety & Payments'
  },
  {
    id: 'faq-3',
    question: 'Where is We Care Jamaica physically based?',
    answer: 'We Care Jamaica is headquartered at 4 Claudete Drive, St. Catherine, Jamaica, with dedicated clinical coverage across Kingston, St. Andrew, Portmore, and Spanish Town.',
    category: 'Client'
  }
];

// Explicit Aliases for Flexible Imports
export const nurses: NurseProfile[] = INITIAL_NURSES;
export const clients: UserAccount[] = [];
export const bookings: Booking[] = INITIAL_BOOKINGS;
export const caregivers: NurseProfile[] = [];
export const mockNurses: NurseProfile[] = INITIAL_NURSES;
export const mockData: any[] = [];
