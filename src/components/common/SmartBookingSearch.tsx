import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';

export interface BookingSearchFilters {
  query: string;
  status: 'all' | 'in_progress' | 'accepted' | 'pending' | 'completed' | 'cancelled' | 'disputed';
  zone: string;
  date?: string;
  quickTag?: string;
}

interface SmartBookingSearchProps {
  bookings?: Booking[];
  onFilteredBookingsChange?: (filtered: Booking[]) => void;
  placeholder?: string;
  showZoneFilter?: boolean;
  showStatusPills?: boolean;
  showDateFilter?: boolean;
  allowAllStatuses?: boolean;
  className?: string;
  children?: (filtered: Booking[]) => React.ReactNode;
}

const JAMAICAN_ZONES = [
  'All Zones',
  'New Kingston',
  'Half-Way Tree',
  'Barbican / Liguanea',
  'Mona / Papine',
  'Constant Spring / Manor Park',
  'Greater Portmore',
  'Spanish Town Hospital Area',
  'Red Hills / St Andrew Foothills'
];

const QUICK_TAG_SUGGESTIONS = [
  'Wound Care',
  'Elderly Care',
  'IV Therapy',
  'Hypertension',
  'Post-Op',
  'In-Progress'
];

export const SmartBookingSearch: React.FC<SmartBookingSearchProps> = ({
  bookings = [],
  onFilteredBookingsChange,
  placeholder = 'Smart Search: patient, ID #BK, Kingston zone, clinical condition, or medications...',
  showZoneFilter = true,
  showStatusPills = true,
  showDateFilter = true,
  allowAllStatuses = false,
  className = '',
  children
}) => {
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingSearchFilters['status']>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [activeQuickTag, setActiveQuickTag] = useState<string | null>(null);

  // Compute filtered bookings
  const filteredBookings = useMemo(() => {
    return (bookings || []).filter((b) => {
      if (!b) return false;
      // 1. Status Filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'in_progress' && b.status !== 'in_progress') return false;
        if (selectedStatus === 'accepted' && b.status !== 'accepted' && b.status !== 'en_route') return false;
        if (selectedStatus === 'pending' && b.status !== 'requested') return false;
        if (selectedStatus === 'completed' && b.status !== 'completed') return false;
        if (selectedStatus === 'cancelled' && b.status !== 'cancelled') return false;
        if (selectedStatus === 'disputed' && b.status !== 'disputed') return false;
      }

      // 2. Date Filter
      if (selectedDate) {
        const bDateStr = b.date || (b.scheduledDateTime ? b.scheduledDateTime.split('T')[0] : '');
        if (bDateStr !== selectedDate) {
          return false;
        }
      }

      // 3. Zone Filter
      if (selectedZone !== 'All Zones') {
        const zoneLower = selectedZone.toLowerCase();
        const bZoneLower = (b.zone || '').toLowerCase();
        const bAddressLower = (b.clientAddress || '').toLowerCase();
        if (!bZoneLower.includes(zoneLower) && !bAddressLower.includes(zoneLower)) {
          return false;
        }
      }

      // 4. Quick Tag Filter
      if (activeQuickTag) {
        const tagLower = activeQuickTag.toLowerCase();
        if (tagLower === 'in-progress') {
          if (b.status !== 'in_progress') return false;
        } else {
          const matchService = b.serviceName.toLowerCase().includes(tagLower);
          const matchNotes = (b.notes || '').toLowerCase().includes(tagLower);
          const matchClinical = (b.clinicalNotes?.careSummary || '').toLowerCase().includes(tagLower);
          const matchIllnesses = (b.knownIllnesses || []).some(ill => ill.toLowerCase().includes(tagLower));
          if (!matchService && !matchNotes && !matchClinical && !matchIllnesses) return false;
        }
      }

      // 5. Free-Text Search Query (Name, ID, Service, Condition, etc.)
      if (!query.trim()) return true;

      const q = query.toLowerCase().trim();
      const matchId = b.id.toLowerCase().includes(q);
      const matchPatient = b.clientName.toLowerCase().includes(q);
      const matchPhone = b.clientPhone.toLowerCase().includes(q);
      const matchService = b.serviceName.toLowerCase().includes(q);
      const matchZone = (b.zone || '').toLowerCase().includes(q);
      const matchAddress = (b.clientAddress || '').toLowerCase().includes(q);
      const matchNurse = (b.nurseName || '').toLowerCase().includes(q);
      const matchDate = (b.date || '').toLowerCase().includes(q);
      const matchNotes = (b.notes || '').toLowerCase().includes(q);
      const matchSummary = (b.clinicalNotes?.careSummary || '').toLowerCase().includes(q);
      const matchRecs = (b.clinicalNotes?.nurseRecommendations || '').toLowerCase().includes(q);
      const matchEmergency = (b.clientEmergencyContact?.name || '').toLowerCase().includes(q);
      const matchMedLog = (b.medicationsAdministeredLog || []).some(m => m.medicationName.toLowerCase().includes(q));
      const matchPatientMeds = (b.patientMedications || []).some(m => m.name.toLowerCase().includes(q));
      const matchIllnesses = (b.knownIllnesses || []).some(ill => ill.toLowerCase().includes(q));

      return (
        matchId ||
        matchPatient ||
        matchPhone ||
        matchService ||
        matchZone ||
        matchAddress ||
        matchNurse ||
        matchDate ||
        matchNotes ||
        matchSummary ||
        matchRecs ||
        matchEmergency ||
        matchMedLog ||
        matchPatientMeds ||
        matchIllnesses
      );
    });
  }, [bookings, query, selectedStatus, selectedDate, selectedZone, activeQuickTag]);

  const hasActiveFilters = !!query.trim() || selectedStatus !== 'all' || !!selectedDate || selectedZone !== 'All Zones' || !!activeQuickTag;

  const handleClear = () => {
    soundFX.playSuccessPing();
    setQuery('');
    setSelectedStatus('all');
    setSelectedDate('');
    setSelectedZone('All Zones');
    setActiveQuickTag(null);
  };

  const searchCard = (
    <div className={`p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-3 ${className}`}>
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-purple-400 focus:bg-black/60 outline-none transition shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Jamaican Zone Dropdown Selector */}
        {showZoneFilter && (
          <div className="relative shrink-0">
            <select
              value={selectedZone}
              onChange={(e) => {
                soundFX.playFilterSelect();
                setSelectedZone(e.target.value);
              }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 outline-none transition cursor-pointer shadow-inner font-medium"
            >
              {JAMAICAN_ZONES.map((zone, zIdx) => (
                <option key={`zone-opt-${zone}-${zIdx}`} value={zone} className="bg-slate-900 text-white">
                  📍 {zone}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Date Filter Selector */}
        {showDateFilter && (
          <div className="relative shrink-0 flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                soundFX.playFilterSelect();
                setSelectedDate(e.target.value);
              }}
              className="px-3 py-2 rounded-2xl bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 outline-none transition cursor-pointer shadow-inner font-mono"
              title="Filter visits by scheduled date"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="ml-1 text-slate-400 hover:text-white text-xs p-1"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            title="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Filter Row: Status Pills & Results Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        {/* Status Pills */}
        {showStatusPills && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'in_progress', label: '⚡ In-Progress' },
              { id: 'accepted', label: '✓ Accepted / En Route' },
              { id: 'pending', label: '⏳ Pending' },
              { id: 'completed', label: '📜 Completed' },
              ...(allowAllStatuses ? [
                { id: 'disputed', label: '⚠️ Disputed' },
                { id: 'cancelled', label: '✕ Cancelled' }
              ] : [])
            ].map((st, stIdx) => (
              <button
                key={`status-pill-${st.id}-${stIdx}`}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setSelectedStatus(st.id as BookingSearchFilters['status']);
                }}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-[#7209B7] text-white border border-purple-400/50 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 ml-auto">
          <span className="font-bold text-purple-300">
            {filteredBookings.length} of {bookings.length}
          </span>
          <span>{filteredBookings.length === 1 ? 'visit found' : 'visits found'}</span>
        </div>
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-white/5 text-[11px]">
        <span className="text-slate-500 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          Quick Filters:
        </span>
        {QUICK_TAG_SUGGESTIONS.map((tag, tIdx) => {
          const isActive = activeQuickTag === tag;
          return (
            <button
              key={`quick-tag-${tag}-${tIdx}`}
              type="button"
              onClick={() => {
                soundFX.playFilterSelect();
                setActiveQuickTag(isActive ? null : tag);
              }}
              className={`px-2 py-0.5 rounded-lg transition text-[10px] font-medium cursor-pointer ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-black/30 text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (children) {
    return (
      <div className="space-y-4">
        {searchCard}
        {children(filteredBookings)}
      </div>
    );
  }

  return searchCard;
};
