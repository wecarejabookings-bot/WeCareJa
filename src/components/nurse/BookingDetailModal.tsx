import React, { useState, useEffect } from 'react';
import { 
  Booking, 
  ClinicalNotes, 
  VisitUpdateLog,
  VisitQRAction
} from '../../types';
import { 
  X, 
  Activity, 
  FileText, 
  Mic, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Pill, 
  User, 
  DollarSign, 
  CheckCircle2, 
  QrCode, 
  MessageSquare, 
  Video, 
  ShieldAlert, 
  Save, 
  Plus, 
  Sparkles,
  Heart,
  Timer,
  LogOut,
  WifiOff,
  Database,
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import { VoiceToTextClinicalRecorder } from './VoiceToTextClinicalRecorder';
import { ClinicalVoiceNotesInput } from './ClinicalVoiceNotesInput';
import { ServiceLogo } from '../common/ServiceLogo';
import { PPESafetyNotice, PPEReadyBadge } from '../common/PPESafetyNotice';
import { ArrivalDoorbellAlertButton } from '../common/ArrivalDoorbellAlertButton';
import { NotifyArrivalButton } from './NotifyArrivalButton';
import { NavigateToLocationButton } from '../common/NavigateToLocationButton';
import { soundFX } from '../../utils/soundEffects';
import { ActivityNotificationType } from '../../types';
import {
  isNetworkOnline,
  enqueueOfflineAction,
  saveDraftClinicalNotes,
  getDraftClinicalNotes,
  clearDraftClinicalNotes
} from '../../utils/offlineSyncManager';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  currentNurseName?: string;
  onSaveClinicalNotes: (bookingId: string, updatedNotes: ClinicalNotes, visitUpdates?: VisitUpdateLog[]) => void;
  onOpenChat?: (booking: Booking) => void;
  onOpenVideoCall?: (name: string, role: string, title: string) => void;
  onOpenArrivalQRScan?: (booking: Booking, initialMode?: VisitQRAction) => void;
  onOpenCloseoutModal?: (booking: Booking) => void;
  onOpenBiometricScan?: (booking: Booking) => void;
  onDownloadMedicalSummary?: (booking: Booking) => void;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  currentNurseName = 'Registered Nurse',
  onSaveClinicalNotes,
  onOpenChat,
  onOpenVideoCall,
  onOpenArrivalQRScan,
  onOpenCloseoutModal,
  onOpenBiometricScan,
  onDownloadMedicalSummary,
  onUpdateBookingStatus,
  onTriggerNotification
}) => {
  if (!isOpen || !booking) return null;

  const [activeTab, setActiveTab] = useState<'clinical_notes' | 'patient_info' | 'billing'>('clinical_notes');

  // Clinical Vitals & Notes state
  const [bp, setBp] = useState(booking.clinicalNotes?.bloodPressure || '120/80 mmHg');
  const [pulse, setPulse] = useState(booking.clinicalNotes?.pulseRate || '72 bpm');
  const [glucose, setGlucose] = useState(booking.clinicalNotes?.bloodGlucose || '5.6 mmol/L');
  const [spo2, setSpo2] = useState(booking.clinicalNotes?.oxygenSaturation || '98%');
  const [temp, setTemp] = useState(booking.clinicalNotes?.temperature || '36.7 °C');
  const [medsAdministered, setMedsAdministered] = useState(booking.clinicalNotes?.medicationsAdministered || '');
  const [careSummary, setCareSummary] = useState(booking.clinicalNotes?.careSummary || '');
  const [recommendations, setRecommendations] = useState(booking.clinicalNotes?.nurseRecommendations || '');

  // Visit updates state (timeline logs)
  const [visitUpdates, setVisitUpdates] = useState<VisitUpdateLog[]>(
    booking.visitUpdates || booking.clinicalNotes?.visitUpdates || [
      {
        id: 'upd-init-1',
        timestamp: booking.visitStartedAt || booking.scheduledDateTime,
        nurseName: currentNurseName,
        text: `Arrived on-site in ${booking.zone}. Initial patient evaluation initiated.`,
        category: 'general',
        recordedViaVoice: false
      }
    ]
  );

  const [newUpdateText, setNewUpdateText] = useState('');
  const [newUpdateCategory, setNewUpdateCategory] = useState<VisitUpdateLog['category']>('general');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [draftLoadedNotice, setDraftLoadedNotice] = useState(false);

  // Sync state if booking changes or draft is restored
  useEffect(() => {
    if (booking) {
      // Check for saved local draft first
      const draft = getDraftClinicalNotes(booking.id);
      if (draft && draft.notes) {
        setBp(draft.notes.bloodPressure || booking.clinicalNotes?.bloodPressure || booking.biometricScan?.estimatedBloodPressure || '120/80 mmHg');
        setPulse(draft.notes.pulseRate || booking.clinicalNotes?.pulseRate || '72 bpm');
        setGlucose(draft.notes.bloodGlucose || booking.clinicalNotes?.bloodGlucose || '5.6 mmol/L');
        setSpo2(draft.notes.oxygenSaturation || booking.clinicalNotes?.oxygenSaturation || '98%');
        setTemp(draft.notes.temperature || booking.clinicalNotes?.temperature || '36.7 °C');
        setMedsAdministered(draft.notes.medicationsAdministered || booking.clinicalNotes?.medicationsAdministered || '');
        setCareSummary(draft.notes.careSummary || booking.clinicalNotes?.careSummary || '');
        setRecommendations(draft.notes.nurseRecommendations || booking.clinicalNotes?.nurseRecommendations || '');
        setDraftLoadedNotice(true);
      } else {
        setBp(booking.clinicalNotes?.bloodPressure || booking.biometricScan?.estimatedBloodPressure || booking.biometricScan?.bloodPressureEstimated || '120/80 mmHg');
        setPulse(booking.clinicalNotes?.pulseRate || (booking.biometricScan ? `${booking.biometricScan.heartRateBpm} bpm` : '72 bpm'));
        setGlucose(booking.clinicalNotes?.bloodGlucose || '5.6 mmol/L');
        setSpo2(booking.clinicalNotes?.oxygenSaturation || (booking.biometricScan ? `${booking.biometricScan.bloodOxygenSpO2 || booking.biometricScan.bloodOxygenPercent}%` : '98%'));
        setTemp(booking.clinicalNotes?.temperature || '36.7 °C');
        setMedsAdministered(booking.clinicalNotes?.medicationsAdministered || '');
        setCareSummary(booking.clinicalNotes?.careSummary || '');
        setRecommendations(booking.clinicalNotes?.nurseRecommendations || '');
      }

      if ((booking?.visitUpdates?.length || 0) > 0) {
        setVisitUpdates(booking?.visitUpdates || []);
      }
    }
  }, [booking]);

  const handleSaveNotes = () => {
    const updatedNotes: ClinicalNotes = {
      bloodPressure: bp,
      pulseRate: pulse,
      bloodGlucose: glucose,
      oxygenSaturation: spo2,
      temperature: temp,
      medicationsAdministered: medsAdministered || 'None recorded',
      careSummary: careSummary || 'Visit conducted according to protocol.',
      nurseRecommendations: recommendations || 'Routine follow-up advised.',
      completedAt: new Date().toISOString(),
      visitUpdates: visitUpdates
    };

    const online = isNetworkOnline();
    if (!online) {
      // Save locally to offline queue and draft storage
      saveDraftClinicalNotes(booking.id, updatedNotes);
      enqueueOfflineAction('save_clinical_notes', booking.id, {
        clinicalNotes: updatedNotes,
        visitUpdates: visitUpdates
      });
      onSaveClinicalNotes(booking.id, updatedNotes, visitUpdates);
      soundFX.playSuccessPing();
      setIsOfflineSaved(true);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 4500);
    } else {
      clearDraftClinicalNotes(booking.id);
      onSaveClinicalNotes(booking.id, updatedNotes, visitUpdates);
      soundFX.playSuccessPing();
      setIsOfflineSaved(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    }
  };

  const handleAddVisitUpdate = (textToAdd?: string, fromVoice = false) => {
    const text = (textToAdd || newUpdateText).trim();
    if (!text) return;

    const newLog: VisitUpdateLog = {
      id: `upd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      nurseName: currentNurseName,
      text: text,
      category: newUpdateCategory,
      recordedViaVoice: fromVoice,
      audioDurationSeconds: fromVoice ? 12 : undefined
    };

    const updatedList = [newLog, ...visitUpdates];
    setVisitUpdates(updatedList);
    setNewUpdateText('');

    // Persist immediately
    const updatedNotes: ClinicalNotes = {
      bloodPressure: bp,
      pulseRate: pulse,
      bloodGlucose: glucose,
      oxygenSaturation: spo2,
      temperature: temp,
      medicationsAdministered: medsAdministered,
      careSummary: careSummary,
      nurseRecommendations: recommendations,
      completedAt: new Date().toISOString(),
      visitUpdates: updatedList
    };

    const online = isNetworkOnline();
    if (!online) {
      saveDraftClinicalNotes(booking.id, updatedNotes);
      enqueueOfflineAction('save_clinical_notes', booking.id, {
        clinicalNotes: updatedNotes,
        visitUpdates: updatedList
      });
    }

    onSaveClinicalNotes(booking.id, updatedNotes, updatedList);
    soundFX.playVisitCompleted();
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0c0314]/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#140622]/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/15 text-white flex flex-col">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4 sticky top-0 bg-[#140622]/95 backdrop-blur-md z-10">
          <div className="flex items-start gap-3.5">
            <ServiceLogo serviceName={booking.serviceName} size="md" showBadge={false} withGlow={true} />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/25 text-purple-300 border border-purple-400/30">
                  #{booking.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  booking.status === 'in_progress' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : booking.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  Status: {String(booking.status || 'requested').replace('_', ' ')}
                </span>
                {booking.arrivalVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Arrival Verified (QR)</span>
                  </span>
                )}
                <PPEReadyBadge booking={booking} size="sm" />
                {(!isNetworkOnline() || booking.offlinePendingNotes) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Database className="w-3 h-3 text-amber-400" />
                    <span>Offline Sync Active</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white">{booking.serviceName}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-purple-300" />
                <span className="font-bold text-white">{booking.clientName}</span>
                <span className="text-slate-500">•</span>
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{booking.clientAddress} ({booking.zone})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavigateToLocationButton
              address={booking.clientAddress}
              zone={booking.zone}
              lat={booking.nurseLiveLat}
              lng={booking.nurseLiveLng}
              size="sm"
              variant="primary"
              label="Directions"
            />
            {(booking.status === 'accepted' || booking.status === 'en_route' || booking.status === 'in_progress') && (
              <>
                <NotifyArrivalButton
                  booking={booking}
                  currentNurseName={currentNurseName}
                  onUpdateBookingStatus={onUpdateBookingStatus}
                  onTriggerNotification={onTriggerNotification}
                  size="sm"
                />
                <ArrivalDoorbellAlertButton
                  booking={booking}
                  currentNurseName={currentNurseName}
                  onUpdateBookingStatus={onUpdateBookingStatus}
                  onTriggerNotification={onTriggerNotification}
                  variant="compact"
                />
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close booking detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 pt-2 border-b border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('clinical_notes');
            }}
            className={`px-3 py-1.5 rounded-t-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clinical_notes'
                ? 'bg-[#7209B7] text-white border-t border-x border-purple-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-300" />
            <span>Clinical Notes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('patient_info');
            }}
            className={`px-3 py-1.5 rounded-t-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'patient_info'
                ? 'bg-[#7209B7] text-white border-t border-x border-purple-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-purple-300" />
            <span>Patient &amp; Meds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playTabSwitch();
              setActiveTab('billing');
            }}
            className={`px-3 py-1.5 rounded-t-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[#7209B7] text-white border-t border-x border-purple-400/40 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Billing</span>
          </button>
        </div>

        {/* Offline Mode Alert Bar */}
        {!isNetworkOnline() && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Offline Mode: Clinical notes and updates are saved directly to <strong>localStorage</strong> and queued for auto-sync.</span>
            </div>
            {draftLoadedNotice && (
              <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                Draft Restored from Local Storage
              </span>
            )}
          </div>
        )}

        {/* Tab Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Confirmed Booking & Arrival PPE Mandate Reminder */}
          <PPESafetyNotice variant={booking.status === 'in_progress' ? 'on_arrival' : 'booking_confirmed'} userRole="nurse" />

          {/* TAB 1: CLINICAL NOTES & VOICE-TO-TEXT DICTATION */}
          {activeTab === 'clinical_notes' && (
            <div className="space-y-5">
              {/* Voice-To-Text Dictation Studio Card */}
              <div className="space-y-2">
                <VoiceToTextClinicalRecorder
                  targetFieldLabel="Visit Updates & Care Summary"
                  placeholder="Dictate live updates: e.g. 'Patient rested, vitals normal, sterile wound dressing changed with saline...'"
                  onAppendTranscript={(dictatedText) => {
                    // Automatically append to visit updates stream and care summary
                    handleAddVisitUpdate(dictatedText, true);
                    setCareSummary(prev => (prev ? prev.trim() + ' ' : '') + dictatedText);
                  }}
                />
              </div>

              {/* Timestamped Visit Updates Stream (Live Dictation Logs) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Visit Updates &amp; Dictated Logs Timeline
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {visitUpdates.length} {visitUpdates.length === 1 ? 'Update' : 'Updates'}
                  </span>
                </div>

                {/* Quick Add Custom Log */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUpdateText}
                    onChange={(e) => setNewUpdateText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVisitUpdate();
                      }
                    }}
                    placeholder="Type or dictate a quick visit update note..."
                    className="flex-1 p-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-xs placeholder:text-slate-500 focus:border-purple-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVisitUpdate()}
                    className="px-4 py-2.5 rounded-xl bg-[#7209B7] hover:bg-purple-600 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Log</span>
                  </button>
                </div>

                {/* Updates Timeline List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {visitUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 hover:border-purple-500/20 transition"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300">{update.nurseName}</span>
                          {update.recordedViaVoice && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 text-[9px] font-bold">
                              <Mic className="w-2.5 h-2.5" />
                              <span>Voice Dictated</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono">
                          {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{update.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals Form */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Patient Clinical Vitals
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenBiometricScan && (
                      <button
                        type="button"
                        onClick={() => onOpenBiometricScan(booking)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Open optical rPPG biometric camera scan"
                      >
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Biometric Health Scan</span>
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400">NCJ Standard Metrics</span>
                  </div>
                </div>

                {booking.biometricScan && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white">Biometric Scan Telemetry Linked</span>
                        <span className="text-slate-300 text-[11px] ml-2 font-mono">
                          HR: {booking.biometricScan.heartRateBpm} bpm • SpO2: {booking.biometricScan.bloodOxygenSpO2 || booking.biometricScan.bloodOxygenPercent}% • HRV: {booking.biometricScan.heartRateVariabilityMs}ms
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Confidence {booking.biometricScan.confidenceScore}%
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-400 block text-[10px] mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="120/80 mmHg"
                      className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block text-[10px] mb-1">Pulse Rate</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72 bpm"
                      className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block text-[10px] mb-1">Blood Glucose</label>
                    <input
                      type="text"
                      value={glucose}
                      onChange={(e) => setGlucose(e.target.value)}
                      placeholder="5.6 mmol/L"
                      className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block text-[10px] mb-1">Oxygen Saturation</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="98%"
                      className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block text-[10px] mb-1">Temperature</label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="36.7 °C"
                      className="w-full p-2 rounded-xl border border-white/15 bg-white/5 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Medications Administered with Microphone Dictation */}
              <ClinicalVoiceNotesInput
                label="Medications Administered During Visit"
                value={medsAdministered}
                onChange={setMedsAdministered}
                placeholder="e.g. Cleansed with sterile normal saline, applied silver sulfadiazine, oral paracetamol 500mg..."
                isTextarea={false}
                clinicalFieldType="medications"
                helperText="Dictate administered doses and wound preparations directly using microphone."
              />

              {/* Care Summary with Microphone Dictation */}
              <ClinicalVoiceNotesInput
                label="Clinical Care Summary"
                value={careSummary}
                onChange={setCareSummary}
                rows={3}
                isTextarea={true}
                placeholder="Detailed clinical findings, wound assessment, recovery progress..."
                clinicalFieldType="care_summary"
                helperText="Dictate real-time patient observations, vital reactions, and wound assessments."
              />

              {/* Nurse Recommendations with Microphone Dictation */}
              <ClinicalVoiceNotesInput
                label="Recommendations for Client & Family"
                value={recommendations}
                onChange={setRecommendations}
                rows={2}
                isTextarea={true}
                placeholder="e.g. Keep dressing clean and dry, maintain hydration, notify nurse if fever spikes..."
                clinicalFieldType="recommendations"
                helperText="Dictate homecare instructions, hydration advice, and follow-up warnings."
              />

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                {saveSuccessMsg ? (
                  isOfflineSaved ? (
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 animate-fadeIn">
                      <Database className="w-4 h-4 text-amber-400" />
                      Saved to localStorage (Offline). Auto-sync queued!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      Clinical notes and visit updates saved securely!
                    </span>
                  )
                ) : (
                  !isNetworkOnline() ? (
                    <span className="text-[11px] text-amber-300/90 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      Offline Mode active • Notes save to localStorage.
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Saved notes sync automatically with live records.
                    </span>
                  )
                )}

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Clinical Notes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT PROFILE & MEDS */}
          {activeTab === 'patient_info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Contact Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300">
                    Patient Contact &amp; Location
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p><strong className="text-white">Full Name:</strong> {booking.clientName}</p>
                    <p><strong className="text-white">Phone:</strong> {booking.clientPhone}</p>
                    <div>
                      <p><strong className="text-white">Address:</strong> {booking.clientAddress}</p>
                      <p><strong className="text-white">Parish / Zone:</strong> {booking.zone}</p>
                    </div>
                    <div className="pt-1.5 border-t border-white/10 flex justify-end">
                      <NavigateToLocationButton
                        address={booking.clientAddress}
                        zone={booking.zone}
                        lat={booking.nurseLiveLat}
                        lng={booking.nurseLiveLng}
                        size="xs"
                        variant="primary"
                        label="Open in Device Maps"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    Emergency Contact
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <p><strong className="text-white">Name:</strong> {booking.clientEmergencyContact.name}</p>
                    <p><strong className="text-white">Relationship:</strong> {booking.clientEmergencyContact.relation}</p>
                    <p><strong className="text-white">Emergency Phone:</strong> {booking.clientEmergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Clinical Alerts / Bio */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Clinical Alerts &amp; Conditions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Allergies</span>
                    {(booking?.allergies?.length || 0) > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(booking?.allergies || []).map((a, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300">No known drug allergies reported</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Known Illnesses</span>
                    {(booking?.knownIllnesses?.length || 0) > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(booking?.knownIllnesses || []).map((ill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                            {ill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300">Hypertension / Post-Op</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobility Status</span>
                    <span className="text-slate-300 mt-1 block">
                      {booking.patientBioData?.mobilityStatus || 'Assisted walking with cane / bed rest'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Daily Prescriptions */}
              {(booking?.patientMedications?.length || 0) > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-pink-400" />
                    Scheduled Patient Medications
                  </h4>
                  <div className="space-y-1.5">
                    {(booking?.patientMedications || []).map((m, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-white">{m.name}</strong>
                          <span className="text-slate-400 ml-2">({m.dosage})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 text-purple-200 text-[10px] font-mono">
                          {m.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BILLING & EARNINGS */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Scheduled Duration</span>
                  <strong className="text-white font-mono text-sm">{booking.baseDurationMinutes || 60} minutes</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Clinical care window</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-emerald-300 block text-[10px] uppercase font-bold tracking-wider">Your Net Payout</span>
                  <strong className="text-emerald-400 font-mono text-base">{formatJMD(booking.nurseEarningsJMD)}</strong>
                  <span className="text-[10px] text-emerald-400/90 block mt-0.5 font-semibold">Direct Escrow Deposit</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-purple-300 block text-[10px] uppercase font-bold tracking-wider">Disbursement Status</span>
                  <strong className="text-white font-mono text-sm">Escrow Protected</strong>
                  <span className="text-[10px] text-purple-300 block mt-0.5">Released upon completed sign-off</span>
                </div>
              </div>

              {/* Attendance Verification status */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">Doorstep Attendance Verification</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {booking.arrivalVerified 
                      ? `Verified via QR scan at ${booking.arrivalVerifiedAt ? new Date(booking.arrivalVerifiedAt).toLocaleTimeString() : 'doorstep'}`
                      : 'Pending doorstep QR scan upon nurse arrival.'}
                  </p>
                </div>
                {booking.arrivalVerified ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenArrivalQRScan) onOpenArrivalQRScan(booking);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                  >
                    Scan QR
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#120520] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(booking)}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            )}

            {onOpenVideoCall && (
              <button
                type="button"
                onClick={() => onOpenVideoCall(booking.clientName, 'client', `Consultation with ${booking.clientName}`)}
                className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-purple-300" />
                <span>Video Consult</span>
              </button>
            )}

            {onOpenArrivalQRScan && !booking.arrivalVerified && (
              <button
                type="button"
                onClick={() => onOpenArrivalQRScan(booking, 'check_in')}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Scan patient doorstep QR to verify arrival and clock in"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan Check-In QR</span>
              </button>
            )}

            {onOpenArrivalQRScan && booking.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => onOpenArrivalQRScan(booking, 'check_out')}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Scan patient Check-Out QR to complete visit and lock records"
              >
                <LogOut className="w-3.5 h-3.5 text-purple-300" />
                <span>Scan Check-Out QR</span>
              </button>
            )}

            {onDownloadMedicalSummary && (
              <button
                type="button"
                onClick={() => onDownloadMedicalSummary(booking)}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Download print-optimized official medical summary PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Medical Summary (PDF)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenCloseoutModal && booking.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCloseoutModal(booking);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white font-black text-xs transition shadow-lg shadow-purple-950/40 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finalize Visit &amp; Closeout</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
