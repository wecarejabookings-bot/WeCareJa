import React, { useState, useRef, useEffect } from 'react';
import { ServiceItem, NurseProfile, LogoVariation } from '../../types';
import { HealthNewsFeed } from '../client/HealthNewsFeed';
import { Logo } from '../common/Logo';
import { ServiceLogo } from '../common/ServiceLogo';
import { INITIAL_STORE_PRODUCTS } from '../../services/storeProductsService';
import { 
  TopicDirectoryItem, 
  fetchTopicsDirectory, 
  getCachedTopics 
} from '../../services/topicsDirectoryService';
import { useCMS } from '../../services/cmsService';
import { 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Stethoscope, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  Star, 
  Gift, 
  Tag, 
  TrendingUp, 
  Users, 
  Lock, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Award, 
  Compass, 
  Activity, 
  ShieldAlert, 
  Copy, 
  Check, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Fingerprint,
  Crown,
  XCircle,
  Home,
  Scroll,
  ShoppingBag,
  Search,
  Layers,
  Ambulance,
  BadgeCheck,
  CheckCircle,
  Info
} from 'lucide-react';

interface AppLandingCoverProps {
  services: ServiceItem[];
  nurses: NurseProfile[];
  logoVariation: LogoVariation;
  onOpenSignIn: () => void;
  onOpenRegisterClient: () => void;
  onOpenRegisterNurse: () => void;
  onOpenLaunchKit: () => void;
  onOpenPanic: () => void;
  onOpenBiometricAuth?: () => void;
  onOpenStore?: () => void;
}

interface TopicItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description?: string;
  category: string;
  badgeColor: string;
  pictureUrl: string;
  fallbackUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

export const AppLandingCover: React.FC<AppLandingCoverProps> = ({
  services,
  nurses,
  logoVariation,
  onOpenSignIn,
  onOpenRegisterClient,
  onOpenRegisterNurse,
  onOpenLaunchKit,
  onOpenPanic,
  onOpenBiometricAuth,
  onOpenStore
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Track open topics - default opens the first topic "Exclusive Health Care Promotions & Advertisements"
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({
    'exclusive_promos': true,
    'hospital_vs_home': false,
    'clinical_services': false,
    'medical_store': false,
    'escrow_security': false,
    'jamaica_health_news': false,
    'emergency_119': false,
    'family_reviews': false,
    'how_it_works': false,
    'nurse_careers': false,
  });

  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }).catch(() => {});
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const toggleTopic = (topicId: string) => {
    setOpenTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const openAndScrollToTopic = (topicId: string) => {
    setOpenTopics(prev => ({
      ...prev,
      [topicId]: true
    }));
    setTimeout(() => {
      const el = topicRefs.current[topicId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    topics.forEach(t => { allOpen[t.id] = true; });
    setOpenTopics(allOpen);
  };

  const handleCollapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    topics.forEach(t => { allClosed[t.id] = false; });
    setOpenTopics(allClosed);
  };

  const formatJMD = (amount: number) => {
    return `JMD $${amount.toLocaleString()}`;
  };

  // Dynamic Topics Directory loaded from Supabase topics_directory table
  const [dynamicTopicsList, setDynamicTopicsList] = useState<TopicDirectoryItem[]>(() => {
    return getCachedTopics().filter(t => t.is_active);
  });

  useEffect(() => {
    let isMounted = true;
    const loadTopics = async () => {
      const fetched = await fetchTopicsDirectory();
      if (isMounted && fetched && fetched.length > 0) {
        setDynamicTopicsList(fetched);
      }
    };
    loadTopics();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setDynamicTopicsList(e.detail.filter((t: TopicDirectoryItem) => t.is_active));
      } else {
        loadTopics();
      }
    };

    window.addEventListener('wecare:topics_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('wecare:topics_updated', handleUpdate);
    };
  }, []);

  const getTopicIcon = (category: string, id: string) => {
    const cat = (category || '').toLowerCase();
    if (id === 'exclusive_promos' || cat.includes('deal') || cat.includes('promo')) return Tag;
    if (id === 'hospital_vs_home') return Zap;
    if (id === 'clinical_services' || cat.includes('procedure') || cat.includes('care')) return Activity;
    if (id === 'medical_store' || cat.includes('store') || cat.includes('suppli') || cat.includes('equip')) return ShoppingBag;
    if (id === 'escrow_security' || cat.includes('escrow') || cat.includes('safet')) return ShieldCheck;
    if (id === 'jamaica_health_news' || cat.includes('news') || cat.includes('health') || cat.includes('mohw')) return Heart;
    if (id === 'emergency_119' || cat.includes('emergency') || cat.includes('sos')) return Ambulance;
    if (id === 'family_reviews' || cat.includes('review') || cat.includes('trust') || cat.includes('star')) return Star;
    if (id === 'how_it_works' || cat.includes('how')) return Compass;
    if (id === 'nurse_careers' || cat.includes('career') || cat.includes('earning') || cat.includes('nurse')) return Stethoscope;
    return Sparkles;
  };

  // Convert TopicDirectoryItem to TopicItem for rendering
  const topics: TopicItem[] = dynamicTopicsList.map(t => ({
    id: t.id,
    number: (t.card_number || '').replace(/^#/, '') || '00',
    title: t.title,
    subtitle: t.subtitle,
    description: t.description,
    category: t.category,
    badgeColor: t.badge_color || 'from-blue-600 to-indigo-600 text-white',
    pictureUrl: t.image_url,
    fallbackUrl: t.fallback_url || t.image_url || '/images/wound_dressing.webp',
    icon: getTopicIcon(t.category, t.id),
    tags: Array.isArray(t.tags) ? t.tags : []
  }));

  // Filtering topics based on search and category
  const filteredTopics = topics.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const catLower = (t.category || '').toLowerCase();
    const matchesCategory = 
      activeCategoryFilter === 'all' || 
      (activeCategoryFilter === 'deals' && (t.id === 'exclusive_promos' || catLower.includes('deal') || catLower.includes('promo'))) ||
      (activeCategoryFilter === 'care' && (t.id === 'hospital_vs_home' || t.id === 'clinical_services' || catLower.includes('care') || catLower.includes('procedure'))) ||
      (activeCategoryFilter === 'store' && (t.id === 'medical_store' || catLower.includes('store') || catLower.includes('suppli') || catLower.includes('equip'))) ||
      (activeCategoryFilter === 'safety' && (t.id === 'escrow_security' || t.id === 'emergency_119' || catLower.includes('safet') || catLower.includes('escrow') || catLower.includes('emergency'))) ||
      (activeCategoryFilter === 'news' && (t.id === 'jamaica_health_news' || catLower.includes('news') || catLower.includes('health'))) ||
      (activeCategoryFilter === 'careers' && (t.id === 'nurse_careers' || catLower.includes('career') || catLower.includes('nurse') || catLower.includes('earning')));

    return matchesSearch && matchesCategory;
  });

  const featuredStoreProducts = INITIAL_STORE_PRODUCTS.slice(0, 6);

  const heroBadge = useCMS('homepage_hero_badge', "Jamaica's #1 On-Demand Healthcare Network");
  const heroTitle = useCMS('homepage_hero_title', "Hospital-Grade Nursing Care, Delivered Right to Your Door.");
  const heroSubtitle = useCMS('homepage_hero_subtitle', "Book verified registered nurses for post-op recovery, elderly care, sterile wound dressings, IV therapy, and vital checks without the stress of crowded clinics.");

  return (
    <div className="space-y-10 pb-16 animate-fadeIn">
      {/* 1. TOP HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0A192F] border-2 border-blue-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Brand & Region Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{heroBadge}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Kingston • St. Andrew • Portmore • Spanish Town</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Escrow Fund Protection</span>
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {heroTitle}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onOpenSignIn}
              className="px-6 py-3.5 rounded-2xl bg-[#3B82F6] hover:bg-blue-600 text-white font-extrabold text-sm shadow-xl shadow-blue-950/60 transition flex items-center gap-2 group hover:scale-[1.02] cursor-pointer"
            >
              <span>Sign In to Access Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {onOpenBiometricAuth && (
              <button
                type="button"
                onClick={onOpenBiometricAuth}
                className="px-5 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-extrabold text-sm border border-emerald-500/40 shadow-lg transition flex items-center gap-2 cursor-pointer group"
                title="Sign in with Touch ID, Face ID, or Windows Hello"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Biometric Sign-In</span>
              </button>
            )}
            <button
              onClick={onOpenRegisterClient}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>Create Client Account</span>
            </button>
            <button
              onClick={onOpenRegisterNurse}
              className="px-5 py-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-white font-bold text-sm border border-blue-400/40 transition flex items-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Join as Nurse / Caregiver (Top Earnings)</span>
            </button>
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition flex items-center gap-2 cursor-pointer group"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Shop Medical Supplies (/store)</span>
              </button>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">NCJ Licensed Nurses</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">1,420+</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Visits Completed</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block">4.9 ★</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Patient Rating</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 block">15-30m</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Proximity ETA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VISUAL TOPIC DIRECTORY INTRO & CONTROLS (OPTIMIZED FOR NON-READERS) */}
      <section className="space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black/60 border border-blue-500/30 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Interactive Topics Directory
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">Picture-first visual guide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Everything You Can Do on WeCare Jamaica
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Click any topic card below to open its full section with pictures, pricing, discounts, and one-click actions.
              </p>
            </div>

            {/* Quick action controls: Expand All / Collapse All */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExpandAll}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                title="Expand all topic dropdowns"
              >
                <ChevronDown className="w-4 h-4 text-emerald-400" />
                <span>Open All ({topics.length})</span>
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                title="Collapse all topic dropdowns"
              >
                <ChevronUp className="w-4 h-4 text-amber-400" />
                <span>Close All</span>
              </button>
            </div>
          </div>

          {/* Quick Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-white/10 pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Categories:
            </span>
            {[
              { id: 'all', label: 'All 10 Topics' },
              { id: 'deals', label: '🏷️ Deals & Promos' },
              { id: 'care', label: '🩺 Nursing & Care' },
              { id: 'store', label: '🛍️ Medical Supplies' },
              { id: 'safety', label: '🛡️ Escrow & Safety' },
              { id: 'news', label: '📰 Jamaica News' },
              { id: 'careers', label: '👩‍⚕️ Nurse Careers' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Filter for Instant Finding */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics by name, service or feature (e.g. Promotions, Hospital, Wound Care, Equipment)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-400 transition"
            />
          </div>
        </div>

        {/* 2B. VISUAL PICTURE TILES (PICTURE-FIRST SHORTCUTS FOR NON-READERS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {topics.map(t => {
            const isOpen = !!openTopics[t.id];
            return (
              <button
                key={`tile-${t.id}`}
                onClick={() => openAndScrollToTopic(t.id)}
                className={`p-3 rounded-2xl border text-left transition group cursor-pointer flex flex-col justify-between h-full relative overflow-hidden ${
                  isOpen
                    ? 'bg-blue-900/40 border-blue-400 shadow-lg shadow-blue-950/60 ring-2 ring-blue-500/30'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                    <img
                      src={t.pictureUrl}
                      alt={t.title}
                      loading="lazy"
                      decoding="async"
                      width={280}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = t.fallbackUrl;
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-black text-white">
                      #{t.number}
                    </div>
                    {isOpen && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-blue-600 text-[9px] font-black text-white uppercase flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Open
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-white line-clamp-2 leading-snug group-hover:text-blue-300 transition">
                    {t.title}
                  </h4>
                </div>
                <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-blue-300">{t.category}</span>
                  <span className="text-amber-400 font-bold">{isOpen ? '▲ Viewing' : '▼ Click'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CLICKABLE TOPIC ACCORDION DIRECTORY (PICTURE BESIDE EVERY TOPIC) */}
      <section className="space-y-6">
        {filteredTopics.map((topic) => {
          const isOpen = !!openTopics[topic.id];
          const Icon = topic.icon;

          return (
            <div
              key={topic.id}
              ref={(el) => { topicRefs.current[topic.id] = el; }}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-xl ${
                isOpen
                  ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-black/90 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-white/[0.03] border-white/10 hover:border-blue-400/40 hover:bg-white/[0.05]'
              }`}
            >
              {/* CLICKABLE TOPIC HEADER WITH PROMINENT PICTURE BESIDE IT */}
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="w-full p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left transition cursor-pointer select-none group"
                aria-expanded={isOpen}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* PROMINENT PICTURE BESIDE TOPIC TITLE */}
                  <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 group-hover:border-blue-400 transition">
                    <img
                      src={topic.pictureUrl}
                      alt={topic.title}
                      loading="lazy"
                      decoding="async"
                      width={112}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = topic.fallbackUrl;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] font-black text-white">
                      #{topic.number}
                    </span>
                  </div>

                  {/* TOPIC TEXT, BADGES & HIGHLIGHTS */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${topic.badgeColor}`}>
                        {topic.category}
                      </span>
                      <span className="text-[11px] text-blue-300 font-bold hidden sm:inline flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5" />
                        <span>Interactive Section</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-blue-300 transition leading-tight">
                      {topic.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {topic.subtitle}
                    </p>

                    {/* Quick Tags visible even before expanding */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {topic.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-medium text-slate-300 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DROP DOWN EXPAND/COLLAPSE ACTION INDICATOR */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-black text-white block">
                      {isOpen ? 'Click to Collapse' : 'Click to View Everything'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isOpen ? 'Hide section' : 'Show pictures & details'}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isOpen 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 rotate-180' 
                      : 'bg-white/10 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* DROPDOWN EXPANDED CONTENT AREA */}
              {isOpen && (
                <div className="p-4 sm:p-8 border-t border-white/10 space-y-8 animate-fadeIn bg-black/40">
                  {/* TOPIC 1: EXCLUSIVE HEALTH CARE PROMOTIONS & ADVERTISEMENTS */}
                  {topic.id === 'exclusive_promos' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Active Promotional Deals for Kingston, St. Andrew & St. Catherine</h4>
                            <p className="text-xs text-amber-200/80">Copy any promo code below to apply discount during sign up or visit scheduling.</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider self-start sm:self-auto">
                          Valid for 2026
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Promo Card 1: First Visit Voucher */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-black/50 border border-purple-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-400 transition shadow-lg">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase">
                                First Visit Voucher
                              </span>
                              <span className="text-xs font-black text-emerald-400">Save JMD $500</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">
                              Welcome to WeCare Jamaica
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                              Get JMD $500 off your family's first in-home clinical visit, wound dressing, or comprehensive vital check in Kingston & St. Andrew.
                            </p>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between mb-4">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Promo Voucher Code</span>
                                <span className="text-sm font-black text-white font-mono tracking-wider">WECARE2026</span>
                              </div>
                              <button
                                onClick={() => handleCopyPromo('WECARE2026')}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 transition cursor-pointer"
                                title="Copy code"
                              >
                                {copiedCode === 'WECARE2026' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={onOpenRegisterClient}
                            className="w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>Claim Voucher & Sign Up</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Promo Card 2: 3x Daily Guardian Care */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-purple-950/20 to-black/50 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition shadow-lg">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase">
                                3x Daily Elderly Care
                              </span>
                              <span className="text-xs font-black text-emerald-400">Triple Daily Visits</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition">
                              3x Daily Practitioner Guardian Care
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                              Designed for elderly family members left alone during the day: morning vitals & breakfast/meds (8am), afternoon nutrition & mobility assist (1pm), and evening dinner/bedtime safety audit (6pm).
                            </p>
                            <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Morning 8 AM: Awakening, BP check & morning meds</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Afternoon 1 PM: Nutrition, hydration & mobility support</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Evening 6 PM: Dinner check, night meds & secure tuck-in</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={onOpenSignIn}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>Sign In to Book Package</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Promo Card 3: Sterile Wound Care Recovery */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-purple-950/20 to-black/50 border border-red-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-red-400 transition shadow-lg">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-500/30 text-red-200 border border-red-400/40 uppercase">
                                Post-Surgical Recovery
                              </span>
                              <span className="text-xs font-black text-red-300">Fast 30m Dispatch</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-red-300 transition">
                              Sterile Wound Dressing & Suture Care
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                              Direct post-discharge support following surgeries at KPH, UHWI, St. Joseph's, or Andrews Memorial. Sterile dressing changes by senior clinical nurses.
                            </p>
                            <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span>Infection prevention & wound stage tracking</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span>Physician-ordered pain medication admin</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={onOpenRegisterClient}
                            className="w-full py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <span>Create Account to Schedule</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 2: SKIP HOSPITAL WAITING — COMFORT ON YOUR SOFA */}
                  {topic.id === 'hospital_vs_home' && (
                    <div className="space-y-6">
                      <div className="text-center max-w-3xl mx-auto space-y-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                          Jamaica Healthcare Revolution
                        </span>
                        <h4 className="text-2xl sm:text-3xl font-black text-white">
                          Why Spend 8 Hours on a Hospital Bench When a Verified Nurse Comes to You?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300">
                          Skip the crowded Kingston Public or Spanish Town Hospital outpatient triage. Experience VIP clinical care, wound dressing, vital checks, and elder therapy right on your own sofa.
                        </p>
                      </div>

                      {/* Side-by-side comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Old Way: The Public Hospital Waiting Room */}
                        <div className="p-6 rounded-3xl bg-black/50 border border-rose-500/30 space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/20">
                              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider">The Old Way</span>
                                <h5 className="text-base font-bold text-white">Public Hospital Outpatient</h5>
                              </div>
                            </div>
                            <ul className="space-y-3 mt-4 text-xs text-slate-300">
                              <li className="flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span><strong>6 to 10 Hour Wait:</strong> Sitting on hard metal chairs in noisy, overcrowded triage corridors.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span><strong>Infection Exposure:</strong> Breathing shared hospital air alongside airborne colds, flu, and infections.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span><strong>Traffic & Transport Stress:</strong> Expensive taxi fares and gridlock across Kingston, Portmore or Spanish Town.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span><strong>Overworked Staff:</strong> Nurses juggling 30 patients at once with hurried, impersonal interactions.</span>
                              </li>
                            </ul>
                          </div>
                          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-center">
                            <span className="text-xs text-rose-300 font-bold">Avg. Time Wasted: 7.5 Hours per visit</span>
                          </div>
                        </div>

                        {/* New Way: WeCare In-Home Experience */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/60 to-purple-950/60 border-2 border-emerald-500/50 space-y-4 flex flex-col justify-between shadow-xl">
                          <div>
                            <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-500/20">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Home className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">The WeCare Way</span>
                                <h5 className="text-base font-bold text-white">VIP In-Home Nursing Care</h5>
                              </div>
                            </div>
                            <ul className="space-y-3 mt-4 text-xs text-slate-200">
                              <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span><strong>Zero Minute Wait:</strong> Relax comfortably in your bed or sofa with favorite Jamaican teas and TV.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span><strong>100% Contagion Free:</strong> Clean, sterile care in your private home with zero exposure to clinic germs.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span><strong>15-30m Rapid Arrival:</strong> Our GPS proximity engine matches the registered nurse closest to your gate.</span>
                              </li>
                              <li className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span><strong>1-on-1 Dedicated Attention:</strong> Compassionate, unrushed clinical care with electronic vital notes sent to your family.</span>
                              </li>
                            </ul>
                          </div>
                          <button
                            onClick={onOpenRegisterClient}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                          >
                            <span>Switch to Home Care — Create Free Account</span>
                            <ArrowRight className="w-4 h-4 text-slate-950" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 3: IN-HOME CLINICAL NURSING PROCEDURES & RATES */}
                  {topic.id === 'clinical_services' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-white">Full List of Available In-Home Procedures</h4>
                          <p className="text-xs text-slate-300">All visits are administered by registered Jamaican practitioners with sterile supplies.</p>
                        </div>
                        <button
                          onClick={onOpenSignIn}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Sign In to Book Any Service</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(services || []).slice(0, 9).map(service => (
                          <div
                            key={service.id}
                            onClick={onOpenSignIn}
                            className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-400/50 hover:bg-white/[0.07] transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3 mb-2.5">
                                <ServiceLogo service={service} size="sm" showBadge={true} withGlow={true} />
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                                    {service.category}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-400" />
                                    {service.durationMinutes}m
                                  </span>
                                </div>
                              </div>
                              <h5 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                                {service.name}
                              </h5>
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                                {service.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-black text-blue-300">{formatJMD(service.priceJMD)}</span>
                                <span className="text-[10px] text-slate-400 block">100% Escrow Safe</span>
                              </div>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-xl bg-blue-600/30 group-hover:bg-[#3B82F6] text-white text-xs font-bold transition flex items-center gap-1"
                              >
                                <span>Book Visit</span>
                                <Lock className="w-3 h-3 text-blue-200" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPIC 4: MEDICAL SUPPLIES & HOME HEALTHCARE EQUIPMENT STORE */}
                  {topic.id === 'medical_store' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">WeCare Online Medical Store & Equipment Delivery</h4>
                            <p className="text-xs text-emerald-200/80">Order directly for same-day delivery to your home in Kingston, St. Andrew or St. Catherine.</p>
                          </div>
                        </div>
                        {onOpenStore && (
                          <button
                            onClick={onOpenStore}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 text-xs font-black transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                          >
                            <span>Open Full Store (/store)</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {featuredStoreProducts.map(prod => (
                          <div
                            key={prod.id}
                            onClick={onOpenStore || onOpenSignIn}
                            className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.08] transition cursor-pointer flex flex-col justify-between group"
                          >
                            <div className="space-y-2">
                              <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                                <img
                                  src={prod.image_url}
                                  alt={prod.name}
                                  loading="lazy"
                                  decoding="async"
                                  width={200}
                                  height={96}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500';
                                  }}
                                />
                                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-600/90 text-[9px] font-black text-white">
                                  In Stock
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition">
                                {prod.name}
                              </h5>
                              <span className="text-[10px] text-slate-400 block line-clamp-1">
                                {prod.category}
                              </span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-400">{formatJMD(prod.price_jmd)}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPIC 5: 100% ESCROW PROTECTION & SAFETY GUARANTEES */}
                  {topic.id === 'escrow_security' && (
                    <div className="space-y-6">
                      <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 uppercase tracking-wider">
                          Why WeCare Jamaica
                        </span>
                        <h4 className="text-2xl font-black text-white">
                          The Safe, Dignified & Modern Way to Receive Healthcare
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300">
                          Built specifically for Jamaican patients, families, and healthcare professionals.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">100% NCJ-Verified Nurses</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Every practitioner holds an active license with the Nursing Council of Jamaica. We verify government photo IDs, TRNs, and background credentials before onboarding.
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                            <Compass className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">Live Real-Time GPS Proximity</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Our smart proximity engine detects the nearest available registered nurse across Kingston, St. Andrew, Portmore, and Spanish Town to ensure rapid dispatch in 15-30m.
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#F59E0B]">
                            <Lock className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">100% Escrow Payment Safety</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Your payment is securely held in escrow and is only released to the nurse after clinical care has been completed to your satisfaction. Transparent JMD receipts and no hidden charges.
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                            <Activity className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">Electronic Health Records</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Every visit generates detailed vital charts (BP, Pulse, Blood Sugar, SpO2) and clinical progress notes that you can download or share directly with your private physician.
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">119 Emergency Direct Speed Dial</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Equipped with instant 119 emergency speed dialing, GPS beacon broadcast, and rapid medical escalation protocols in case of critical patient decompensation.
                          </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition space-y-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <h5 className="text-sm font-bold text-white">Guaranteed Practitioner Remuneration</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            We empower Jamaican nurses with guaranteed escrow payouts, direct local bank deposits (NCB, BNS, JN, Sagicor), and full clinical independence with flexible scheduling.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 6: OFFICIAL JAMAICA HEALTH NEWS & MINISTRY ADVISORIES (MOHW) */}
                  {topic.id === 'jamaica_health_news' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                              <Heart className="w-3 h-3 text-[#F59E0B]" /> MOHW Verified Bulletins
                            </span>
                            <span className="text-xs text-slate-400">Public Health Surveillance & Community Advisories</span>
                          </div>
                          <h4 className="text-xl font-black text-white mt-1">Jamaica Health News & Guidance</h4>
                        </div>
                        <span className="text-xs text-slate-400">Official Ministry guidelines accessible to all visitors</span>
                      </div>
                      
                      <HealthNewsFeed onBookService={() => onOpenSignIn()} />
                    </div>
                  )}

                  {/* TOPIC 7: 119 EMERGENCY SPEED DIAL & INSTANT MEDICAL SOS BEACON */}
                  {topic.id === 'emergency_119' && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-black to-red-950/60 border-2 border-red-500/40 text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-900/50">
                          <Ambulance className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl sm:text-2xl font-black text-white">Emergency 119 Speed Dial & Critical Escalation</h4>
                          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                            For severe life-threatening emergencies, dial 119 or 110 immediately. WeCare provides direct beacon alerts to emergency contacts.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <a
                            href="tel:119"
                            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-xl shadow-red-950/80 transition flex items-center gap-2 cursor-pointer"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>Dial Jamaica Emergency 119</span>
                          </a>
                          <button
                            onClick={onOpenPanic}
                            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4 text-slate-950" />
                            <span>Activate WeCare SOS Panic Beacon</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                          <span className="font-bold text-red-400 block uppercase">Police Emergency</span>
                          <span className="text-lg font-black text-white">119</span>
                          <p className="text-slate-400">Toll-free emergency dispatch Jamaica-wide</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                          <span className="font-bold text-amber-400 block uppercase">Fire & Ambulance</span>
                          <span className="text-lg font-black text-white">110</span>
                          <p className="text-slate-400">Emergency medical transport & rescue</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                          <span className="font-bold text-blue-400 block uppercase">Kingston Public Hospital</span>
                          <span className="text-lg font-black text-white">(876) 922-0210</span>
                          <p className="text-slate-400">Main public trauma & referral hospital</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 8: VERIFIED JAMAICAN PATIENT & FAMILY STORIES */}
                  {topic.id === 'family_reviews' && (
                    <div className="space-y-6">
                      <div className="text-center max-w-2xl mx-auto space-y-1">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          Verified Stories
                        </span>
                        <h4 className="text-2xl font-black text-white">What Jamaican Families Say</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "The visiting nurse arrived in New Kingston within 20 minutes for my father's post-catheter care. The professional dignity and clinical competence was outstanding."
                          </p>
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <strong className="text-white">Davina Morrison</strong>
                            <span className="text-purple-300">Kingston 6</span>
                          </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "I was discharged from UHWI after knee replacement surgery. Having a verified NCJ nurse do my daily sterile dressings at home saved us hours of transport stress."
                          </p>
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <strong className="text-white">Marcus Sterling</strong>
                            <span className="text-purple-300">Portmore Pines</span>
                          </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "As an NCJ licensed nurse with 9 years experience, WeCare allows me to practice with guaranteed escrow payouts and directly support families in St. Catherine."
                          </p>
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <strong className="text-white">Nurse Kadian P., RN</strong>
                            <span className="text-emerald-400">Spanish Town</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 9: HOW WECARE WORKS (SIMPLE 3-STEP VISUAL GUIDE) */}
                  {topic.id === 'how_it_works' && (
                    <div className="space-y-6">
                      <div className="text-center max-w-xl mx-auto space-y-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                          Simple 3-Step Process
                        </span>
                        <h4 className="text-2xl font-black text-white">How Getting Home Care Works</h4>
                        <p className="text-xs text-slate-300">No complicated forms. Book care in under 60 seconds.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 relative overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-black text-base">
                            1
                          </div>
                          <h5 className="text-base font-bold text-white">Select Your Care</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Pick wound dressing, elderly check, vital monitoring, IV therapy, or order home medical equipment. Choose your date & preferred time.
                          </p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 relative overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-black text-base">
                            2
                          </div>
                          <h5 className="text-base font-bold text-white">Nearest Nurse Dispatched</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Our live proximity engine alerts the closest NCJ-verified nurse in Kingston, St. Andrew or St. Catherine. Typical ETA is 15–30 minutes.
                          </p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 relative overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-black text-base">
                            3
                          </div>
                          <h5 className="text-base font-bold text-white">Safe Escrow Approval</h5>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Your payment is held safely in escrow. Once clinical care is delivered and you sign off, funds are released. You receive full EHR vital notes.
                          </p>
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <button
                          onClick={onOpenLaunchKit}
                          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Compass className="w-4 h-4" />
                          <span>Launch Interactive Quick Guide</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TOPIC 10: JOIN AS A REGISTERED NURSE OR CAREGIVER */}
                  {topic.id === 'nurse_careers' && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/60 border-2 border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                            For Jamaican Nurses & Caregivers
                          </span>
                          <h4 className="text-2xl font-black text-white">
                            Practice with Dignity, Flexibility & Highest Earnings
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            Earn up to 85% of each visit with guaranteed escrow security. Weekly direct deposits to your Jamaican bank account (NCB, BNS, JN, Sagicor).
                          </p>
                        </div>

                        <button
                          onClick={onOpenRegisterNurse}
                          className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <Stethoscope className="w-4 h-4 text-slate-950" />
                          <span>Start 5-Step Nurse Registration</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                          <span className="font-bold text-emerald-400 block">1. Active NCJ License</span>
                          <p className="text-slate-400">RN, Midwife or Certified Practical Nurse</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                          <span className="font-bold text-emerald-400 block">2. TRN & Gov ID</span>
                          <p className="text-slate-400">Driver's License or National Passport</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                          <span className="font-bold text-emerald-400 block">3. Police Record</span>
                          <p className="text-slate-400">Clean background check compliance</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                          <span className="font-bold text-emerald-400 block">4. Local Bank Payout</span>
                          <p className="text-slate-400">Weekly direct deposit to NCB / BNS</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC / CUSTOM TOPIC DETAIL CARD FOR ADMIN ADDED TOPICS */}
                  {!['exclusive_promos', 'hospital_vs_home', 'clinical_services', 'medical_store', 'escrow_security', 'jamaica_health_news', 'emergency_119', 'family_reviews', 'how_it_works', 'nurse_careers'].includes(topic.id) && (
                    <div className="space-y-6">
                      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${topic.badgeColor}`}>
                              {topic.category}
                            </span>
                            <h4 className="text-xl sm:text-2xl font-black text-white">{topic.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                              {topic.description || topic.subtitle}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={onOpenRegisterClient}
                              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition cursor-pointer"
                            >
                              Book Care Now
                            </button>
                            <button
                              onClick={onOpenStore || onOpenSignIn}
                              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition cursor-pointer"
                            >
                              Explore More
                            </button>
                          </div>
                        </div>

                        {/* Image Showcase */}
                        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/15 bg-slate-950">
                          <img
                            src={topic.pictureUrl}
                            alt={topic.title}
                            loading="lazy"
                            decoding="async"
                            width={768}
                            height={288}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = topic.fallbackUrl;
                            }}
                          />
                        </div>

                        {/* Tags */}
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {topic.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
                                ✓ {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 4. BOTTOM CALL TO ACTION BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-blue-500/30 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-[#3B82F6] flex items-center justify-center text-white mx-auto shadow-xl">
          <Heart className="w-8 h-8" />
        </div>
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Experience Compassionate Care at Home?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create your account today or sign in to connect with licensed Jamaican nurses in your neighborhood.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onOpenSignIn}
            className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-blue-700" />
            <span>Sign In to Your Account</span>
          </button>
          <button
            onClick={onOpenRegisterClient}
            className="px-6 py-3.5 rounded-2xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Create New Client Account</span>
          </button>
          <button
            onClick={onOpenRegisterNurse}
            className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>Register as Nurse / Caregiver</span>
          </button>
        </div>
      </section>
    </div>
  );
};
