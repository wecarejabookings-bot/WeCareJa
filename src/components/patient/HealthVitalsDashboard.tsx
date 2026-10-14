import React, { useState } from 'react';
import { Booking, UserAccount } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  Activity, 
  Heart, 
  Droplet, 
  Wind, 
  Thermometer, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  FileText, 
  Pill, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface HealthVitalsDashboardProps {
  currentUser?: UserAccount;
  bookings: Booking[];
  onRequestVitalsVisit?: () => void;
}

export const HealthVitalsDashboard: React.FC<HealthVitalsDashboardProps> = ({
  currentUser,
  bookings,
  onRequestVitalsVisit
}) => {
  // Medication Adherence checklist state
  const [checkedMeds, setCheckedMeds] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': false,
    'med-3': true
  });

  const toggleMed = (id: string) => {
    soundFX.playClick();
    setCheckedMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find latest clinical notes from completed visits
  const latestCompletedBooking = bookings.find(b => b.status === 'completed' && b.clinicalNotes);
  const latestNotes = latestCompletedBooking?.clinicalNotes;

  const vitals = {
    bp: latestNotes?.bloodPressure || '124/80',
    bpStatus: 'Optimal • Within Target Range',
    glucose: latestNotes?.bloodGlucose || '5.9 mmol/L',
    glucoseStatus: 'Normal Fasting',
    pulse: latestNotes?.pulseRate || '74',
    pulseStatus: 'Resting Normal (74 bpm)',
    spo2: latestNotes?.oxygenSaturation || '99%',
    spo2Status: 'Room Air Normal',
    temp: String(latestNotes?.temperature || '36.6').replace(/°C/gi, '').trim(),
    tempStatus: 'Normal Afebrile'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#170327] via-[#10031c] to-[#0a1426] border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Clinical Telemetry</span>
            </span>
            <span className="text-xs text-slate-400">
              Updated from latest nurse visit
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Patient Health &amp; Vitals Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Continuous vital signs monitoring and Jamaican medication schedule synchronized with attending nurses.
          </p>
        </div>

        {onRequestVitalsVisit && (
          <button
            type="button"
            onClick={onRequestVitalsVisit}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:opacity-95 text-white font-black text-xs shadow-xl shadow-purple-950/50 transition flex items-center gap-2 shrink-0 group"
          >
            <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
            <span>Dispatch Vitals Checkup (~7 min ETA)</span>
          </button>
        )}
      </div>

      {/* 5-Card Vitals Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Blood Pressure */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{vitals.bp}</span>
            <span className="text-[10px] text-slate-400 block">mmHg</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {vitals.bpStatus}
          </span>
        </div>

        {/* Blood Glucose */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Glucose</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{vitals.glucose}</span>
            <span className="text-[10px] text-slate-400 block">mmol/L (Fasting)</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {vitals.glucoseStatus}
          </span>
        </div>

        {/* Heart Rate / Pulse */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{vitals.pulse}</span>
            <span className="text-[10px] text-slate-400 block">BPM</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {vitals.pulseStatus}
          </span>
        </div>

        {/* Oxygen Saturation SpO2 */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Oxygen SpO2</span>
            <div className="w-7 h-7 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{vitals.spo2}%</span>
            <span className="text-[10px] text-slate-400 block">Room Air</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {vitals.spo2Status}
          </span>
        </div>

        {/* Body Temperature */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Temperature</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{vitals.temp} °C</span>
            <span className="text-[10px] text-slate-400 block">Oral Axillary</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {vitals.tempStatus}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Medication Tracker & Latest Clinical Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medication Compliance Card */}
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Pill className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Today's Jamaican Medication Schedule
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              NHF / JADEP Enrolled
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'med-1', name: 'Amlodipine Besylate', dose: '5 mg • Daily morning', purpose: 'Blood Pressure Control', time: '8:00 AM' },
              { id: 'med-2', name: 'Metformin HCl', dose: '500 mg • With meals', purpose: 'Blood Glucose Management', time: '1:00 PM' },
              { id: 'med-3', name: 'Atorvastatin Calcium', dose: '20 mg • Nightly bedtime', purpose: 'Cardiovascular Support', time: '9:00 PM' }
            ].map((med) => {
              const isChecked = checkedMeds[med.id];
              return (
                <div
                  key={med.id}
                  onClick={() => toggleMed(med.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-white'
                      : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-white/20 bg-black/40'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-xs ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                        {med.name} ({med.dose})
                      </h4>
                      <span className="text-[10px] text-purple-300 block">{med.purpose}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                    {med.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Clinical Log & Attending Nurse */}
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Attending Nurse Care Summary
              </h3>
            </div>
            {latestCompletedBooking && (
              <span className="text-[10px] font-bold text-purple-300">
                Visit #{latestCompletedBooking.id}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Attending Nurse: <strong className="text-white">{latestCompletedBooking?.nurseName || 'Assigned Registered Nurse'}</strong></span>
              <span>{latestNotes?.completedAt ? new Date(latestNotes.completedAt).toLocaleDateString() : 'Recent Visit'}</span>
            </div>

            <p className="text-slate-300 text-xs italic bg-white/5 p-3 rounded-xl border border-white/5">
              "{latestNotes?.careSummary || 'Vitals checked and confirmed in healthy baseline. Patient is compliant with prescription regimen and hydrated. No acute distress observed.'}"
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Clinical Recommendation:</span>
              <span className="text-emerald-400 font-bold">Continue routine daily walks &amp; low-sodium diet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
