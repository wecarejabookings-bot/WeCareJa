import React, { useState } from 'react';
import { ServiceItem, NurseProfile, LogoVariation } from '../../types';
import { HealthNewsFeed } from '../client/HealthNewsFeed';
import { Logo } from '../common/Logo';
import { ServiceLogo } from '../common/ServiceLogo';
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
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'hospital_vs_home' | 'ads_promos' | 'health_news' | 'benefits' | 'services'>('overview');

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const approvedNurses = nurses.filter(n => n.status === 'approved');

  const formatJMD = (amount: number) => {
    return `JMD $${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* 1. HERO COVER BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-blue-500/25 p-6 sm:p-10 lg:p-14 shadow-2xl text-white">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#F59E0B]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600/30 text-blue-200 border border-blue-400/40 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NCJ Licensed Registered Nurses Only</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
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
              Hospital-Grade Nursing Care, <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-400 bg-clip-text text-transparent">
                Delivered Right to Your Door.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Jamaica's premier on-demand home healthcare network. Book verified registered nurses for post-op recovery, elderly care, wound dressings, IV therapy, and vital checks without the stress of crowded clinics.
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
              className="px-5 py-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-white font-bold text-sm border border-blue-400/40 transition flex items-center gap-2"
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

          {/* Quick Notice Banner for Unauthenticated Visitors */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md flex items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-blue-300 shrink-0" />
              <span>
                <strong>Cover Preview Mode:</strong> Sign in or sign up to schedule visits, consult active nurses, and access patient health records.
              </span>
            </div>
            <button
              onClick={onOpenSignIn}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-bold text-xs border border-blue-400/30 transition shrink-0"
            >
              Sign In Now
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">NCJ Licensed</span>
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

      {/* 2. NAVIGATION BAR ACROSS COVER SECTIONS */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: 'Cover Overview', icon: Sparkles },
            { id: 'hospital_vs_home', label: 'Skip Hospital Waiting', icon: Zap },
            { id: 'ads_promos', label: 'Promotions & Health Deals', icon: Tag },
            { id: 'benefits', label: 'Why Choose WeCare', icon: ShieldCheck },
            { id: 'services', label: 'Services & Rates', icon: Activity },
            { id: 'health_news', label: 'Jamaica Health News (MOHW)', icon: Heart }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-950/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSignIn}
            className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-bold text-xs border border-blue-400/30 transition"
          >
            Sign In
          </button>
          <button
            onClick={onOpenRegisterClient}
            className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* 3. SECTION: PROMOTIONS, PACKAGES & ADVERTISEMENTS */}
      {(activeTab === 'overview' || activeTab === 'ads_promos') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Special Featured Deals
                </span>
                <span className="text-xs text-purple-300 font-semibold">Valid across Kingston, St. Andrew &amp; St. Catherine</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Exclusive Health Care Promotions &amp; Advertisements</h2>
            </div>
            <span className="text-xs text-slate-400">Sign up today to redeem promotional vouchers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Promo Card 1 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-black/50 border border-purple-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-400 transition">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase">
                    First Visit Voucher
                  </span>
                  <span className="text-xs font-black text-emerald-400">Save JMD $500</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">
                  Welcome to WeCare Jamaica
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Get JMD $500 off your family's first in-home clinical visit, wound dressing, or comprehensive vital check in Kingston &amp; St. Andrew.
                </p>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Promo Voucher Code</span>
                    <span className="text-sm font-black text-white font-mono tracking-wider">WECARE2026</span>
                  </div>
                  <button
                    onClick={() => handleCopyPromo('WECARE2026')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 transition"
                    title="Copy code"
                  >
                    {copiedCode === 'WECARE2026' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onOpenRegisterClient}
                className="w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Claim Voucher &amp; Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Promo Card 2 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-purple-950/20 to-black/50 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase">
                    3x Daily Elderly Care
                  </span>
                  <span className="text-xs font-black text-emerald-400">Triple Daily Visits</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition">
                  3x Daily Practitioner Guardian Care (Morning, Afternoon &amp; Evening)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Designed for elderly family members left alone during the day: morning vitals &amp; breakfast/meds (8am), afternoon nutrition &amp; mobility assist (1pm), and evening dinner/bedtime safety audit (6pm).
                </p>

                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Morning 8 AM: Awakening, BP check &amp; morning meds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Afternoon 1 PM: Nutrition, hydration &amp; mobility support</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Evening 6 PM: Dinner check, night meds &amp; secure tuck-in</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenSignIn}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Sign In to Book Package</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Promo Card 3 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/40 via-purple-950/20 to-black/50 border border-red-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-red-400 transition">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-500/30 text-red-200 border border-red-400/40 uppercase">
                    Post-Surgical Recovery
                  </span>
                  <span className="text-xs font-black text-red-300">Fast 30m Dispatch</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-300 transition">
                  Sterile Wound Dressing &amp; Suture Care
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Direct post-discharge support following surgeries at KPH, UHWI, St. Joseph's, or Andrews Memorial. Sterile dressing changes by senior clinical nurses.
                </p>

                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Infection prevention &amp; wound stage tracking</span>
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
        </section>
      )}

      {/* 3B. SECTION: WHY WAIT IN THE HOSPITAL? (IRRESISTIBLE HOME CARE EXPERIENCE) */}
      {(activeTab === 'overview' || activeTab === 'hospital_vs_home') && (
        <section className="space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/80 border-2 border-purple-500/40 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/30 to-purple-500/30 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Jamaica Healthcare Revolution</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Why Spend 8 Hours on a Hospital Bench When a Verified Nurse Comes to You?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                Skip the crowded Kingston Public or Spanish Town Hospital outpatient triage. Experience VIP clinical care, wound dressing, vital checks, and elder therapy right on your own sofa.
              </p>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              {/* Old Way: The Public Hospital Waiting Room */}
              <div className="p-6 rounded-3xl bg-black/40 border border-rose-500/30 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/20">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider">The Old Way</span>
                      <h4 className="text-base font-bold text-white">Public Hospital Outpatient</h4>
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
                      <span><strong>Traffic &amp; Transport Stress:</strong> Expensive taxi fares and gridlock across Kingston, Portmore or Spanish Town.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span><strong>Impersonal &amp; Rushed:</strong> Overburdened nurses with barely 2 minutes to explain your condition.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-center text-xs text-rose-300 font-semibold">
                  Exhausting, stressful &amp; painful when you are already feeling sick.
                </div>
              </div>

              {/* New Way: WeCare Doorstep Clinical Service */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-purple-950/30 to-black/60 border-2 border-emerald-500/40 space-y-4 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">The WeCare Experience</span>
                        <h4 className="text-base font-bold text-white">VIP In-Home Clinical Care</h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/40">
                      Voucher Valid
                    </span>
                  </div>

                  <ul className="space-y-3 mt-4 text-xs text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Front Door Arrival in 15–30 Mins:</strong> Relax in bed or your recliner with tea while a nurse travels to you.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>100% Private &amp; Clean:</strong> Zero germ contamination; dignified one-on-one undivided clinical attention.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Nursing Council Verified:</strong> Every nurse is licensed by the NCJ with verified background clearances.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Escrow Protected:</strong> You inspect the care first. Payment only releases upon your satisfactory sign-off.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-emerald-300 uppercase font-black block">First-Time User Special</span>
                    <strong className="text-white text-xs">JMD $500 Off First Visit with code WECARE2026</strong>
                  </div>
                  <button
                    onClick={onOpenRegisterClient}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Try It Today</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. SECTION: CORE BENEFITS OF USING WECARE */}
      {(activeTab === 'overview' || activeTab === 'benefits') && (
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 uppercase tracking-wider">
              Why WeCare Jamaica
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Safe, Dignified &amp; Modern Way to Receive Healthcare
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Built specifically for Jamaican patients, families, and healthcare professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Benefit 1 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">100% NCJ-Verified Nurses</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every practitioner on WeCare holds an active, legally verified license with the Nursing Council of Jamaica. We verify government photo IDs, TRNs, and background credentials before onboarding.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Live Real-Time GPS Proximity</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our smart proximity engine detects the nearest available registered nurse across Kingston, St. Andrew, Portmore, and Spanish Town to ensure rapid dispatch and accurate transit times.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#F59E0B]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">100% Escrow Payment Safety</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment is securely held in escrow and is only released to the nurse after clinical care has been completed to your satisfaction. Transparent JMD receipts and no hidden charges.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Electronic Health Records</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every visit generates detailed vital charts (BP, Pulse, Blood Sugar, SpO2) and clinical progress notes that you can download or share directly with your private physician.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">119 Emergency Direct Speed Dial</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Equipped with instant 119 emergency speed dialing, GPS beacon broadcast, and rapid medical escalation protocols in case of critical patient decompensation.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Guaranteed Practitioner Remuneration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We empower Jamaican nurses with guaranteed escrow payouts, direct local bank deposits (NCB, BNS, JN, Sagicor), and full clinical independence with flexible scheduling.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5. SECTION: SERVICES & JMD RATES PREVIEW */}
      {(activeTab === 'overview' || activeTab === 'services') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/20 text-blue-300 border border-blue-400/30">
                Clinical Services
              </span>
              <h2 className="text-2xl font-black text-white mt-1">Available In-Home Procedures</h2>
            </div>

            <button
              onClick={onOpenSignIn}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Sign In to Book Any Service</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(services || []).slice(0, 6).map(service => (
              <div
                key={service.id}
                onClick={onOpenSignIn}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-400/50 hover:bg-white/[0.06] transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
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

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-blue-300">{formatJMD(service.priceJMD)}</span>
                    <span className="text-[10px] text-slate-400 block">Standard Rate</span>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 group-hover:bg-[#3B82F6] text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Book</span>
                    <Lock className="w-3 h-3 text-blue-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. SECTION: OFFICIAL JAMAICAN HEALTH NEWS (MOHW & SERHA) */}
      {(activeTab === 'overview' || activeTab === 'health_news') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#F59E0B]" /> MOHW Verified Bulletins
                </span>
                <span className="text-xs text-slate-400">Public Health Surveillance &amp; Community Advisories</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Jamaica Health News &amp; Guidance</h2>
            </div>
            <span className="text-xs text-slate-400">Official Ministry guidelines accessible to all visitors</span>
          </div>

          {/* Render embedded health news feed */}
          <HealthNewsFeed onBookService={() => onOpenSignIn()} />
        </section>
      )}

      {/* 7. PATIENT & PRACTITIONER TESTIMONIALS */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Verified Stories
            </span>
            <h2 className="text-2xl font-black text-white">What Jamaican Families Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
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

            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
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

            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
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
        </section>
      )}

      {/* 8. BOTTOM CALL TO ACTION BANNER */}
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
