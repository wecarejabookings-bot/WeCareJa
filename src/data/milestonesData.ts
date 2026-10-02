import { MilestoneItem, CelebrationPayload, Booking } from '../types';

export const INITIAL_PATIENT_MILESTONES: MilestoneItem[] = [
  // Therapy & Rehabilitation Sessions Track
  {
    id: 'p-therapy-1',
    title: 'First Healing Step',
    description: 'Complete your 1st professional in-home therapy or rehabilitation session.',
    category: 'therapy_sessions',
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    completedAt: '2026-08-15T14:30:00Z',
    rewardLabel: 'Welcome Ribbon + $3 Care Credit',
    rewardClaimed: true,
    tier: 'bronze',
    iconName: 'Footprints',
    targetRole: 'patient',
    motivationalQuote: 'Every journey of healing begins with a courageous first step.'
  },
  {
    id: 'p-therapy-3',
    title: 'Consistency Champion',
    description: 'Complete 3 therapy or mobility rehabilitation sessions.',
    category: 'therapy_sessions',
    targetCount: 3,
    currentCount: 2,
    isCompleted: false,
    rewardLabel: 'Silver Resilience Badge + $4 Care Credit',
    rewardClaimed: false,
    tier: 'silver',
    iconName: 'Activity',
    targetRole: 'patient',
    motivationalQuote: 'Small regular steps lead to triumphant recovery.'
  },
  {
    id: 'p-therapy-5',
    title: 'Therapy All-Star',
    description: 'Reach 5 completed therapy sessions with your licensed caregiver.',
    category: 'therapy_sessions',
    targetCount: 5,
    currentCount: 2,
    isCompleted: false,
    rewardLabel: 'Gold Star Badge + $5 Care Voucher',
    rewardClaimed: false,
    tier: 'gold',
    iconName: 'Award',
    targetRole: 'patient',
    motivationalQuote: 'Strength does not come from what you can do; it comes from overcoming the things you thought you could not.'
  },
  {
    id: 'p-therapy-10',
    title: 'Master of Recovery',
    description: 'Achieve 10 completed rehabilitation and therapy sessions.',
    category: 'therapy_sessions',
    targetCount: 10,
    currentCount: 2,
    isCompleted: false,
    rewardLabel: 'Certificate of Physical Recovery + $7 Care Credit',
    rewardClaimed: false,
    tier: 'platinum',
    iconName: 'Trophy',
    targetRole: 'patient',
    motivationalQuote: 'Your resilience and dedication are an inspiration to your entire care circle.'
  },
  {
    id: 'p-therapy-15',
    title: 'Resilience Legend',
    description: 'Master 15 comprehensive rehabilitation sessions.',
    category: 'therapy_sessions',
    targetCount: 15,
    currentCount: 2,
    isCompleted: false,
    rewardLabel: 'Diamond Health Trophy + $9 Care Credit',
    rewardClaimed: false,
    tier: 'diamond',
    iconName: 'Crown',
    targetRole: 'patient',
    motivationalQuote: 'Where there is steadfast commitment, lasting wellness always follows.'
  },

  // Medication Adherence & Consistent Check-Ins Track
  {
    id: 'p-med-3',
    title: 'Adherence Spark',
    description: 'Log 3 consecutive days of on-time medication check-ins.',
    category: 'medication_adherence',
    targetCount: 3,
    currentCount: 3,
    isCompleted: true,
    completedAt: '2026-08-20T09:00:00Z',
    rewardLabel: 'Bronze Health Badge + $2 Care Credit',
    rewardClaimed: true,
    tier: 'bronze',
    iconName: 'Pill',
    targetRole: 'patient',
    motivationalQuote: 'Consistency is the heartbeat of stable health.'
  },
  {
    id: 'p-med-7',
    title: 'Weekly Health Hero',
    description: 'Complete a full 7-day streak of consistent medication check-ins.',
    category: 'medication_adherence',
    targetCount: 7,
    currentCount: 6,
    isCompleted: false,
    rewardLabel: 'Silver Adherence Shield + $5 Care Voucher',
    rewardClaimed: false,
    tier: 'silver',
    iconName: 'ShieldCheck',
    targetRole: 'patient',
    motivationalQuote: 'A whole week of disciplined care transforms your body and mind.'
  },
  {
    id: 'p-med-14',
    title: 'Fortnight Master',
    description: 'Achieve 14 consecutive days of flawless medication check-ins.',
    category: 'medication_adherence',
    targetCount: 14,
    currentCount: 6,
    isCompleted: false,
    rewardLabel: 'Gold Pillbox Badge + $6 Care Credit',
    rewardClaimed: false,
    tier: 'gold',
    iconName: 'CalendarCheck',
    targetRole: 'patient',
    motivationalQuote: 'Two solid weeks of compliance builds an unbreakable foundation.'
  },
  {
    id: 'p-med-30',
    title: 'Adherence Titan',
    description: 'Reach a milestone 30-day streak of daily medication check-ins.',
    category: 'medication_adherence',
    targetCount: 30,
    currentCount: 6,
    isCompleted: false,
    rewardLabel: 'Official Certificate of Medication Adherence + $8 Care Credit',
    rewardClaimed: false,
    tier: 'platinum',
    iconName: 'Sparkles',
    targetRole: 'patient',
    motivationalQuote: 'True wellness is won day by day, and you are a true champion.'
  }
];

export const INITIAL_PRACTITIONER_MILESTONES: MilestoneItem[] = [
  // Patient Care Visits & Therapy Delivery Track
  {
    id: 'n-visit-1',
    title: 'Compassion Novice',
    description: 'Complete your inaugural home care or therapy visit with sterile excellence.',
    category: 'practitioner_visits',
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    completedAt: '2026-07-10T11:00:00Z',
    rewardLabel: 'Welcome Practitioner Badge + JMD $500 Welcome Bonus',
    rewardClaimed: true,
    tier: 'bronze',
    iconName: 'Heart',
    targetRole: 'nurse',
    motivationalQuote: 'Every compassionate touch brings dignity to our Jamaican elders.'
  },
  {
    id: 'n-visit-5',
    title: 'Rising Care Star',
    description: 'Complete 5 patient visits with verified clinical documentation.',
    category: 'practitioner_visits',
    targetCount: 5,
    currentCount: 5,
    isCompleted: true,
    completedAt: '2026-08-02T16:00:00Z',
    rewardLabel: 'Silver Stethoscope Pin + Priority Dispatch',
    rewardClaimed: true,
    tier: 'silver',
    iconName: 'Star',
    targetRole: 'nurse',
    motivationalQuote: 'Caring is not just a skill—it is an art of the heart.'
  },
  {
    id: 'n-visit-10',
    title: 'Care Angel',
    description: 'Deliver 10 completed patient sessions across Kingston communities.',
    category: 'practitioner_visits',
    targetCount: 10,
    currentCount: 8,
    isCompleted: false,
    rewardLabel: 'Gold Caregiver Badge + JMD $2,500 Performance Perk',
    rewardClaimed: false,
    tier: 'gold',
    iconName: 'Award',
    targetRole: 'nurse',
    motivationalQuote: 'Nurses dispense comfort and hope without ever needing a prescription.'
  },
  {
    id: 'n-visit-25',
    title: 'Elite Jamaican Practitioner',
    description: 'Deliver 25 successful home health & therapy visits.',
    category: 'practitioner_visits',
    targetCount: 25,
    currentCount: 8,
    isCompleted: false,
    rewardLabel: 'Certificate of Nursing Excellence + 1% Fee Waiver',
    rewardClaimed: false,
    tier: 'platinum',
    iconName: 'Trophy',
    targetRole: 'nurse',
    motivationalQuote: 'Excellence in bedside care transforms entire families and neighborhoods.'
  },
  {
    id: 'n-visit-50',
    title: 'Centurion Healer',
    description: 'Complete 50 home health visits with premier patient feedback.',
    category: 'practitioner_visits',
    targetCount: 50,
    currentCount: 8,
    isCompleted: false,
    rewardLabel: 'Diamond Healer Trophy + Featured Practitioner Spotlight',
    rewardClaimed: false,
    tier: 'diamond',
    iconName: 'Crown',
    targetRole: 'nurse',
    motivationalQuote: 'A pillar of Jamaican healthcare, serving with unending grace.'
  },

  // Clinical Excellence & On-Time Consistency Track
  {
    id: 'n-doc-3',
    title: 'Clinical Protocol Master',
    description: 'Log 3 detailed vital sets and sterile care summaries.',
    category: 'clinical_excellence',
    targetCount: 3,
    currentCount: 3,
    isCompleted: true,
    completedAt: '2026-07-28T12:00:00Z',
    rewardLabel: 'Sterile Protocol Seal',
    rewardClaimed: true,
    tier: 'bronze',
    iconName: 'ShieldCheck',
    targetRole: 'nurse',
    motivationalQuote: 'Precision in clinical records ensures safe continuity of care.'
  },
  {
    id: 'n-rate-5',
    title: '5-Star Community Favorite',
    description: 'Earn 5 perfect five-star reviews from Jamaican families.',
    category: 'clinical_excellence',
    targetCount: 5,
    currentCount: 4,
    isCompleted: false,
    rewardLabel: 'Top-Rated Crown + Preferred Match Status',
    rewardClaimed: false,
    tier: 'gold',
    iconName: 'Star',
    targetRole: 'nurse',
    motivationalQuote: 'Kindness is the universal medicine that resonates in every home.'
  },
  {
    id: 'n-call-7',
    title: 'On-Call Dispatch Champion',
    description: 'Maintain on-call readiness across 7 dispatch shifts.',
    category: 'clinical_excellence',
    targetCount: 7,
    currentCount: 5,
    isCompleted: false,
    rewardLabel: 'Fast Responder Pin + JMD $1,500 Bonus',
    rewardClaimed: false,
    tier: 'silver',
    iconName: 'Zap',
    targetRole: 'nurse',
    motivationalQuote: 'Readiness when patients need urgent bedside care saves lives.'
  }
];

/**
 * Calculates patient therapy sessions from completed bookings
 */
export function calculatePatientTherapySessionsCount(bookings: Booking[]): number {
  return bookings.filter(b => {
    if (b.status !== 'completed' && !b.clinicalNotes) return false;
    const sName = (b.serviceName || '').toLowerCase();
    return (
      sName.includes('therapy') ||
      sName.includes('mobility') ||
      sName.includes('rehab') ||
      sName.includes('wound') ||
      sName.includes('companion') ||
      sName.includes('adl') ||
      sName.includes('routine') ||
      sName.includes('vitals')
    );
  }).length;
}

/**
 * Calculates nurse completed visits
 */
export function calculateNurseVisitsCount(nurseId: string, bookings: Booking[]): number {
  return bookings.filter(b => 
    (b.nurseId === nurseId || b.nurseName?.includes(nurseId)) &&
    (b.status === 'completed' || !!b.clinicalNotes)
  ).length;
}

/**
 * Motivational Jamaican Wellness Quotes for positive reinforcement
 */
export const MOTIVATIONAL_REINFORCEMENTS = {
  patient: [
    '“Every day you show up for your therapy and take your medication, you are giving your family the gift of your presence.”',
    '“One one cocoa full basket. Small daily health efforts compound into miraculous strength.”',
    '“Healing is not an overnight race; it is a steady walk of courage and consistency.”',
    '“Your dedication to your wellness inspires everyone around you in Kingston.”',
    '“Listen to your body, celebrate every bend, every stretch, every steady vital sign.”'
  ],
  nurse: [
    '“Your healing hands and warm words bring peace to homes when they need it most.”',
    '“Jamaican nurses are the backbone of our community. Thank you for your tireless dedication!”',
    '“Excellence in nursing is doing the quiet, compassionate things that no one sees, but everyone feels.”',
    '“Every clinical chart you close represents a human being who was cared for with dignity.”',
    '“You don’t just treat symptoms—you restore hope and comfort.”'
  ]
};

/**
 * Returns the next upcoming visit milestone for a nurse / caregiver
 */
export function getPractitionerNextMilestone(currentVisits: number, milestonesList?: MilestoneItem[]) {
  const list = milestonesList || INITIAL_PRACTITIONER_MILESTONES;
  const visitMilestones = list
    .filter(m => m.category === 'practitioner_visits')
    .sort((a, b) => a.targetCount - b.targetCount);

  // Find first milestone not yet achieved
  const next = visitMilestones.find(m => currentVisits < m.targetCount);
  if (!next) {
    const highest = visitMilestones[visitMilestones.length - 1];
    return {
      nextMilestone: highest,
      isMaxLevel: true,
      remainingVisits: 0,
      progressPct: 100,
      targetCount: highest?.targetCount || 50
    };
  }

  // Find previous threshold for proportional progress
  const prevTarget = visitMilestones
    .filter(m => m.targetCount < next.targetCount)
    .pop()?.targetCount || 0;

  const progressRange = next.targetCount - prevTarget;
  const currentProgress = Math.max(0, currentVisits - prevTarget);
  const progressPct = Math.min(100, Math.round((currentProgress / progressRange) * 100));

  return {
    nextMilestone: next,
    isMaxLevel: false,
    remainingVisits: Math.max(0, next.targetCount - currentVisits),
    progressPct,
    targetCount: next.targetCount
  };
}

/**
 * Returns the next upcoming visit milestone for a client / patient
 */
export function getClientNextMilestone(currentVisits: number, milestonesList?: MilestoneItem[]) {
  const list = milestonesList || INITIAL_PATIENT_MILESTONES;
  const visitMilestones = list
    .filter(m => m.category === 'therapy_sessions')
    .sort((a, b) => a.targetCount - b.targetCount);

  const next = visitMilestones.find(m => currentVisits < m.targetCount);
  if (!next) {
    const highest = visitMilestones[visitMilestones.length - 1];
    return {
      nextMilestone: highest,
      isMaxLevel: true,
      remainingVisits: 0,
      progressPct: 100,
      targetCount: highest?.targetCount || 15
    };
  }

  const prevTarget = visitMilestones
    .filter(m => m.targetCount < next.targetCount)
    .pop()?.targetCount || 0;

  const progressRange = next.targetCount - prevTarget;
  const currentProgress = Math.max(0, currentVisits - prevTarget);
  const progressPct = Math.min(100, Math.round((currentProgress / progressRange) * 100));

  return {
    nextMilestone: next,
    isMaxLevel: false,
    remainingVisits: Math.max(0, next.targetCount - currentVisits),
    progressPct,
    targetCount: next.targetCount
  };
}

/**
 * Monthly performance metric data point for recharts
 */
export interface CaregiverMonthlyMetric {
  month: string;
  monthKey: string;
  visits: number;
  targetVisits: number;
  growthPct: number;
  avgRating: number;
  csatPercentage: number;
  fiveStarReviews: number;
  fourStarReviews: number;
  totalHoursLogged: number;
  // Service breakdown counts
  woundCare: number;
  vitalsCheck: number;
  elderlyCompanionship: number;
  rehabTherapy: number;
  medicationIV: number;
}

/**
 * Generates monthly performance metrics for a caregiver by blending realistic historical
 * trends with actual completed bookings in the current session.
 */
export function generateCaregiverMonthlyPerformance(
  nurseId: string,
  bookings: Booking[],
  nurseVisitsCount: number
): CaregiverMonthlyMetric[] {
  // Baseline months (April 2026 - September 2026)
  const baseMonthlyData: CaregiverMonthlyMetric[] = [
    {
      month: 'Apr 2026',
      monthKey: '2026-04',
      visits: 6,
      targetVisits: 5,
      growthPct: 15.0,
      avgRating: 4.86,
      csatPercentage: 96,
      fiveStarReviews: 5,
      fourStarReviews: 1,
      totalHoursLogged: 18.5,
      woundCare: 2,
      vitalsCheck: 2,
      elderlyCompanionship: 1,
      rehabTherapy: 1,
      medicationIV: 0
    },
    {
      month: 'May 2026',
      monthKey: '2026-05',
      visits: 8,
      targetVisits: 7,
      growthPct: 33.3,
      avgRating: 4.90,
      csatPercentage: 97,
      fiveStarReviews: 7,
      fourStarReviews: 1,
      totalHoursLogged: 24.0,
      woundCare: 3,
      vitalsCheck: 2,
      elderlyCompanionship: 2,
      rehabTherapy: 1,
      medicationIV: 0
    },
    {
      month: 'Jun 2026',
      monthKey: '2026-06',
      visits: 11,
      targetVisits: 9,
      growthPct: 37.5,
      avgRating: 4.92,
      csatPercentage: 98,
      fiveStarReviews: 10,
      fourStarReviews: 1,
      totalHoursLogged: 33.5,
      woundCare: 4,
      vitalsCheck: 3,
      elderlyCompanionship: 2,
      rehabTherapy: 1,
      medicationIV: 1
    },
    {
      month: 'Jul 2026',
      monthKey: '2026-07',
      visits: 14,
      targetVisits: 12,
      growthPct: 27.2,
      avgRating: 4.95,
      csatPercentage: 99,
      fiveStarReviews: 13,
      fourStarReviews: 1,
      totalHoursLogged: 42.0,
      woundCare: 5,
      vitalsCheck: 4,
      elderlyCompanionship: 3,
      rehabTherapy: 1,
      medicationIV: 1
    },
    {
      month: 'Aug 2026',
      monthKey: '2026-08',
      visits: 17,
      targetVisits: 15,
      growthPct: 21.4,
      avgRating: 4.97,
      csatPercentage: 100,
      fiveStarReviews: 16,
      fourStarReviews: 1,
      totalHoursLogged: 51.5,
      woundCare: 6,
      vitalsCheck: 4,
      elderlyCompanionship: 4,
      rehabTherapy: 2,
      medicationIV: 1
    },
    {
      month: 'Sep 2026',
      monthKey: '2026-09',
      visits: 21,
      targetVisits: 18,
      growthPct: 23.5,
      avgRating: 4.98,
      csatPercentage: 100,
      fiveStarReviews: 20,
      fourStarReviews: 1,
      totalHoursLogged: 63.0,
      woundCare: 8,
      vitalsCheck: 5,
      elderlyCompanionship: 4,
      rehabTherapy: 2,
      medicationIV: 2
    }
  ];

  // Incorporate actual live session bookings for current nurse
  const nurseBookings = bookings.filter(b => 
    (b.nurseId === nurseId || b.nurseName?.includes(nurseId)) &&
    b.status === 'completed'
  );

  // If there are newly completed bookings, increment the current month (Sep 2026)
  const extraVisits = Math.max(0, nurseBookings.length - 1);
  if (extraVisits > 0) {
    const currentMonth = baseMonthlyData[baseMonthlyData.length - 1];
    currentMonth.visits += extraVisits;
    currentMonth.fiveStarReviews += extraVisits;
    currentMonth.woundCare += Math.ceil(extraVisits / 2);
    currentMonth.vitalsCheck += Math.floor(extraVisits / 2);
    currentMonth.totalHoursLogged += extraVisits * 1.5;
  }

  return baseMonthlyData;
}
