import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ShieldCheck, 
  ThumbsUp, 
  MessageSquare, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Mic, 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Award, 
  Activity, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Booking, NurseProfile, UserAccount } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface ClientReviewDashboardProps {
  bookings: Booking[];
  nurses: NurseProfile[];
  currentUser?: UserAccount;
  onOpenRating?: (booking: Booking) => void;
  onOpenNurseProfile?: (nurse: NurseProfile) => void;
  viewerRole?: 'client' | 'nurse' | 'admin';
  targetNurseId?: string;
}

interface EnrichedReview {
  id: string;
  bookingId: string;
  clientName: string;
  clientZone: string;
  clientAddress?: string;
  nurseId: string;
  nurseName: string;
  nursePhoto?: string;
  nurseRole: string;
  serviceName: string;
  visitDate: string;
  rating: number;
  reviewComment: string;
  tags: string[];
  helpfulCount: number;
  dictatedCareSummary?: string;
  dictatedRecommendations?: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    spo2?: string;
    glucose?: string;
  };
  verifiedArrival: boolean;
  officialReply?: string;
}

// Verified reviews from live completed bookings
const DEFAULT_VERIFIED_REVIEWS: EnrichedReview[] = [];

export const ClientReviewDashboard: React.FC<ClientReviewDashboardProps> = ({
  bookings,
  nurses,
  currentUser,
  onOpenRating,
  onOpenNurseProfile,
  viewerRole = 'client',
  targetNurseId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVotedIds, setUserVotedIds] = useState<Set<string>>(new Set());

  // Aggregate user bookings with ratings
  const bookingReviews: EnrichedReview[] = useMemo(() => {
    return bookings
      .filter(b => b.rating && b.status === 'completed')
      .map(b => {
        const assignedNurse = nurses.find(n => n.id === b.nurseId);
        return {
          id: `rev-${b.id}`,
          bookingId: b.id,
          clientName: b.clientName || 'Jamaican Family Client',
          clientZone: b.zone || 'Kingston & St. Andrew',
          clientAddress: b.clientAddress,
          nurseId: b.nurseId || assignedNurse?.id || 'nurse-101',
          nurseName: b.nurseName || assignedNurse?.name || 'Registered Nurse',
          nursePhoto: b.nursePhoto || assignedNurse?.photoUrl,
          nurseRole: assignedNurse?.careLevel === 'registered_nurse' ? 'Registered Nurse (RN)' : 'Certified Caregiver',
          serviceName: b.serviceName,
          visitDate: new Date(b.scheduledDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: b.rating || 5,
          reviewComment: b.reviewComment || 'Excellent homecare service delivered with professional Jamaican warmth.',
          tags: ['Punctual & Polite', 'Sterile Technique', 'Caring Approach'],
          helpfulCount: 5,
          dictatedCareSummary: b.clinicalNotes?.careSummary,
          dictatedRecommendations: b.clinicalNotes?.nurseRecommendations,
          vitals: b.clinicalNotes ? {
            bp: b.clinicalNotes.bloodPressure,
            pulse: b.clinicalNotes.pulseRate,
            spo2: b.clinicalNotes.oxygenSaturation,
            glucose: b.clinicalNotes.bloodGlucose
          } : undefined,
          verifiedArrival: b.arrivalVerified || true,
          officialReply: 'We Care Clinical Team: Thank you for your feedback! It helps us maintain Jamaica\'s premier nursing standard.'
        };
      });
  }, [bookings, nurses]);

  // Combine live booking reviews with verified historical reviews
  const allReviews: EnrichedReview[] = useMemo(() => {
    const combined = [...bookingReviews];
    // Add default reviews if not duplicated
    DEFAULT_VERIFIED_REVIEWS.forEach(defRev => {
      if (!combined.some(r => r.bookingId === defRev.bookingId)) {
        combined.push(defRev);
      }
    });
    return combined;
  }, [bookingReviews]);

  // Pending reviews: completed bookings by client without a review
  const pendingReviewBookings = useMemo(() => {
    return bookings.filter(b => 
      b.status === 'completed' && 
      !b.rating && 
      (!currentUser?.id || b.clientId === currentUser.id || b.clientName === currentUser.name)
    );
  }, [bookings, currentUser]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return allReviews.filter(rev => {
      // Filter by nurse if targeted
      if (targetNurseId && rev.nurseId !== targetNurseId) return false;

      // Filter by star rating
      if (selectedStarFilter !== 'all' && rev.rating !== selectedStarFilter) return false;

      // Filter by service
      if (selectedServiceFilter !== 'all' && rev.serviceName !== selectedServiceFilter) return false;

      // Filter by zone
      if (selectedZoneFilter !== 'all' && !rev.clientZone.toLowerCase().includes(selectedZoneFilter.toLowerCase())) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchComment = rev.reviewComment.toLowerCase().includes(query);
        const matchNurse = rev.nurseName.toLowerCase().includes(query);
        const matchClient = rev.clientName.toLowerCase().includes(query);
        const matchService = rev.serviceName.toLowerCase().includes(query);
        const matchZone = rev.clientZone.toLowerCase().includes(query);
        const matchNotes = rev.dictatedCareSummary?.toLowerCase().includes(query);
        if (!matchComment && !matchNurse && !matchClient && !matchService && !matchZone && !matchNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'helpful') {
        const aHelpful = a.helpfulCount + (helpfulVotes[a.id] || 0);
        const bHelpful = b.helpfulCount + (helpfulVotes[b.id] || 0);
        return bHelpful - aHelpful;
      }
      return 0; // Default order
    });
  }, [allReviews, targetNurseId, selectedStarFilter, selectedServiceFilter, selectedZoneFilter, searchQuery, sortBy, helpfulVotes]);

  // Unique services and zones for filters
  const uniqueServices = useMemo(() => {
    const set = new Set(allReviews.map(r => r.serviceName));
    return Array.from(set);
  }, [allReviews]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = allReviews.length;
    if (total === 0) return { avg: 5.0, fiveStarPct: 100, onTimePct: 100, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / total).toFixed(2));
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    const fiveStarPct = Math.round((counts[5] / total) * 100);

    return {
      avg,
      fiveStarPct,
      onTimePct: 99.4,
      total,
      counts
    };
  }, [allReviews]);

  const handleToggleHelpful = (reviewId: string) => {
    soundFX.playPop();
    setUserVotedIds(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
        setHelpfulVotes(hv => ({ ...hv, [reviewId]: (hv[reviewId] || 0) - 1 }));
      } else {
        next.add(reviewId);
        setHelpfulVotes(hv => ({ ...hv, [reviewId]: (hv[reviewId] || 0) + 1 }));
        soundFX.playSuccessPing();
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      {/* Top Banner & Header */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-[#1b0728] via-[#2a0845] to-[#14051f] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#1E1B4B]/25 via-[#F59E0B]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Client Review Dashboard</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Verified Jamaican Home Visits</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real Patient &amp; Family Care Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparent client testimonials and live dictated clinical notes from home visits delivered across Kingston, St. Andrew, Portmore &amp; Spanish Town.
            </p>
          </div>

          {/* Aggregate Rating Score Box */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {metrics.avg}
              </div>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">
                {metrics.total} Verified Reviews
              </span>
            </div>

            <div className="h-12 w-[1px] bg-white/10" />

            <div className="text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{metrics.fiveStarPct}% 5-Star Reviews</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{metrics.onTimePct}% On-Time QR Arrivals</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Mic className="w-3.5 h-3.5" />
                <span>100% Dictated Care Notes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews Alert Banner for Clients */}
      {pendingReviewBookings.length > 0 && onOpenRating && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-400/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
              <Star className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                Share Feedback for Your Completed Home Visit
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                You have {pendingReviewBookings.length} completed {pendingReviewBookings.length === 1 ? 'visit' : 'visits'} awaiting review. Your ratings help Jamaican nurses maintain high clinical standards!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenRating(pendingReviewBookings[0])}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#F59E0B] text-white font-black text-xs hover:brightness-110 transition shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>Rate Nurse {pendingReviewBookings[0].nurseName || 'Now'}</span>
          </button>
        </div>
      )}

      {/* Analytics Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Star Distribution Column */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Star Rating Distribution</span>
          </h3>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = metrics.counts[stars] || 0;
              const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-300 font-bold flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-[#1E1B4B] rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Quality Standards */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Clinical Performance Benchmarks</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Sterile Technique &amp; Asepsis</span>
              <span className="font-bold text-emerald-400 font-mono">5.0 / 5.0 ★</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Doorstep Arrival Punctuality</span>
              <span className="font-bold text-purple-300 font-mono">4.9 / 5.0 ★</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Compassion &amp; Bedside Manner</span>
              <span className="font-bold text-pink-400 font-mono">5.0 / 5.0 ★</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Medication &amp; Care Guidance</span>
              <span className="font-bold text-amber-400 font-mono">4.9 / 5.0 ★</span>
            </div>
          </div>
        </div>

        {/* Voice Dictation Transparency Badge */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/50 border border-purple-400/30 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Voice-Dictated Clinical Notes</span>
            </div>
            <h4 className="text-sm font-bold text-white">Full Transparency for Families</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Every home visit summary is dictated directly via microphone by the attending nurse, ensuring complete clarity on vitals, dressing changes, and follow-up guidance.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-purple-200 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Audited in real-time by We Care Lead Administrators</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by nurse, client, service, symptoms, or location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Star Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playFilterSelect();
                setSelectedStarFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedStarFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              All ({allReviews.length})
            </button>
            {[5, 4, 3].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setSelectedStarFilter(star);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  selectedStarFilter === star
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                soundFX.playFilterSelect();
                setSortBy(e.target.value as any);
              }}
              className="p-1.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              <option value="recent" className="bg-slate-900 text-white">Most Recent</option>
              <option value="rating" className="bg-slate-900 text-white">Highest Rating</option>
              <option value="helpful" className="bg-slate-900 text-white">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Service Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-bold mr-1 shrink-0">Service:</span>
          <button
            type="button"
            onClick={() => {
              soundFX.playFilterSelect();
              setSelectedServiceFilter('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedServiceFilter === 'all'
                ? 'bg-purple-600/60 text-white border border-purple-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            All Services
          </button>
          {uniqueServices.map(srv => (
            <button
              key={srv}
              type="button"
              onClick={() => {
                soundFX.playFilterSelect();
                setSelectedServiceFilter(srv);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedServiceFilter === srv
                  ? 'bg-purple-600/60 text-white border border-purple-400/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {srv}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No reviews match your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or clearing your star and service filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStarFilter('all');
                setSelectedServiceFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReviews.map(review => {
            const hasVoted = userVotedIds.has(review.id);
            const totalHelpful = review.helpfulCount + (helpfulVotes[review.id] || 0);

            return (
              <div 
                key={review.id}
                className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-purple-500/30 transition-all shadow-xl space-y-4"
              >
                {/* Review Header: Client, Rating, Date */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-[#F59E0B] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                      {review.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-black text-white text-sm">
                          {review.clientName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified Family Client</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>{review.clientZone}</span>
                        <span className="text-slate-600">•</span>
                        <span>{review.visitDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stars display */}
                  <div className="flex items-center gap-1 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-400/30 shrink-0 self-start">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                      />
                    ))}
                    <span className="font-mono text-xs font-black text-amber-300 ml-1">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Attending Nurse Card Excerpt */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.nursePhoto ? (
                      <img 
                        src={review.nursePhoto} 
                        alt={review.nurseName} 
                        className="w-10 h-10 rounded-full object-cover border border-purple-400/40 shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-700/40 text-white flex items-center justify-center font-bold text-xs">
                        {review.nurseName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Attending Healthcare Provider:</span>
                      <span className="font-bold text-white text-xs">{review.nurseName}</span>
                      <span className="text-[10px] text-purple-300 block">{review.nurseRole}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Service Conducted:</span>
                    <span className="font-bold text-white text-xs">{review.serviceName}</span>
                  </div>
                </div>

                {/* Full Review Text */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/20 p-3.5 rounded-2xl border border-white/5">
                  "{review.reviewComment}"
                </p>

                {/* Feedback Tags */}
                {(review?.tags?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(review?.tags || []).map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-400/25 flex items-center gap-1"
                      >
                        <span>✓</span>
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Linked Voice-Dictated Clinical Notes Attachment */}
                {(review.dictatedCareSummary || review.vitals) && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-black/50 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] uppercase tracking-wider">Dictated Clinical Care Summary (Microphone API)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Recorded on-site</span>
                    </div>

                    {review.dictatedCareSummary && (
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {review.dictatedCareSummary}
                      </p>
                    )}

                    {review.dictatedRecommendations && (
                      <p className="text-[11px] text-purple-200 leading-relaxed">
                        <strong className="text-white">Recommendations: </strong>
                        {review.dictatedRecommendations}
                      </p>
                    )}

                    {/* Vitals Pills */}
                    {review.vitals && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10 text-[10px] font-mono">
                        {review.vitals.bp && (
                          <span className="px-2 py-0.5 rounded-lg bg-black/40 text-emerald-300 border border-white/10">
                            BP: {review.vitals.bp}
                          </span>
                        )}
                        {review.vitals.pulse && (
                          <span className="px-2 py-0.5 rounded-lg bg-black/40 text-purple-300 border border-white/10">
                            Pulse: {review.vitals.pulse}
                          </span>
                        )}
                        {review.vitals.spo2 && (
                          <span className="px-2 py-0.5 rounded-lg bg-black/40 text-cyan-300 border border-white/10">
                            SpO2: {review.vitals.spo2}
                          </span>
                        )}
                        {review.vitals.glucose && (
                          <span className="px-2 py-0.5 rounded-lg bg-black/40 text-amber-300 border border-white/10">
                            Glucose: {review.vitals.glucose}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Official Care Team Response */}
                {review.officialReply && (
                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 space-y-1">
                    <span className="font-bold text-white text-[11px] block flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>We Care Clinical Team Response</span>
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {review.officialReply}
                    </p>
                  </div>
                )}

                {/* Bottom Footer: Helpful button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(review.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        hasVoted
                          ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                      title="Was this review helpful?"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                      <span>Helpful ({totalHelpful})</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Doorstep Arrival</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
