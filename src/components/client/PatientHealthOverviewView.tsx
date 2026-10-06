import React, { useState, useMemo } from 'react';
import { 
  UserAccount, 
  Booking, 
  ServiceItem, 
  NurseProfile, 
  LogoVariation 
} from '../../types';
import { VisualMedicationSchedule } from './VisualMedicationSchedule';
import { 
  Activity, 
  Pill, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Phone, 
  QrCode, 
  ChevronRight, 
  Stethoscope, 
  Droplet, 
  Thermometer, 
  Flame,
  Plus
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { getArrivalPassCode } from '../../utils/arrivalVerification';

export interface PatientHealthOverviewViewProps {
  currentUser?: UserAccount | null;
  bookings: Booking[];
  services: ServiceItem[];
  nurses: NurseProfile[];
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onRequestNewVisit: () => void;
  onOpenChat?: (booking: Booking) => void;
  onOpenArrivalQR?: (booking: Booking) => void;
  onViewBookingDetails?: (booking: Booking) => void;
  onNavigateToHistory?: () => void;
  logoVariation?: LogoVariation;
}

export const PatientHealthOverviewView: React.FC<PatientHealthOverviewViewProps> = ({
  currentUser,
  bookings,
  services,
  nurses,
  onUpdateUser,
  onRequestNewVisit,
  onOpenChat,
  onOpenArrivalQR,
  onViewBookingDetails,
  onNavigateToHistory,
  logoVariation = 'crest'
}) => {
  // Sub-view toggle: 'all' | 'medications' | 'timeline' | 'appointments'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'medications' | 'timeline' | 'appointments'>('overview');

  // Filter client bookings
  const clientBookings = useMemo(() => {
    if (!currentUser) return bookings;
    return bookings.filter(b => 
      b.clientId === currentUser.id || 
      b.clientName.toLowerCase() === currentUser.name.toLowerCase() ||
      b.clientPhone === currentUser.phone
    );
  }, [bookings, currentUser]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return clientBookings.filter(b => 
      ['pending', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)
    ).sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime());
  }, [clientBookings]);

  // Completed visits for timeline
  const completedVisits = useMemo(() => {
    return clientBookings.filter(b => 
      ['completed', 'closed'].includes(b.status)
    ).sort((a, b) => new Date(b.scheduledDateTime).getTime() - new Date(a.scheduledDateTime).getTime());
  }, [clientBookings]);

  // Patient bio data
  const bio = currentUser?.patientBioData || currentUser?.bioData || {
    age: 72,
    gender: 'female',
    bloodType: 'O+',
    knownIllnesses: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Sulfa'],
    mobilityStatus: 'needs_cane_walker',
    residentialAddress: '14 Trafalgar Road, Kingston 5',
    zone: 'New Kingston'
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      {/* 1. TOP HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                Personalized Care Portal
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Patient: {currentUser?.name || 'Mrs. Marjorie Campbell'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white">
              Personalized Health & Care Overview
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Real-time monitoring of your daily medication schedule, clinical timeline, and verified upcoming bedside nursing appointments in Kingston, Portmore & Spanish Town.
            </p>
          </div>

          {/* Quick Sub-Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0">
            {[
              { id: 'overview', label: 'Full Overview', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
              { id: 'medications', label: 'Med Schedule', icon: <Pill className="w-4 h-4 text-indigo-400" /> },
              { id: 'appointments', label: `Visits (${upcomingAppointments.length})`, icon: <Calendar className="w-4 h-4 text-amber-400" /> },
              { id: 'timeline', label: 'Care Timeline', icon: <Clock className="w-4 h-4 text-blue-400" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playTabSwitch();
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Patient Health Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blood Type</span>
            <span className="text-sm font-black text-rose-400 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5" /> {bio.bloodType || 'O+'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Known Allergies</span>
            <span className="text-xs font-bold text-amber-300 truncate block">
              {(bio.allergies || ['Penicillin']).join(', ')}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Diagnoses</span>
            <span className="text-xs font-bold text-indigo-300 truncate block">
              {(bio.knownIllnesses || ['Hypertension']).join(', ')}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobility Status</span>
            <span className="text-xs font-bold text-emerald-300 capitalize truncate block">
              {bio.mobilityStatus ? bio.mobilityStatus.replace(/_/g, ' ') : 'Independent'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. UPCOMING APPOINTMENTS SECTION (if overview or appointments) */}
      {(activeSubTab === 'overview' || activeSubTab === 'appointments') && (
        <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Upcoming Care Appointments</h3>
                <div className="text-xs text-slate-400">Scheduled home nurse visits & doorstep clinical services</div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playTabSwitch();
                onRequestNewVisit();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Visit</span>
            </button>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAppointments.map(booking => {
                const passCode = getArrivalPassCode(booking);
                const visitTime = new Date(booking.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-indigo-500/30 transition shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {booking.serviceName}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {new Date(booking.scheduledDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at {visitTime}
                        </h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        booking.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' :
                        booking.status === 'en_route' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Caregiver: <strong className="text-white">{booking.nurseName || 'Assigned NCJ Nurse'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Location: {booking.clientAddress}</span>
                      </div>
                    </div>

                    {/* Doorstep arrival PIN pass */}
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Doorstep PIN Pass</span>
                        <span className="font-mono text-base font-black text-amber-300 tracking-widest">{passCode}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenArrivalQR && (
                          <button
                            onClick={() => onOpenArrivalQR(booking)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 cursor-pointer"
                            title="Show Doorstep QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-indigo-300" />
                          </button>
                        )}
                        {onOpenChat && (
                          <button
                            onClick={() => onOpenChat(booking)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1 cursor-pointer"
                            title="Message Caregiver"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 space-y-2">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Upcoming Bedside Visits Scheduled</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need routine wound care, medication assistance, or elderly vitals monitoring? Book a certified Jamaican nurse now.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. VISUAL MEDICATION SCHEDULE SUB-COMPONENT */}
      {(activeSubTab === 'overview' || activeSubTab === 'medications') && (
        <VisualMedicationSchedule
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onNavigateToBooking={onRequestNewVisit}
        />
      )}

      {/* 4. CARE TIMELINE SECTION (if overview or timeline) */}
      {(activeSubTab === 'overview' || activeSubTab === 'timeline') && (
        <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Patient Care Timeline</h3>
                <div className="text-xs text-slate-400">Chronological history of completed visits, vital signs, and therapy milestones</div>
              </div>
            </div>

            {onNavigateToHistory && (
              <button
                onClick={() => {
                  soundFX.playTabSwitch();
                  onNavigateToHistory();
                }}
                className="text-xs font-bold text-indigo-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Full History</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Timeline Feed Items */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-blue-500 before:to-transparent">
            {completedVisits.slice(0, 5).map((visit) => (
              <div key={visit.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#0F172A] border-2 border-indigo-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition shadow-sm space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{visit.serviceName}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        Completed
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(visit.scheduledDateTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Attended by <strong className="text-white">{visit.nurseName || 'Verified Jamaican Nurse'}</strong> • Duration: {visit.baseDurationMinutes || 45} mins
                  </div>

                  {visit.clinicalNotes?.careSummary && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                      "{visit.clinicalNotes.careSummary}"
                    </div>
                  )}

                  {visit.clinicalNotes && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300">
                      {visit.clinicalNotes.bloodPressure && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          BP: {visit.clinicalNotes.bloodPressure}
                        </span>
                      )}
                      {visit.clinicalNotes.pulseRate && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          HR: {visit.clinicalNotes.pulseRate}
                        </span>
                      )}
                      {visit.clinicalNotes.bloodGlucose && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          Glucose: {visit.clinicalNotes.bloodGlucose}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {completedVisits.length === 0 && (
              <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-slate-400">
                Care timeline entries will automatically populate as your home nurse visits and vitals telemetry checks are concluded.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
