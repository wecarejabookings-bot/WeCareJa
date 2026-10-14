import React, { useState, useEffect } from 'react';
import { PatientMedication, UserAccount } from '../../types';
import { Pill, Bell, CheckCircle2, Clock, Volume2, X, AlertCircle, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface MedicationPushAlertBannerProps {
  user: UserAccount | null;
  onMarkMedicationTaken?: (medId: string) => void;
}

export const MedicationPushAlertBanner: React.FC<MedicationPushAlertBannerProps> = ({
  user,
  onMarkMedicationTaken
}) => {
  const [activeAlert, setActiveAlert] = useState<{
    med: PatientMedication;
    minutesLeft: number;
    timestamp: string;
  } | null>(null);

  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(15);
  const [isDismissed, setIsDismissed] = useState(false);

  const medications = user?.bioData?.medications || user?.patientBioData?.medications || [];

  // Function to trigger push alert simulation
  const triggerPushSimulation = (targetMed?: PatientMedication) => {
    const med: PatientMedication = targetMed || medications[0] || {
      id: 'demo-med',
      name: 'Amlodipine Besylate',
      dosage: '5mg oral tablet',
      scheduledTime: '08:00 AM',
      timesOfDay: ['morning'],
      instructions: 'Take 1 tablet with full glass of water before breakfast.'
    };

    soundFX.playMedicationPushAlert();

    setActiveAlert({
      med,
      minutesLeft: 15,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setIsDismissed(false);

    // Also trigger browser Web Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ 15-Min Medication Reminder: ${med.name}`, {
          body: `Due in 15 minutes at ${med.scheduledTime}. ${med.instructions || 'Please take with water.'}`,
          icon: '/icon.png',
          tag: 'medication-alert'
        });
      } catch {}
    }
  };

  const handleTakeMedication = () => {
    if (activeAlert) {
      if (onMarkMedicationTaken) {
        onMarkMedicationTaken(activeAlert.med.id);
      }
      soundFX.playSuccessPing();
      setActiveAlert(null);
    }
  };

  const handleSnooze = () => {
    soundFX.playToggleClick();
    setActiveAlert(null);
    setTimeout(() => {
      if (activeAlert) {
        soundFX.playMedicationPushAlert();
        setActiveAlert(prev => prev ? { ...prev, minutesLeft: 10 } : null);
      }
    }, 5000);
  };

  if (!activeAlert || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/95 via-[#180829]/95 to-emerald-950/95 border-2 border-purple-400/60 shadow-2xl backdrop-blur-2xl text-white space-y-3">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Push Alert • 15 Min Warning
                </span>
                <span className="text-[10px] text-purple-300 font-mono">
                  {activeAlert.timestamp}
                </span>
              </div>
              <h4 className="font-black text-sm text-white mt-0.5">
                Medication Due in {activeAlert.minutesLeft} Minutes
              </h4>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Medication Card Details */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-400" />
              {activeAlert.med.name} {activeAlert.med.dosage && `(${activeAlert.med.dosage})`}
            </span>
            <span className="text-[11px] font-mono text-purple-300 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due at {activeAlert.med.scheduledTime}
            </span>
          </div>

          {activeAlert.med.instructions && (
            <p className="text-[11px] text-slate-300 leading-snug pt-1">
              📝 {activeAlert.med.instructions}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => soundFX.playMedicationPushAlert()}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-[11px] font-bold transition flex items-center gap-1 border border-white/10"
            title="Replay Audio Chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Replay Chime</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSnooze}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
            >
              Snooze
            </button>

            <button
              onClick={handleTakeMedication}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Taken</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
