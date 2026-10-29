import React, { useState } from 'react';
import { Booking, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  Check, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Ban, 
  Stethoscope,
  MapPin
} from 'lucide-react';

interface AdminBookingActionModalProps {
  booking: Booking | null;
  actionType: 'assign' | 'reschedule' | 'cancel' | null;
  approvedNurses: NurseProfile[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmAssign: (bookingId: string, nurse: NurseProfile) => void;
  onConfirmReschedule: (bookingId: string, newDateTime: string, notes?: string) => void;
  onConfirmCancel: (bookingId: string, reason: string) => void;
}

export const AdminBookingActionModal: React.FC<AdminBookingActionModalProps> = ({
  booking,
  actionType,
  approvedNurses,
  isOpen,
  onClose,
  onConfirmAssign,
  onConfirmReschedule,
  onConfirmCancel
}) => {
  if (!isOpen || !booking || !actionType) return null;

  const [selectedNurseId, setSelectedNurseId] = useState(booking.nurseId || (approvedNurses[0]?.id || ''));
  const [newDate, setNewDate] = useState(() => (booking.scheduledDateTime || new Date().toISOString()).split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [cancelReason, setCancelReason] = useState('Patient requested schedule adjustment');
  const [rescheduleNotes, setRescheduleNotes] = useState('Rescheduled by Admin Dispatcher');

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'assign') {
      const nurse = approvedNurses.find(n => n.id === selectedNurseId) || approvedNurses[0];
      if (nurse) {
        soundFX.playStepComplete();
        onConfirmAssign(booking.id, nurse);
      }
    } else if (actionType === 'reschedule') {
      soundFX.playStepComplete();
      const combinedDateTime = `${newDate}T${newTime.includes('PM') ? '14:00:00' : '10:00:00'}.000Z`;
      onConfirmReschedule(booking.id, combinedDateTime, rescheduleNotes);
    } else if (actionType === 'cancel') {
      soundFX.playWarningSound();
      onConfirmCancel(booking.id, cancelReason);
    }
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              actionType === 'assign'
                ? 'bg-purple-600/30 text-purple-200 border-purple-400/40'
                : actionType === 'reschedule'
                  ? 'bg-blue-600/30 text-blue-200 border-blue-400/40'
                  : 'bg-rose-600/30 text-rose-200 border-rose-400/40'
            }`}>
              {actionType === 'assign' && <UserCheck className="w-5 h-5 text-purple-300" />}
              {actionType === 'reschedule' && <Calendar className="w-5 h-5 text-blue-300" />}
              {actionType === 'cancel' && <Ban className="w-5 h-5 text-rose-300" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {actionType === 'assign' && 'Assign Registered Nurse to Visit'}
                {actionType === 'reschedule' && 'Reschedule Patient Visit'}
                {actionType === 'cancel' && 'Cancel Booking Visit'}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Booking #{booking.id} • {booking.serviceName}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAction} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Patient:</span>
              <strong className="text-white">{booking.clientName}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Current Nurse:</span>
              <strong className="text-purple-300">{booking.nurseName || 'Unassigned'}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Zone &amp; Address:</span>
              <span className="text-slate-200 font-medium">{booking.zone}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Current Status:</span>
              <span className="font-bold uppercase text-amber-300">{booking.status}</span>
            </div>
          </div>

          {actionType === 'assign' && (
            <div className="space-y-3">
              <label className="text-slate-300 font-bold block">
                Select Licensed Nurse from Dispatch Pool
              </label>
              <select
                value={selectedNurseId}
                onChange={e => setSelectedNurseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-purple-400/40 text-white font-medium focus:border-purple-400 focus:outline-hidden"
              >
                {approvedNurses.map(nurse => (
                  <option key={nurse.id} value={nurse.id}>
                    {nurse.name} — NCJ: {nurse.nursingCouncilLicense} ({nurse.zones[0] || 'Kingston'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Assigning will send an automated notification and WhatsApp alert to the nurse.
              </p>
            </div>
          )}

          {actionType === 'reschedule' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">New Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">New Time Slot</label>
                  <select
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value="08:00 AM">08:00 AM - Morning Vitals</option>
                    <option value="10:00 AM">10:00 AM - Midday Care</option>
                    <option value="02:00 PM">02:00 PM - Afternoon Wound Dressing</option>
                    <option value="04:30 PM">04:30 PM - Evening Respite</option>
                    <option value="07:00 PM">07:00 PM - Bedtime Hydration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Dispatcher Note</label>
                <input
                  type="text"
                  value={rescheduleNotes}
                  onChange={e => setRescheduleNotes(e.target.value)}
                  placeholder="Reason for reschedule..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:border-blue-400 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {actionType === 'cancel' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Cancelling will stop live dispatch and record the visit as cancelled. Both nurse and family will be notified.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-rose-400/40 text-white font-medium focus:outline-hidden"
                >
                  <option value="Patient requested schedule adjustment">Patient requested schedule adjustment</option>
                  <option value="Patient hospitalized or admitted elsewhere">Patient hospitalized or admitted elsewhere</option>
                  <option value="Severe weather / road obstruction in Kingston">Severe weather / road obstruction in Kingston</option>
                  <option value="Duplicate booking order">Duplicate booking order</option>
                  <option value="Emergency care redirected to UHWI / KPH">Emergency care redirected to UHWI / KPH</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer ${
                actionType === 'assign'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/50'
                  : actionType === 'reschedule'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/50'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {actionType === 'assign' && 'Confirm Nurse Assignment'}
                {actionType === 'reschedule' && 'Confirm Reschedule'}
                {actionType === 'cancel' && 'Confirm Cancellation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
