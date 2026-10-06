import React, { useState, useEffect, useMemo } from 'react';
import { 
  NurseProfile, 
  ServiceItem, 
  Booking, 
  UserAccount 
} from '../../types';
import { 
  DISPATCH_TIERS, 
  DispatchTierOption, 
  SAVED_LOCATIONS, 
  SavedLocationPreset, 
  generateSafetyPin,
  isNurseFavorite,
  toggleFavoriteNurse
} from '../../utils/careDispatchUtils';
import { ALL_ZONES_GEO, KINGSTON_ZONE_GEO, calculateDistanceKm } from '../../data/geoData';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Users, 
  Stethoscope, 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Star, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Radio, 
  Flame, 
  Heart, 
  Plus, 
  Minus, 
  CreditCard, 
  Shield, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  LocateFixed,
  Send
} from 'lucide-react';

interface InstantCareDispatchViewProps {
  nurses?: NurseProfile[];
  services?: ServiceItem[];
  currentUser?: UserAccount;
  userGpsCoords?: { lat: number; lng: number } | null;
  onTriggerGps?: () => void;
  isLocatingGps?: boolean;
  onConfirmDispatch: (bookingData: Partial<Booking>) => void;
  onSelectService?: (service: ServiceItem) => void;
  onViewNurseProfile?: (nurse: NurseProfile) => void;
}

interface IncomingNurseBid {
  nurse: NurseProfile;
  bidPriceJMD: number;
  originalOfferJMD: number;
  etaMinutes: number;
  distanceKm: number;
  status: 'counter_offer' | 'accepted_offer';
  message: string;
}

export const InstantCareDispatchView: React.FC<InstantCareDispatchViewProps> = ({
  nurses = [],
  services = [],
  currentUser,
  userGpsCoords,
  onTriggerGps,
  isLocatingGps,
  onConfirmDispatch,
  onSelectService,
  onViewNurseProfile
}) => {
  // Dispatch Mode: 'express' (instant tier dispatch) or 'negotiated' (fare bidding)
  const [dispatchMode, setDispatchMode] = useState<'express' | 'negotiated'>('express');
  
  // Selected Tier
  const [selectedTier, setSelectedTier] = useState<DispatchTierOption>(DISPATCH_TIERS[1]); // Comfort RN default
  
  // Location and Address
  const [selectedLocation, setSelectedLocation] = useState<string>(currentUser?.address || '14 Trafalgar Road, New Kingston');
  const [selectedZone, setSelectedZone] = useState<string>(currentUser?.zone || 'New Kingston');
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'srv-1');
  const currentService = useMemo(() => {
    return (services || []).find(s => s && s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Custom Fare Offer / Negotiation State
  const defaultFare = selectedTier.basePriceJMD;
  const [offeredFare, setOfferedFare] = useState<number>(defaultFare);
  const [isBiddingActive, setIsBiddingActive] = useState<boolean>(false);
  const [incomingBids, setIncomingBids] = useState<IncomingNurseBid[]>([]);
  const [biddingCountdown, setBiddingCountdown] = useState<number>(20);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'lynk_mobile_money' | 'ncb_quik'>('card');
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    nurses.forEach(n => {
      map[n.id] = isNurseFavorite(n.id);
    });
    return map;
  });

  // Keep offered fare updated when tier changes if not manually set
  useEffect(() => {
    if (!isBiddingActive) {
      setOfferedFare(selectedTier.basePriceJMD);
    }
  }, [selectedTier, isBiddingActive]);

  // Handle saved location quick select
  const handleSelectPreset = (preset: SavedLocationPreset) => {
    setSelectedLocation(preset.address);
    setSelectedZone(preset.zone);
    soundFX.playClick();
  };

  // Toggle favorite nurse
  const handleToggleFav = (e: React.MouseEvent, nurseId: string) => {
    e.stopPropagation();
    const isFav = toggleFavoriteNurse(nurseId);
    setFavoritesMap(prev => ({ ...prev, [nurseId]: isFav }));
    soundFX.playDelightChime();
  };

  // Custom Offer: Broadcast Fare Proposal to Nearby Nurses
  const handleStartBidding = () => {
    if (offeredFare < 2500) {
      alert('Minimum acceptable fare for licensed home healthcare is JMD $2,500');
      return;
    }
    setIsBiddingActive(true);
    setIncomingBids([]);
    setBiddingCountdown(20);
    soundFX.playStartSession();

    // Simulate incoming bids from nearby nurses
    const activeNurses = nurses.slice(0, 4);
    
    // Bid 1: Accepts exact offer
    setTimeout(() => {
      if (activeNurses[0]) {
        const n = activeNurses[0];
        setIncomingBids(prev => [
          ...prev,
          {
            nurse: n,
            bidPriceJMD: offeredFare,
            originalOfferJMD: offeredFare,
            etaMinutes: 5,
            distanceKm: 1.4,
            status: 'accepted_offer',
            message: 'Accepts your offer • On duty in New Kingston'
          }
        ]);
        soundFX.playNotificationChime();
      }
    }, 1800);

    // Bid 2: Counter offer +JMD 500
    setTimeout(() => {
      if (activeNurses[1]) {
        const n = activeNurses[1];
        const counter = Math.round((offeredFare + 500) / 100) * 100;
        setIncomingBids(prev => [
          ...prev,
          {
            nurse: n,
            bidPriceJMD: counter,
            originalOfferJMD: offeredFare,
            etaMinutes: 8,
            distanceKm: 2.3,
            status: 'counter_offer',
            message: `Counter-offer: JMD $${counter.toLocaleString()} • Ready with sterile kit`
          }
        ]);
        soundFX.playDelightChime();
      }
    }, 4200);

    // Bid 3: Counter offer +JMD 1,000
    setTimeout(() => {
      if (activeNurses[2]) {
        const n = activeNurses[2];
        const counter = Math.round((offeredFare + 1000) / 100) * 100;
        setIncomingBids(prev => [
          ...prev,
          {
            nurse: n,
            bidPriceJMD: counter,
            originalOfferJMD: offeredFare,
            etaMinutes: 11,
            distanceKm: 3.5,
            status: 'counter_offer',
            message: `Specialist RN • JMD $${counter.toLocaleString()} • Fast response`
          }
        ]);
        soundFX.playDelightChime();
      }
    }, 7000);
  };

  // Fair Fare Bidding Countdown ticker
  useEffect(() => {
    if (!isBiddingActive) return;
    const timer = setInterval(() => {
      setBiddingCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isBiddingActive]);

  // Accept a specific practitioner bid
  const handleAcceptBid = (bid: IncomingNurseBid) => {
    soundFX.playGentleDing();
    soundFX.playBookingConfirmed();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    
    const pin = generateSafetyPin();
    const finalPrice = bid.bidPriceJMD;
    const platformFee = Math.round(finalPrice * 0.15);
    const nurseEarnings = finalPrice - platformFee;

    onConfirmDispatch({
      serviceId: currentService?.id || 'srv-1',
      serviceName: currentService?.name || 'On-Demand Clinical Care',
      clientAddress: selectedLocation,
      zone: selectedZone,
      nurseId: bid.nurse.id,
      nurseName: bid.nurse.name,
      nursePhoto: bid.nurse.photoUrl,
      nursePhone: bid.nurse.phone,
      priceJMD: finalPrice,
      platformFeeJMD: platformFee,
      nurseEarningsJMD: nurseEarnings,
      status: 'requested',
      nurseAccepted: false,
      clientActivated: false,
      dispatchMode: 'negotiated_offer',
      dispatchTier: selectedTier.id,
      offeredPriceJMD: offeredFare,
      safetyPin: pin,
      arrivalPassCode: pin,
      liveEtaMinutes: bid.etaMinutes,
      distanceKm: bid.distanceKm,
      paymentMethod,
      notes: patientNotes || `Agreed fare matched: JMD $${finalPrice.toLocaleString()}`
    });
  };

  // Express Instant Dispatch
  const handleExpressInstantDispatch = () => {
    soundFX.playGentleDing();
    soundFX.playBookingConfirmed();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    // Pick top available nurse matching tier
    const eligibleNurses = nurses.filter(n => n.availabilityStatus !== 'offline');
    const assignedNurse = eligibleNurses[0] || nurses[0];
    const pin = generateSafetyPin();
    const finalPrice = selectedTier.basePriceJMD;
    const platformFee = Math.round(finalPrice * 0.15);
    const nurseEarnings = finalPrice - platformFee;

    onConfirmDispatch({
      serviceId: currentService?.id || 'srv-1',
      serviceName: currentService?.name || 'On-Demand Clinical Care',
      clientAddress: selectedLocation,
      zone: selectedZone,
      nurseId: assignedNurse.id,
      nurseName: assignedNurse.name,
      nursePhoto: assignedNurse.photoUrl,
      nursePhone: assignedNurse.phone,
      priceJMD: finalPrice,
      platformFeeJMD: platformFee,
      nurseEarningsJMD: nurseEarnings,
      status: 'requested',
      nurseAccepted: false,
      clientActivated: false,
      dispatchMode: 'fixed',
      dispatchTier: selectedTier.id,
      safetyPin: pin,
      arrivalPassCode: pin,
      liveEtaMinutes: selectedTier.etaMinutes,
      distanceKm: 2.1,
      paymentMethod,
      notes: patientNotes || `${selectedTier.name} instant dispatch`
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Dispatch Mode Switcher & Surge Meter */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#180326] via-[#10021c] to-[#0a1828] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#1E1B4B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-ping text-emerald-400" />
                <span>Live Kingston Dispatch Grid</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-medium border border-purple-500/30">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Normal Surge (1.0x)</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>On-Demand Healthcare Dispatch</span>
              <span className="text-xs font-normal text-slate-400">Kingston &amp; St. Andrew</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Book a verified practitioner instantly with guaranteed arrival ETA or propose your own custom visit fare.
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="inline-flex p-1.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md self-start md:self-auto">
            <button
              onClick={() => {
                setDispatchMode('express');
                setIsBiddingActive(false);
                soundFX.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                dispatchMode === 'express'
                  ? 'bg-gradient-to-r from-[#1E1B4B] to-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Express Dispatch</span>
            </button>
            <button
              onClick={() => {
                setDispatchMode('negotiated');
                soundFX.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                dispatchMode === 'negotiated'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-300" />
              <span>Propose Fair Fare</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Address & Service Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Care Location Box */}
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Patient Care Location</span>
              </h3>
              {onTriggerGps && (
                <button
                  type="button"
                  onClick={onTriggerGps}
                  disabled={isLocatingGps}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-bold transition"
                  title="Detect live physical GPS coordinates in Jamaica"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin text-amber-400' : 'text-purple-300'}`} />
                  <span>{isLocatingGps ? 'Locating...' : 'Use Current GPS'}</span>
                </button>
              )}
            </div>

            {/* Address Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Navigation className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Enter street address, complex or landmark in Kingston..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Saved Location Quick Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Saved Care Destinations:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAVED_LOCATIONS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedLocation.includes(preset.zone) || selectedLocation === preset.address
                        ? 'bg-purple-500/20 border-purple-500/40 text-white shadow-md'
                        : 'bg-black/20 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="font-bold text-xs truncate">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">{preset.zone}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Care Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Care Instructions &amp; Gate Code / Apartment Details:
              </label>
              <input
                type="text"
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g. Gate code #4912, patient is post-knee surgery, needs gentle dressing change..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Service Category & Scope */}
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Primary Clinical Service Needed</span>
              </h3>
              <span className="text-xs text-purple-300 font-bold">
                {(services?.length || 0)} Specialized Services
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {(services || []).map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => {
                    setSelectedServiceId(svc.id);
                    soundFX.playClick();
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                    selectedServiceId === svc.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-md'
                      : 'bg-black/20 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{svc.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{svc.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400 block">
                      JMD ${(svc.priceJMD || 7500).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400">{svc.durationMinutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Express Tiers OR Fare Bidding */}
        <div className="lg:col-span-5 space-y-6">
          {dispatchMode === 'express' ? (
            /* EXPRESS TIERS VIEW */
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Select Care Tier</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Guaranteed practitioner dispatch &amp; live transit tracking</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Instant Match
                </span>
              </div>

              {/* Tiers List */}
              <div className="space-y-3">
                {DISPATCH_TIERS.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        setSelectedTier(tier);
                        soundFX.playClick();
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-950/60 to-[#1e052d] border-purple-500 shadow-xl shadow-purple-950/40'
                          : 'bg-black/30 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Badge */}
                      <span className={`absolute top-2.5 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {tier.badge}
                      </span>

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#1E1B4B] text-white shadow-md' : 'bg-white/10 text-slate-300'
                        }`}>
                          {tier.iconName === 'stethoscope' && <Stethoscope className="w-5 h-5" />}
                          {tier.iconName === 'heart' && <Heart className="w-5 h-5" />}
                          {tier.iconName === 'zap' && <Zap className="w-5 h-5" />}
                          {tier.iconName === 'users' && <Users className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0 pr-16">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{tier.name}</h4>
                          </div>
                          <p className="text-[11px] text-purple-200 truncate mt-0.5">{tier.subtitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{tier.description}</p>
                          
                          <div className="flex items-center gap-3 mt-2 text-[11px]">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{tier.etaMinutes} min away</span>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-white font-black">
                              JMD ${tier.basePriceJMD.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Method Picker */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">Payment:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-purple-500/20 border-purple-500 text-white'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                    <span>NCB / Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('lynk_mobile_money')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      paymentMethod === 'lynk_mobile_money'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Lynk Wallet</span>
                  </button>
                </div>
              </div>

              {/* Dispatch Action Button */}
              <button
                type="button"
                onClick={handleExpressInstantDispatch}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-purple-950/60 transition flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
                <span>Confirm {selectedTier.name} (JMD ${selectedTier.basePriceJMD.toLocaleString()})</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            /* FARE BIDDING VIEW */
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Propose Your Fare (Open Offer Mode)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Set your price. Nearby Kingston nurses will accept or counter-bid.</p>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Fair Bidding
                </span>
              </div>

              {/* Fare Bidding Controller */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Your Proposed Visit Fare:</span>
                  <span className="text-xs text-slate-400">Recommended: JMD ${defaultFare.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOfferedFare(prev => Math.max(2500, prev - 500));
                      soundFX.playClick();
                    }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      JMD ${offeredFare.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">Includes verified nurse transit &amp; care</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOfferedFare(prev => prev + 500);
                      soundFX.playClick();
                    }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Increment Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
                  {[-500, 500, 1000, 1500].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        setOfferedFare(prev => Math.max(2500, prev + inc));
                        soundFX.playClick();
                      }}
                      className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-slate-300 hover:text-white transition"
                    >
                      {inc > 0 ? `+JMD ${inc}` : `-JMD ${Math.abs(inc)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Bidding / Live Bids Stream */}
              {!isBiddingActive ? (
                <button
                  type="button"
                  onClick={handleStartBidding}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Offer (JMD ${offeredFare.toLocaleString()}) to Nurses</span>
                </button>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  {/* Radar Status Ring */}
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-emerald-300">
                        Broadcasting to 8 nurses in Kingston...
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {biddingCountdown}s remaining
                    </span>
                  </div>

                  {/* Incoming Bids */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {incomingBids.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
                        Waiting for practitioner bids from nearby zones...
                      </div>
                    ) : (
                      incomingBids.map((bid) => (
                        <div
                          key={bid.nurse.id}
                          className="p-3.5 rounded-2xl bg-black/50 border border-purple-500/30 shadow-lg space-y-2 animate-fadeIn"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={bid.nurse.photoUrl}
                                alt={bid.nurse.name}
                                className="w-10 h-10 rounded-xl object-cover border border-purple-400"
                              />
                              <div>
                                <h4 className="font-bold text-xs text-white flex items-center gap-1">
                                  <span>{bid.nurse.name}</span>
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                </h4>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-purple-400" />
                                  <span>{bid.nurse.qualificationTitle || 'Licensed Nurse'} • {bid.nurse.zones?.[0] || 'Kingston'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-400 block">
                                JMD ${bid.bidPriceJMD.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {bid.etaMinutes} min • {bid.distanceKm} km
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                            <span className="text-[10px] text-purple-300 truncate">
                              {bid.message}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAcceptBid(bid)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs shadow-md transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
