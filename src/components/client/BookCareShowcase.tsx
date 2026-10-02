import React, { useState, useMemo } from 'react';
import { 
  ServiceItem, 
  NurseCareLevel 
} from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  ShieldCheck, 
  Clock, 
  Heart, 
  Sparkles, 
  Zap, 
  Search, 
  ArrowRight, 
  Check, 
  HeartHandshake, 
  Info,
  Calendar,
  X,
  Stethoscope
} from 'lucide-react';

export interface CareTypeCardData {
  id: string;
  serviceId?: string;
  name: string;
  category: 'elderly' | 'clinical' | 'maternal' | 'specialized' | 'wellness';
  categoryLabel: string;
  careLevelRequired: NurseCareLevel | 'any';
  careLevelLabel: string;
  careLevelBadgeColor: string;
  pictureUrl: string;
  priceJMD: number;
  durationText: string;
  durationMinutes: number;
  shortDescription: string;
  highlights: string[];
  popular?: boolean;
  featured?: boolean;
  packageNotice?: string;
}

export const CARE_TYPES_CATALOG: CareTypeCardData[] = [
  {
    id: 'care-wound',
    serviceId: 'srv-1',
    name: 'Wound Dressing & Post-Op Surgical Care',
    category: 'clinical',
    categoryLabel: 'Clinical Nursing',
    careLevelRequired: 'registered_nurse',
    careLevelLabel: 'NCJ Registered Clinical Nurse',
    careLevelBadgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40',
    pictureUrl: '/images/wound_dressing.jpg',
    priceJMD: 7500,
    durationText: '45 mins visit',
    durationMinutes: 45,
    shortDescription: 'Sterile surgical wound cleansing, suture/staple assessment, and modern dressing application for faster in-home recovery.',
    highlights: [
      'Sterile debridement & dressing change',
      'Suture / surgical staple removal',
      'Infection risk & drainage monitoring',
      'Post-discharge physician escalation'
    ],
    popular: true,
    featured: true
  },
  {
    id: 'care-companion',
    serviceId: 'srv-7',
    name: 'Geriatric Companionship & ADL Care',
    category: 'elderly',
    categoryLabel: 'Senior & Minimal Care',
    careLevelRequired: 'geriatric_caregiver',
    careLevelLabel: 'Certified Geriatric Care Aide',
    careLevelBadgeColor: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/40',
    pictureUrl: '/images/medication_management.jpg',
    priceJMD: 3200,
    durationText: '60 mins visit',
    durationMinutes: 60,
    shortDescription: 'Affordable assistance with activities of daily living: personal hygiene, assisted bathing, dressing, meal prep, mobility transfer, and senior companionship.',
    highlights: [
      'Gentle assisted bathing & personal hygiene',
      'Nutritious meal preparation & hydration',
      'Safe wheelchair & bed mobility transfer',
      'Warm conversational companionship & games'
    ],
    popular: true
  },
  {
    id: 'care-guardian-3x',
    serviceId: 'srv-11',
    name: '3x Daily Guardian Care (Morning, Midday & Night)',
    category: 'elderly',
    categoryLabel: 'Elderly Package',
    careLevelRequired: 'any',
    careLevelLabel: 'Dedicated Guardian Routine',
    careLevelBadgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    pictureUrl: '/images/senior_respite.jpg',
    priceJMD: 14500,
    durationText: '3 Visits / Day (Morning, Midday, Evening)',
    durationMinutes: 180,
    shortDescription: 'Complete 3-visit daily regimen for elderly loved ones alone at home: Morning awakening & meds (8am), Midday nutrition & mobility (1pm), and Evening tuck-in safety check (6pm).',
    highlights: [
      '🌅 8:00 AM: Awakening, vitals, breakfast & morning meds',
      '☀️ 1:00 PM: Midday lunch, hydration, ADL & walking support',
      '🌙 6:00 PM: Dinner, night meds & bedtime safety lock audit',
      'Browser audio reminders 30 mins before each visit'
    ],
    packageNotice: 'Full 3-Visit Daily Regimen',
    featured: true
  },
  {
    id: 'care-iv',
    serviceId: 'srv-3',
    name: 'IV Therapy & Doctor-Prescribed Infusions',
    category: 'clinical',
    categoryLabel: 'Clinical Infusion',
    careLevelRequired: 'registered_nurse',
    careLevelLabel: 'NCJ Registered Infusion Nurse',
    careLevelBadgeColor: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
    pictureUrl: '/images/iv_therapy.jpg',
    priceJMD: 9000,
    durationText: '60 mins visit',
    durationMinutes: 60,
    shortDescription: 'Doctor-prescribed IV hydration, vitamin therapy, antibiotic infusions, IM/SC injections, and sterile cannula care by certified nurses.',
    highlights: [
      'Aseptic intravenous cannula insertion',
      'Prescribed fluid & electrolyte administration',
      'Intramuscular (IM) & Subcutaneous (SC) shots',
      'Vein health & phlebitis prevention audit'
    ],
    popular: true
  },
  {
    id: 'care-postnatal',
    serviceId: 'srv-5',
    name: 'Postnatal & Newborn Mother Midwife Care',
    category: 'maternal',
    categoryLabel: 'Maternal & Newborn',
    careLevelRequired: 'registered_nurse',
    careLevelLabel: 'Certified Midwife & RN (NCJ)',
    careLevelBadgeColor: 'bg-rose-500/25 text-rose-200 border-rose-400/40',
    pictureUrl: '/images/palliative.jpg',
    priceJMD: 8800,
    durationText: '75 mins visit',
    durationMinutes: 75,
    shortDescription: 'Comprehensive postpartum recovery exam, C-section incision review, newborn umbilical cord care, latching & breastfeeding support.',
    highlights: [
      'C-Section incision inspection & suture check',
      'Newborn umbilical cord care & jaundice check',
      'Latching coaching & breastmilk supply guidance',
      'Pediatric vitals & postpartum mental wellness'
    ]
  },
  {
    id: 'care-vitals',
    serviceId: 'srv-2',
    name: 'Elderly Vitals & Medication Management',
    category: 'elderly',
    categoryLabel: 'Senior Wellness',
    careLevelRequired: 'any',
    careLevelLabel: 'Clinical Nurse or Trained Aide',
    careLevelBadgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    pictureUrl: '/images/elderly_vitals.jpg',
    priceJMD: 6500,
    durationText: '45 mins visit',
    durationMinutes: 45,
    shortDescription: 'Comprehensive blood pressure, pulse, SpO2, blood glucose log, 7-day pill organizer setup, and senior safety wellness inspection.',
    highlights: [
      'Digital blood pressure, heart rate & pulse oximetry',
      'Fasting or post-meal blood glucose finger-prick',
      'Weekly pill organizer allocation & medication log',
      'Chronic hypertension & diabetes trends review'
    ],
    popular: true
  },
  {
    id: 'care-catheter',
    serviceId: 'srv-4',
    name: 'Catheter & Stoma Tube Maintenance',
    category: 'clinical',
    categoryLabel: 'Clinical Procedure',
    careLevelRequired: 'registered_nurse',
    careLevelLabel: 'NCJ Registered Clinical Nurse',
    careLevelBadgeColor: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
    pictureUrl: '/images/iv_therapy.jpg',
    priceJMD: 8200,
    durationText: '60 mins visit',
    durationMinutes: 60,
    shortDescription: 'Foley/Suprapubic catheter bag flush/replacement, colostomy care, peristomal skin cleansing, and infection prevention monitoring.',
    highlights: [
      'Sterile Foley or suprapubic tube replacement',
      'Saline bladder flush & drainage bag exchange',
      'Colostomy & stoma pouch hygiene & skin sealing',
      'Urinary tract infection (UTI) symptom screening'
    ]
  },
  {
    id: 'care-respite',
    serviceId: 'srv-9',
    name: 'Senior Respite Care (2-Hour Relief Block)',
    category: 'elderly',
    categoryLabel: 'Family Respite',
    careLevelRequired: 'geriatric_caregiver',
    careLevelLabel: 'Certified Geriatric Care Aide',
    careLevelBadgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    pictureUrl: '/images/senior_respite.jpg',
    priceJMD: 5800,
    durationText: '120 mins block (2 Hours)',
    durationMinutes: 120,
    shortDescription: 'Dedicated 2-hour family caregiver relief block: supervision, conversational companionship, cognitive games, light meal assistance, and personal care.',
    highlights: [
      '2 full hours of attentive in-home supervision',
      'Cognitive engagement, memory games & music',
      'Light meal preparation, snacks & hydration',
      'Peace of mind for family caregivers needing time off'
    ]
  },
  {
    id: 'care-mobility',
    serviceId: 'srv-10',
    name: 'Mobility & Assisted Transfer Support',
    category: 'elderly',
    categoryLabel: 'Physical Mobility',
    careLevelRequired: 'geriatric_caregiver',
    careLevelLabel: 'Minimal Rate Caregiver',
    careLevelBadgeColor: 'bg-teal-500/25 text-teal-200 border-teal-400/40',
    pictureUrl: '/images/mobility_hydration.jpg',
    priceJMD: 2800,
    durationText: '40 mins visit',
    durationMinutes: 40,
    shortDescription: 'Gentle assisted walking, wheelchair transfers, active range of motion exercise support, and in-home fall prevention hazard audit.',
    highlights: [
      'Safe bed-to-chair & wheelchair transfers',
      'Gentle assisted indoor or garden walking',
      'Gentle passive/active range of motion stretching',
      'Home environment slip-and-fall hazard check'
    ]
  },
  {
    id: 'care-palliative',
    serviceId: 'srv-6',
    name: 'Palliative & Comfort Care Nursing',
    category: 'specialized',
    categoryLabel: 'Specialized Comfort',
    careLevelRequired: 'registered_nurse',
    careLevelLabel: 'NCJ Clinical or Specialized Nurse',
    careLevelBadgeColor: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
    pictureUrl: '/images/palliative_comfort.jpg',
    priceJMD: 10500,
    durationText: '90 mins visit',
    durationMinutes: 90,
    shortDescription: 'Compassionate symptom management, positioning, pain protocol assistance, emotional support, and respite for family members.',
    highlights: [
      'Dignified and gentle patient repositioning',
      'Doctor-prescribed comfort & pain relief protocol',
      'Mouth care, gentle skin moisturizing & hygiene',
      'Empathetic presence and guidance for loved ones'
    ]
  }
];

interface BookCareShowcaseProps {
  services: ServiceItem[];
  onSelectCareService?: (service: ServiceItem) => void;
  onSelectService?: (service: ServiceItem) => void;
  onInstantDispatch?: () => void;
  onOpenTripleDailyModal?: () => void;
  onOpenSuggestionModal?: () => void;
  onOpenScopeModal?: () => void;
  onOpenMatcher?: () => void;
  onClose?: () => void;
}

export const BookCareShowcase: React.FC<BookCareShowcaseProps> = ({
  services,
  onSelectCareService,
  onSelectService,
  onInstantDispatch,
  onOpenTripleDailyModal,
  onOpenSuggestionModal,
  onOpenScopeModal,
  onOpenMatcher,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'elderly' | 'clinical' | 'maternal' | 'specialized'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCatalog = useMemo(() => {
    return CARE_TYPES_CATALOG.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = !searchTerm.trim() || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.highlights.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const handleChooseCare = (careItem: CareTypeCardData) => {
    soundFX.playCaregiverSelect();

    if (careItem.id === 'care-guardian-3x' && onOpenTripleDailyModal) {
      onOpenTripleDailyModal();
      return;
    }

    const matchedCategory: 'clinical' | 'elderly' | 'specialized' | 'wellness' = 
      careItem.category === 'maternal' ? 'specialized' : careItem.category;

    const matchedService: ServiceItem = services.find(s => s.id === careItem.serviceId || s.name.toLowerCase() === careItem.name.toLowerCase()) || {
      id: careItem.serviceId || `srv-${Date.now()}`,
      name: careItem.name,
      category: matchedCategory,
      description: careItem.shortDescription,
      durationMinutes: careItem.durationMinutes,
      priceJMD: careItem.priceJMD,
      careLevelRequired: careItem.careLevelRequired,
      careScopeSummary: careItem.careLevelLabel,
      icon: 'Heart',
      logoTheme: 'purple' as const,
      badgeLabel: careItem.categoryLabel
    };

    if (onSelectCareService) {
      onSelectCareService(matchedService);
    } else if (onSelectService) {
      onSelectService(matchedService);
    }
  };

  return (
    <div className="w-full bg-[#1E1B4B]/95 border-2 border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white animate-fadeIn">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-900/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              Book In-Home Care
            </span>
            <span className="text-xs text-blue-200/80 font-medium">
              Kingston · St. Andrew · Portmore · Spanish Town
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Verified, NCJ-licensed nurses delivered to your door in Kingston, Portmore &amp; Spanish Town.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Professional Jamaican healthcare delivered directly to your doorstep. Transparent rates, identity verified nurses, and NCJ clinical scope.
          </p>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSuggestionModal}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Help me choose the right caregiver tier"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Smart Care Matcher</span>
            <span className="sm:hidden">Matcher</span>
          </button>

          <button
            type="button"
            onClick={onOpenScopeModal}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Compare rates and NCJ regulations"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Compare Rates</span>
            <span className="sm:hidden">Rates</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close care options"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative z-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Care Types' },
            { id: 'elderly', label: 'Senior & Companionship (Minimal Rate)' },
            { id: 'clinical', label: 'Clinical & Wound (NCJ Registered)' },
            { id: 'maternal', label: 'Maternal & Newborn' },
            { id: 'specialized', label: 'Specialized & Palliative' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundFX.playTabSwitch();
                setActiveCategory(cat.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white shadow-md border border-purple-400/40'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[200px] sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search care types..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of Attractive Care Options with Real Pictures */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {filteredCatalog.map((careItem) => {
          const isGeriatric = careItem.careLevelRequired === 'geriatric_caregiver' || careItem.category === 'elderly';
          const isRN = careItem.careLevelRequired === 'registered_nurse';

          return (
            <div
              key={careItem.id}
              className="group rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/60 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-purple-950/40"
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={careItem.pictureUrl}
                    alt={careItem.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120520] via-black/40 to-transparent" />

                  {/* Badges on top of picture */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-sm ${careItem.careLevelBadgeColor}`}>
                      {careItem.careLevelLabel}
                    </span>

                    {careItem.packageNotice ? (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                        {careItem.packageNotice}
                      </span>
                    ) : careItem.popular ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-md">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  {/* Price & Duration Over Picture Bottom */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 text-[11px] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{careItem.durationText}</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[#1E1B4B]/90 backdrop-blur-md border border-blue-400/40 text-right">
                      <span className="text-[10px] text-blue-300 block uppercase font-bold leading-tight">Rate</span>
                      <strong className="text-sm sm:text-base font-black text-white font-mono leading-tight">
                        JMD ${careItem.priceJMD.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-blue-300 transition leading-snug">
                    {careItem.name}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {careItem.shortDescription}
                  </p>

                  {/* Highlights Checklist: Limited to 3 bullets on card */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 block">
                      What's Included:
                    </span>
                    {careItem.highlights.slice(0, 3).map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-[11px] text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChooseCare(careItem)}
                  className="flex-1 py-3 px-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] shadow-lg shadow-blue-950/60 border border-blue-400/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Select &amp; Schedule</span>
                  <ArrowRight className="w-4 h-4 text-white drop-shadow" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleChooseCare(careItem);
                    onInstantDispatch();
                  }}
                  className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white border border-amber-400/30 font-bold text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                  title="Dispatch practitioner immediately on-demand"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="hidden xs:inline">Instant</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All nurses &amp; caregivers are identity-verified, reference-checked, and insured under We Care Jamaica.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenScopeModal}
            className="text-purple-300 hover:text-white underline cursor-pointer font-semibold"
          >
            NCJ Regulations &amp; Scope
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onInstantDispatch}
            className="text-amber-300 hover:text-white font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 fill-amber-300" />
            <span>Need Immediate Dispatch?</span>
          </button>
        </div>
      </div>
    </div>
  );
};
