import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  Award,
  ChevronDown
} from 'lucide-react';
import { NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface NurseSearchFilterProps {
  nurses?: NurseProfile[];
  onFilteredNursesChange?: (filtered: NurseProfile[]) => void;
  title?: string;
  placeholder?: string;
  showStatusPills?: boolean;
  showDateFilter?: boolean;
  showCareLevelFilter?: boolean;
  className?: string;
  children?: (filtered: NurseProfile[]) => React.ReactNode;
}

export const NurseSearchFilter: React.FC<NurseSearchFilterProps> = ({
  nurses = [],
  onFilteredNursesChange,
  title,
  placeholder = 'Search nurses by name, license #NCJ, phone, skill, or parish...',
  showStatusPills = true,
  showDateFilter = true,
  showCareLevelFilter = true,
  className = '',
  children
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_approval' | 'suspended'>('all');
  const [careLevelFilter, setCareLevelFilter] = useState<'all' | 'registered_nurse' | 'geriatric_caregiver' | 'practical_nurse_aide'>('all');
  const [expiryDateFilter, setExpiryDateFilter] = useState('');

  const filteredNurses = useMemo(() => {
    return (nurses || []).filter((nurse) => {
      if (!nurse) return false;
      // 1. Status Filter
      if (statusFilter !== 'all') {
        if (nurse.status !== statusFilter) return false;
      }

      // 2. Care Level Filter
      if (careLevelFilter !== 'all') {
        if (nurse.careLevel !== careLevelFilter) return false;
      }

      // 3. License Expiry Date Filter
      if (expiryDateFilter && nurse.licenseExpiryDate) {
        // Match exact or check if license expires before selected cutoff
        if (nurse.licenseExpiryDate < expiryDateFilter) {
          return false;
        }
      }

      // 4. Free text search (Name, Phone, Email, License, Zone, Skills)
      if (!query.trim()) return true;

      const q = query.toLowerCase().trim();
      const matchName = (nurse.name || '').toLowerCase().includes(q);
      const matchLicense = (nurse.nursingCouncilLicense || '').toLowerCase().includes(q);
      const matchPhone = (nurse.phone || nurse.phoneNumber || '').toLowerCase().includes(q);
      const matchEmail = (nurse.email || '').toLowerCase().includes(q);
      const matchZone = (nurse.zones || []).some(z => z.toLowerCase().includes(q));
      const matchSkills = (nurse.skillBadges || []).some(b => b.skillName.toLowerCase().includes(q)) ||
        (nurse.certifications || []).some(c => c.toLowerCase().includes(q));
      const matchQualification = (nurse.qualificationTitle || nurse.institutionAttended || '').toLowerCase().includes(q);

      return matchName || matchLicense || matchPhone || matchEmail || matchZone || matchSkills || matchQualification;
    });
  }, [nurses, query, statusFilter, careLevelFilter, expiryDateFilter]);

  const hasActiveFilters = !!query.trim() || statusFilter !== 'all' || careLevelFilter !== 'all' || !!expiryDateFilter;

  const handleClear = () => {
    soundFX.playSuccessPing();
    setQuery('');
    setStatusFilter('all');
    setCareLevelFilter('all');
    setExpiryDateFilter('');
  };

  const filterCard = (
    <div className={`p-4 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-3 ${className}`}>
      {/* Top Search Input Row */}
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
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:border-purple-400 outline-none transition shadow-inner"
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

        {/* License Expiry Date Filter */}
        {showDateFilter && (
          <div className="relative shrink-0 flex items-center" title="Filter by NCJ License Expiry Date">
            <span className="hidden md:inline text-[11px] text-slate-400 mr-2">Valid After:</span>
            <input
              type="date"
              value={expiryDateFilter}
              onChange={(e) => {
                soundFX.playFilterSelect();
                setExpiryDateFilter(e.target.value);
              }}
              className="px-3 py-2 rounded-2xl bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 outline-none transition cursor-pointer shadow-inner font-mono"
            />
            {expiryDateFilter && (
              <button
                type="button"
                onClick={() => setExpiryDateFilter('')}
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

      {/* Filter Row: Status & Tier Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
        {showStatusPills && (
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Nurses' },
              { id: 'approved', label: '✓ Verified & Active' },
              { id: 'pending_approval', label: '⏳ Pending NCJ Review' },
              { id: 'suspended', label: '✕ Suspended' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setStatusFilter(st.id as any);
                }}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#7209B7] text-white border border-purple-400/50 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {showCareLevelFilter && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Tier:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'registered_nurse', label: 'Clinical RN' },
              { id: 'geriatric_care_aide', label: 'Geriatric Aide' }
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  soundFX.playFilterSelect();
                  setCareLevelFilter(tier.id as any);
                }}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  careLevelFilter === tier.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                    : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-[11px] font-mono text-slate-400 ml-auto">
          <strong className="text-purple-300">{filteredNurses.length}</strong> of {nurses.length} nurses found
        </div>
      </div>
    </div>
  );

  if (children) {
    return (
      <div className="space-y-4">
        {filterCard}
        {children(filteredNurses)}
      </div>
    );
  }

  return filterCard;
};
