import React, { useState } from 'react';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Users, 
  Phone, 
  ShieldCheck, 
  Info,
  Calendar,
  Activity,
  User
} from 'lucide-react';
import { Booking, PatientMedication, TrustedFamilyMember, ClientPatientBioData } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface PatientMedicationReminderCardProps {
  booking: Booking;
  patientBio?: ClientPatientBioData;
  onLogMedicationAdministered?: (medicationId: string, medName: string) => void;
}

export const PatientMedicationReminderCard: React.FC<PatientMedicationReminderCardProps> = ({
  booking,
  patientBio,
  onLogMedicationAdministered
}) => {
  // Use only explicitly recorded booking/patient bio data (no invented illnesses, allergies, or medications)
  const bio: Partial<ClientPatientBioData> = booking.patientBioData || patientBio || {
    knownIllnesses: booking.knownIllnesses || [],
    allergies: booking.allergies || [],
    medications: booking.patientMedications || [],
    trustedFamilyMember: booking.clientEmergencyContact?.name ? {
      name: booking.clientEmergencyContact.name,
      relation: booking.clientEmergencyContact.relation || '',
      phone: booking.clientEmergencyContact.phone || '',
      photoUrl: '',
      canManageCare: true
    } : undefined
  };

  const [administeredMeds, setAdministeredMeds] = useState<Record<string, boolean>>({});

  const handleAdminister = (med: PatientMedication) => {
    setAdministeredMeds(prev => ({ ...prev, [med.id]: true }));
    soundFX.playSuccessPing();
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
    if (onLogMedicationAdministered) {
      onLogMedicationAdministered(med.id, med.name);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black/50 to-[#0e0219] border border-purple-500/30 space-y-4 text-white shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {booking.clientPhotoUrl ? (
            <img loading="lazy" decoding="async"
              src={booking.clientPhotoUrl}
              alt={booking.clientName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-purple-900/60 border-2 border-purple-400/50 flex items-center justify-center text-purple-200 shadow-md">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-base">{booking.clientName}</h4>
              {(bio.age || bio.bloodType) && (
                <span className="text-[10px] bg-purple-500/20 text-purple-200 font-bold px-2 py-0.5 rounded-full">
                  {[bio.age ? `${bio.age} yrs` : null, bio.bloodType || null].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200 flex items-center gap-1">
              {booking.zone && <><span>{booking.zone}</span> • </>}<span className="text-emerald-400 font-semibold">{booking.serviceName}</span>
            </p>
          </div>
        </div>

        {/* Live Reminder Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shrink-0">
          <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Medication &amp; Care Requirements Active</span>
        </div>
      </div>

      {/* Known Illnesses & Allergies Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Conditions */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Known Illnesses &amp; Conditions
          </span>
          <div className="flex flex-wrap gap-1">
            {(bio?.knownIllnesses?.length || 0) > 0 ? (
              (bio?.knownIllnesses || []).map((ill, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[11px] font-semibold">
                  {ill}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs">None reported.</span>
            )}
          </div>
        </div>

        {/* Allergies Alert */}
        <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-1.5">
          <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" /> Critical Allergies
          </span>
          <div className="flex flex-wrap gap-1">
            {(bio?.allergies?.length || 0) > 0 ? (
              (bio?.allergies || []).map((alg, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg bg-red-500/30 text-red-200 border border-red-400/40 text-[11px] font-black">
                  ⚠️ {alg}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs">No known drug allergies.</span>
            )}
          </div>
        </div>
      </div>

      {/* Medication Reminder Clock & Schedule */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scheduled Patient Medications ({(bio?.medications || []).length})</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to confirm administration</span>
        </div>

        <div className="space-y-2">
          {(bio?.medications?.length || 0) > 0 ? (
            (bio?.medications || []).map(med => {
              const isAdministered = administeredMeds[med.id] || med.administeredToday;
              return (
                <div
                  key={med.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 text-xs ${
                    isAdministered
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-white/[0.04] border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm">{med.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                        {med.dosage}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {med.scheduledTime}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <span>Time of Day: <strong className="text-purple-200 capitalize">{med.timesOfDay?.join(', ')}</strong></span>
                      {med.instructions && <span> • {med.instructions}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdminister(med)}
                    disabled={isAdministered}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
                      isAdministered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-[#7209B7] to-purple-600 hover:opacity-95 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAdministered ? 'Given & Logged' : 'Log Dose Given'}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-400 text-center">
              No specific prescription medications on file for this patient.
            </div>
          )}
        </div>
      </div>

      {/* Trusted Family Member Contact Bar */}
      {bio.trustedFamilyMember && (
        <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {bio.trustedFamilyMember.photoUrl ? (
              <img loading="lazy" decoding="async"
                src={bio.trustedFamilyMember.photoUrl}
                alt={bio.trustedFamilyMember.name}
                className="w-8 h-8 rounded-lg object-cover border border-emerald-400 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="font-bold text-white block leading-none">{bio.trustedFamilyMember.name}</span>
              {bio.trustedFamilyMember.relation && (
                <span className="text-[10px] text-purple-300 font-semibold">
                  Trusted Guardian ({bio.trustedFamilyMember.relation})
                </span>
              )}
            </div>
          </div>

          {bio.trustedFamilyMember.phone && (
            <a
              href={`tel:${bio.trustedFamilyMember.phone}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call Guardian</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
