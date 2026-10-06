import React, { useState, useMemo } from 'react';
import { NurseProfile } from '../../types';
import { 
  getFavoriteNurseIds, 
  toggleFavoriteNurse 
} from '../../utils/careDispatchUtils';
import { soundFX } from '../../utils/soundEffects';
import { 
  Heart, 
  Star, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Zap, 
  Calendar, 
  Phone, 
  Award, 
  UserCheck, 
  Activity,
  Search,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CaregiverFavoritesSectionProps {
  nurses: NurseProfile[];
  onSelectNurseForBooking: (nurse: NurseProfile) => void;
  onViewNurseProfile?: (nurse: NurseProfile) => void;
}

export const CaregiverFavoritesSection: React.FC<CaregiverFavoritesSectionProps> = ({
  nurses,
  onSelectNurseForBooking,
  onViewNurseProfile
}) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteNurseIds());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const favoriteNurses = useMemo(() => {
    return nurses.filter(nurse => favoriteIds.includes(nurse.id));
  }, [nurses, favoriteIds]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favoriteNurses;
    const q = searchQuery.toLowerCase();
    return favoriteNurses.filter(n => 
      n.name.toLowerCase().includes(q) ||
      n.specialties.some(s => s.toLowerCase().includes(q)) ||
      n.zones.some(z => z.toLowerCase().includes(q))
    );
  }, [favoriteNurses, searchQuery]);

  const handleToggle = (e: React.MouseEvent, nurseId: string) => {
    e.stopPropagation();
    toggleFavoriteNurse(nurseId);
    setFavoriteIds(getFavoriteNurseIds());
    soundFX.playDelightChime();
  };

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1b032b] via-[#12021c] to-[#081524] border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Saved Caregivers</span>
            </span>
            <span className="text-xs text-slate-400">
              {favoriteNurses.length} Trusted Practitioners
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            My Favorite Nurses &amp; Caregivers
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            1-Tap instant dispatch for practitioners who know your household, medication history, and care preferences.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorite nurses..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      {/* Grid of Favorites */}
      {filteredFavorites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
          <Heart className="w-10 h-10 text-rose-400/50 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-white">No Favorite Caregivers Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the heart icon on any nurse profile or search result to pin them here for instant 1-tap re-dispatch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((nurse) => {
            const isOnDuty = nurse.availabilityStatus !== 'offline';

            return (
              <div
                key={nurse.id}
                onClick={() => onViewNurseProfile?.(nurse)}
                className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-purple-500/50 transition shadow-xl space-y-4 cursor-pointer relative group flex flex-col justify-between"
              >
                {/* Top Row: Photo & Status & Unfavorite Heart */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={nurse.photoUrl}
                          alt={nurse.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/80 shadow-md group-hover:scale-105 transition"
                        />
                        {isOnDuty && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black animate-pulse" title="On Call Now" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm group-hover:text-purple-300 transition flex items-center gap-1">
                          <span>{nurse.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </h4>
                        <span className="text-[11px] text-purple-200 block truncate">
                          {nurse.qualificationTitle || 'Licensed General Nurse'}
                        </span>
                        <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-300" />
                          <span>{nurse.rating}</span>
                          <span className="text-slate-400 font-normal">({nurse.reviewCount} visits)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggle(e, nurse.id)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition shrink-0"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                    </button>
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(nurse?.specialties || []).slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action: 1-Tap Quick Dispatch */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Standard Rate</span>
                    <span className="text-sm font-black text-emerald-400">
                      JMD ${(nurse.hourlyRateJMD || 7500).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClick();
                      onSelectNurseForBooking(nurse);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-950/40 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Quick Dispatch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
