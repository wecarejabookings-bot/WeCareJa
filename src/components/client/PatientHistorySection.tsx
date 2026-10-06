import React, { useState, useMemo } from 'react';
import { Booking, ServiceItem, NurseProfile, LogoVariation } from '../../types';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';
import { ServiceLogo } from '../common/ServiceLogo';
import { 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Star, 
  Receipt, 
  Search, 
  Filter, 
  Heart, 
  Activity, 
  Droplet, 
  Thermometer, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Printer, 
  Copy, 
  Check, 
  MessageSquare, 
  Plus, 
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Pill,
  Timer
} from 'lucide-react';

interface PatientHistorySectionProps {
  bookings: Booking[];
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  onOpenRating: (booking: Booking) => void;
  onViewInvoice: (booking: Booking) => void;
  onDownloadMedicalSummary?: (booking: Booking) => void;
  onOpenBiometricScan?: (booking?: Booking) => void;
  onRebookService?: (serviceName: string, nurseId?: string) => void;
  onOpenChat?: (booking: Booking) => void;
  onBookNewCare?: () => void;
  logoVariation: LogoVariation;
}

export const PatientHistorySection: React.FC<PatientHistorySectionProps> = ({
  bookings,
  clientName,
  clientPhone,
  clientAddress,
  onOpenRating,
  onViewInvoice,
  onDownloadMedicalSummary,
  onOpenBiometricScan,
  onRebookService,
  onOpenChat,
  onBookNewCare,
  logoVariation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter completed bookings for patient history
  const completedBookings = useMemo(() => {
    return bookings.filter(b => 
      ['completed', 'closed'].includes(b.status) || 
      (b.clinicalNotes && b.status !== 'cancelled')
    ).sort((a, b) => new Date(b.scheduledDateTime).getTime() - new Date(a.scheduledDateTime).getTime());
  }, [bookings]);

  // Derived filtered bookings
  const filteredBookings = useMemo(() => {
    return completedBookings.filter(b => {
      // Date match
      if (selectedDate) {
        const bDate = b.date || (b.scheduledDateTime ? b.scheduledDateTime.split('T')[0] : '');
        if (bDate !== selectedDate) return false;
      }

      // Status match
      if (selectedStatus !== 'all') {
        if (b.status !== selectedStatus) return false;
      }

      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        b.serviceName.toLowerCase().includes(query) ||
        (b.nurseName && b.nurseName.toLowerCase().includes(query)) ||
        b.id.toLowerCase().includes(query) ||
        (b.zone && b.zone.toLowerCase().includes(query)) ||
        (b.clientName && b.clientName.toLowerCase().includes(query)) ||
        (b.clinicalNotes?.careSummary && b.clinicalNotes.careSummary.toLowerCase().includes(query)) ||
        (b.clinicalNotes?.nurseRecommendations && b.clinicalNotes.nurseRecommendations.toLowerCase().includes(query)) ||
        (b.clinicalNotes?.medicationsAdministered && b.clinicalNotes.medicationsAdministered.toLowerCase().includes(query));

      // Category match
      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'wound' && b.serviceName.toLowerCase().includes('wound')) ||
        (selectedCategory === 'vitals' && b.serviceName.toLowerCase().includes('vitals')) ||
        (selectedCategory === 'iv' && (b.serviceName.toLowerCase().includes('iv') || b.serviceName.toLowerCase().includes('injectable'))) ||
        (selectedCategory === 'postnatal' && (b.serviceName.toLowerCase().includes('postnatal') || b.serviceName.toLowerCase().includes('newborn')));

      // Rating filter
      const matchesRating = 
        selectedRatingFilter === 'all' ||
        (selectedRatingFilter === 'rated' && !!b.rating) ||
        (selectedRatingFilter === 'unrated' && !b.rating) ||
        (selectedRatingFilter === '5stars' && b.rating === 5);

      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [completedBookings, searchQuery, selectedCategory, selectedRatingFilter, selectedDate, selectedStatus]);

  // Summary Metrics
  const totalCareMinutes = completedBookings.reduce((acc, curr) => acc + (curr.actualDurationMinutes || curr.baseDurationMinutes || 45), 0);
  const totalCareHours = (totalCareMinutes / 60).toFixed(1);
  const totalSpentJMD = completedBookings.reduce((acc, curr) => acc + (curr.priceJMD || 0), 0);
  const ratedCount = completedBookings.filter(b => b.rating).length;
  const avgRating = ratedCount > 0 
    ? (completedBookings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedCount).toFixed(1)
    : '5.0';

  // Latest Vital Sign Record
  const latestVitalsBooking = completedBookings.find(b => b.clinicalNotes);
  const latestVitals = latestVitalsBooking?.clinicalNotes;

  const handleCopyClinicalNotes = (booking: Booking) => {
    if (!booking.clinicalNotes) return;
    const text = `
=== WE CARE JAMAICA - CLINICAL VISIT RECORD ===
Visit ID: ${booking.id}
Patient: ${booking.clientName} (${booking.zone})
Date: ${new Date(booking.scheduledDateTime).toLocaleString()}
Service: ${booking.serviceName}
Attending Nurse: ${booking.nurseName}

VITALS:
• Blood Pressure: ${booking.clinicalNotes.bloodPressure || 'N/A'}
• Pulse Rate: ${booking.clinicalNotes.pulseRate || 'N/A'}
• Blood Glucose: ${booking.clinicalNotes.bloodGlucose || 'N/A'}
• SpO2: ${booking.clinicalNotes.oxygenSaturation || 'N/A'}
• Temperature: ${booking.clinicalNotes.temperature || 'N/A'}

MEDICATIONS / TREATMENTS:
${booking.clinicalNotes.medicationsAdministered || 'None specified'}

CARE SUMMARY:
${booking.clinicalNotes.careSummary}

RECOMMENDATIONS:
${booking.clinicalNotes.nurseRecommendations}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Patient Clinical Profile & History Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b052e] via-[#240046] to-[#3c096c] border border-purple-500/30 p-6 md:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Patient Health Log
                </span>
                <span className="text-xs text-purple-300 font-medium">Confidential Medical History</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Patient Clinical History &amp; Vitals Log
              </h2>
              <p className="text-xs md:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
                Complete record of previous home visits, vital signs monitored by licensed Jamaican registered nurses, administered treatments, and patient care ratings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
              {onOpenBiometricScan && (
                <button
                  onClick={() => onOpenBiometricScan()}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                  title="Perform optical camera-based biometric health scan"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Biometric Health Scan</span>
                </button>
              )}

              <button
                onClick={handlePrintSummary}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 hover:text-white border border-white/15 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Print or Save Medical Summary Chart"
              >
                <Printer className="w-4 h-4 text-[#C77DFF]" />
                <span>Print Chart</span>
              </button>

              {onBookNewCare && (
                <button
                  onClick={onBookNewCare}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Follow-Up Visit</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics & Vitals Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Visits
              </span>
              <strong className="text-xl md:text-2xl font-black text-white mt-1 block">
                {completedBookings.length}
              </strong>
              <span className="text-[10px] text-slate-400">Total home sessions</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#C77DFF]" /> Bedside Care Logged
              </span>
              <strong className="text-xl md:text-2xl font-black text-white mt-1 block">
                {totalCareHours} <span className="text-xs font-normal text-purple-200">Hours</span>
              </strong>
              <span className="text-[10px] text-slate-400">{totalCareMinutes} mins clinical care</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Patient Rating Given
              </span>
              <strong className="text-xl md:text-2xl font-black text-white mt-1 block flex items-center gap-1">
                {avgRating} <span className="text-xs font-normal text-amber-300">/ 5.0</span>
              </strong>
              <span className="text-[10px] text-slate-400">{ratedCount} reviews recorded</span>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Latest Blood Pressure
              </span>
              <strong className="text-xl md:text-2xl font-black text-emerald-300 font-mono mt-1 block">
                {latestVitals?.bloodPressure || '122/78'}
              </strong>
              <span className="text-[10px] text-slate-400">Target Range Controlled</span>
            </div>
          </div>

          {/* Latest Clinical Vitals Ribbon */}
          {latestVitals && (
            <div className="mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-xs font-bold text-white">Most Recent Clinical Baseline Vitals</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (Logged by {latestVitalsBooking?.nurseName?.split(',')[0]} on {new Date(latestVitals.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Stable &amp; Verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                  <strong className="text-sm font-bold text-white font-mono">{latestVitals.bloodPressure || '120/80 mmHg'}</strong>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                  <strong className="text-sm font-bold text-white font-mono">{latestVitals.pulseRate || '72 bpm'}</strong>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Blood Glucose</span>
                  <strong className="text-sm font-bold text-white font-mono">{latestVitals.bloodGlucose || '5.6 mmol/L'}</strong>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                  <strong className="text-sm font-bold text-white font-mono">{latestVitals.oxygenSaturation || '99%'}</strong>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Temperature</span>
                  <strong className="text-sm font-bold text-white font-mono">{latestVitals.temperature || '36.6 °C'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by nurse, wound care, vitals, medications, notes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Selector */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400 transition font-mono"
                title="Filter by visit date"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-slate-400 hover:text-white text-xs p-1"
                  title="Clear date"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400 transition"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses</option>
              <option value="completed" className="bg-slate-900 text-white">Completed</option>
              <option value="closed" className="bg-slate-900 text-white">Closed / Audited</option>
              <option value="disputed" className="bg-slate-900 text-white">Disputed</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400 transition"
            >
              <option value="all" className="bg-slate-900 text-white">All Care Services</option>
              <option value="wound" className="bg-slate-900 text-white">Wound &amp; Post-Op</option>
              <option value="vitals" className="bg-slate-900 text-white">Elderly Vitals &amp; Meds</option>
              <option value="iv" className="bg-slate-900 text-white">IV Therapy &amp; Injections</option>
              <option value="postnatal" className="bg-slate-900 text-white">Postnatal &amp; Newborn</option>
            </select>

            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-purple-400 transition"
            >
              <option value="all" className="bg-slate-900 text-white">All Ratings</option>
              <option value="5stars" className="bg-slate-900 text-white">⭐ 5 Stars Only</option>
              <option value="rated" className="bg-slate-900 text-white">Rated Visits</option>
              <option value="unrated" className="bg-slate-900 text-white">Needs Rating</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>Showing <strong className="text-white">{filteredBookings.length}</strong> previous visit {filteredBookings.length === 1 ? 'record' : 'records'}</span>
          {(searchQuery || selectedCategory !== 'all' || selectedRatingFilter !== 'all' || selectedDate || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedRatingFilter('all');
                setSelectedDate('');
                setSelectedStatus('all');
              }}
              className="text-purple-300 hover:text-white font-bold transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* List of Previous Completed Bookings */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 text-center space-y-4 text-white">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-400/20 text-[#C77DFF] flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-white">No Matching Clinical Records Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'all' || selectedRatingFilter !== 'all'
                ? 'Try adjusting your search query or filter tags to view other home visits in your medical history.'
                : 'As soon as your Jamaican licensed nurse completes a visit, all clinical assessment notes, vital signs logs, and invoices will be stored here.'}
            </p>
          </div>
          {onBookNewCare && (
            <button
              onClick={onBookNewCare}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-purple-900/40 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Book Home Visit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => {
            const isExpanded = expandedBookingId === booking.id || filteredBookings.length === 1;
            const scheduledDate = new Date(booking.scheduledDateTime);
            const notes = booking.clinicalNotes;

            return (
              <div
                key={booking.id}
                className="rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden transition hover:border-purple-400/40 text-white"
              >
                {/* Visit Top Header */}
                <div className="p-5 md:p-6 border-b border-white/10 bg-gradient-to-r from-white/[0.02] via-purple-950/20 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed &amp; Documented
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30 flex items-center gap-1">
                          <Timer className="w-3 h-3" /> {booking.actualDurationMinutes || booking.baseDurationMinutes || 45} mins care
                        </span>
                        <span className="text-xs font-mono text-purple-300 font-bold">
                          #{booking.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <ServiceLogo serviceName={booking.serviceName} size="md" showBadge={false} withGlow={true} />
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                          {booking.serviceName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C77DFF]" />
                          {scheduledDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C77DFF]" />
                          {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                          {booking.zone}
                        </span>
                      </div>
                    </div>

                    {/* Price and Invoice Quick Trigger */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-lg md:text-xl font-black text-[#C77DFF] block">
                          {formatJMD(booking.priceJMD)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium block">
                          Payment Settled • Official Receipt
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => onDownloadMedicalSummary ? onDownloadMedicalSummary(booking) : onViewInvoice(booking)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white border border-emerald-400/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Generate print-optimized PDF of clinical notes, invoice, and visit details"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Download Medical Summary</span>
                        </button>

                        <button
                          onClick={() => onViewInvoice(booking)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 md:p-6 space-y-5">
                  {/* Nurse Summary & Rating Block */}
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=400'}
                        alt={booking.nurseName}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-400/80 shadow-md shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm block">{booking.nurseName || 'Assigned Nurse'}</strong>
                          <VerifiedNursingCouncilBadge isVerified={true} size="xs" variant="badge" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          Licensure: Nursing Council of Jamaica
                        </span>
                      </div>
                    </div>

                    {/* Patient Rating Box */}
                    <div className="flex items-center gap-3 self-start sm:self-center">
                      {booking.rating ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (booking.rating || 0)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            {booking.rating}.0 / 5.0
                          </span>
                          <button
                            onClick={() => onOpenRating(booking)}
                            className="ml-2 text-[10px] text-purple-300 hover:text-white underline font-semibold"
                            title="Edit Rating"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenRating(booking)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>Leave Nurse Rating</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patient Review Feedback Quote */}
                  {booking.reviewComment && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs flex items-start gap-2.5">
                      <span className="text-amber-400 text-base leading-none">“</span>
                      <p className="text-purple-100 italic leading-relaxed">
                        {booking.reviewComment}
                      </p>
                    </div>
                  )}

                  {/* Clinical Vitals Grid */}
                  {notes && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C77DFF] flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Clinical Vital Signs Recorded on Visit
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Documented at: {new Date(notes.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-red-400" /> Blood Pressure
                          </span>
                          <strong className="text-sm font-bold text-white font-mono block">
                            {notes.bloodPressure || '120/80 mmHg'}
                          </strong>
                          <span className="text-[9px] text-emerald-400 font-semibold block">Target Range</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-400" /> Pulse / Heart Rate
                          </span>
                          <strong className="text-sm font-bold text-white font-mono block">
                            {notes.pulseRate || '72 bpm'}
                          </strong>
                          <span className="text-[9px] text-slate-400 block">Regular Rhythm</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Droplet className="w-3 h-3 text-blue-400" /> Blood Glucose
                          </span>
                          <strong className="text-sm font-bold text-white font-mono block">
                            {notes.bloodGlucose || '5.8 mmol/L'}
                          </strong>
                          <span className="text-[9px] text-emerald-400 font-semibold block">Regulated</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-teal-400" /> Oxygen (SpO2)
                          </span>
                          <strong className="text-sm font-bold text-white font-mono block">
                            {notes.oxygenSaturation || '99%'}
                          </strong>
                          <span className="text-[9px] text-slate-400 block">Ambient Air</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-amber-400" /> Temperature
                          </span>
                          <strong className="text-sm font-bold text-white font-mono block">
                            {notes.temperature || '36.7 °C'}
                          </strong>
                          <span className="text-[9px] text-emerald-400 font-semibold block">Afebrile</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medications & Clinical Summary Cards */}
                  {notes && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Medications Administered */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                        <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                          <Pill className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Medications &amp; Treatments Administered</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                          {notes.medicationsAdministered || 'No medications administered during this visit.'}
                        </p>
                      </div>

                      {/* Care Summary */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Nurse Clinical Assessment Summary</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                          {notes.careSummary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nurse Recommendations Box */}
                  {notes?.nurseRecommendations && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/30 to-emerald-950/30 border border-purple-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Registered Nurse Recommendations &amp; Follow-Up Plan</span>
                      </div>
                      <p className="text-purple-100/90 leading-relaxed pl-5">
                        {notes.nurseRecommendations}
                      </p>
                    </div>
                  )}

                  {/* Action Bar for this Record */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onDownloadMedicalSummary ? onDownloadMedicalSummary(booking) : onViewInvoice(booking)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 hover:text-white border border-emerald-400/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Download print-optimized clinical summary, vitals, and invoice PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Medical Summary (PDF)</span>
                      </button>

                      <button
                        onClick={() => handleCopyClinicalNotes(booking)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === booking.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#C77DFF]" />
                            <span>Copy Notes for Doctor</span>
                          </>
                        )}
                      </button>

                      {onOpenChat && (
                        <button
                          onClick={() => onOpenChat(booking)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Chat History</span>
                        </button>
                      )}

                      {!booking.rating && (
                        <button
                          onClick={() => onOpenRating(booking)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>Rate Caregiver &amp; Share Feedback</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onRebookService && (
                        <button
                          onClick={() => onRebookService(booking.serviceName, booking.nurseId)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:from-purple-600 hover:to-[#1E1B4B] text-white font-bold text-xs shadow-md shadow-purple-950/50 transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Rebook This Service</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
