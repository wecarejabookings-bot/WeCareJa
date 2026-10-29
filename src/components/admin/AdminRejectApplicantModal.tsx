import React, { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';

export interface AdminRejectApplicantModalProps {
  applicant: any;
  onClose: () => void;
  onConfirmed?: (applicant: any, reason: string) => void;
}

export const AdminRejectApplicantModal: React.FC<AdminRejectApplicantModalProps> = ({
  applicant,
  onClose,
  onConfirmed
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!applicant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setErrorMsg('Please enter a rejection reason.');
      soundFX.playWarningSound();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Update profiles table with status='rejected' and rejection_reason=reason
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          rejection_reason: trimmedReason
        })
        .eq('id', applicant.id);

      if (updateError) {
        console.warn('Profiles status update fallback:', updateError.message);
        // Fallback if status/rejection_reason columns do not exist in schema cache
        await supabase
          .from('profiles')
          .update({
            role: 'rejected',
            trn: `[REJECTED: ${trimmedReason}]`
          })
          .eq('id', applicant.id);
      }

      // 2. Insert into notifications table
      try {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: applicant.id,
            type: 'rejection',
            message: `Reason: ${trimmedReason}`
          });
        if (notifError) {
          console.warn('Notifications table insert note:', notifError.message);
        }
      } catch (notifErr) {
        console.warn('Notifications insert exception:', notifErr);
      }

      // Also record in local notification storage
      try {
        const rawNotifs = localStorage.getItem('wecare_notifications') || '[]';
        const notifList = JSON.parse(rawNotifs);
        notifList.unshift({
          id: `rejection-${applicant.id}-${Date.now()}`,
          type: 'system_alert',
          title: 'Application Rejected',
          description: `Reason: ${trimmedReason}`,
          timestamp: new Date().toISOString(),
          read: false,
          targetRole: applicant.role?.includes('admin') ? 'admin' : 'nurse',
          meta: { applicantId: applicant.id, reason: trimmedReason }
        });
        localStorage.setItem('wecare_notifications', JSON.stringify(notifList));
      } catch {}

      soundFX.playStepComplete();
      if (onConfirmed) {
        onConfirmed(applicant, trimmedReason);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reject applicant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0f0a26] border-2 border-red-500/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-red-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Reject Application: {applicant.full_name || 'Applicant'}
              </h3>
              <p className="text-[11px] text-red-300">
                Provide explicit reason for rejecting this applicant's submission
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Reason for Rejection *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. TRN could not be verified..."
              className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
              required
            />
            {errorMsg && (
              <p className="text-[11px] text-red-400 mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:opacity-95 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
