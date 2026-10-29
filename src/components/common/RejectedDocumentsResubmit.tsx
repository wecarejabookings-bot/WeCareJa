import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Upload, 
  FileCheck, 
  CheckCircle2, 
  FileText, 
  X, 
  RefreshCw, 
  LogOut, 
  ShieldAlert, 
  Camera, 
  Eye, 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../../types';
import { supabase } from '../../lib/supabase';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { WeCareTrackLogo } from './WeCareTrackLogo';

export interface RejectedDocumentsResubmitProps {
  user: UserAccount;
  onResubmitted?: (updatedUser: UserAccount) => void;
  onSignOut?: () => void;
}

interface DocMeta {
  key: string;
  label: string;
  description: string;
  icon: string;
  targetField: string;
}

const DOC_METADATA: Record<string, DocMeta> = {
  dl_front: {
    key: 'dl_front',
    label: "Driver's License (Front)",
    description: "Clear, uncropped, glare-free color scan of the front of your Jamaican Driver's License",
    icon: '🪪',
    targetField: 'driversLicenseFrontUrl'
  },
  dl_back: {
    key: 'dl_back',
    label: "Driver's License (Back)",
    description: "Legible, high-resolution scan of the back of your Jamaican Driver's License",
    icon: '🪪',
    targetField: 'driversLicenseBackUrl'
  },
  trn: {
    key: 'trn',
    label: 'TRN Card / TAJ Certificate',
    description: 'Official Tax Registration Number card issued by Tax Administration Jamaica',
    icon: '💳',
    targetField: 'trnCertificateUrl'
  },
  ncj_or_passport: {
    key: 'ncj_or_passport',
    label: 'NCJ Practicing License / Passport',
    description: 'Valid Nursing Council of Jamaica annual practicing roll license or Government Passport',
    icon: '🩺',
    targetField: 'licenseDocumentUrl'
  },
  photo: {
    key: 'photo',
    label: 'Professional Profile Photo',
    description: 'Well-lit headshot against a plain background in professional nursing attire',
    icon: '👤',
    targetField: 'photoUrl'
  },
  police_record: {
    key: 'police_record',
    label: 'Police Clearance Certificate',
    description: 'Official Ministry of National Security certificate of character / criminal record clearance',
    icon: '👮',
    targetField: 'policeRecordUrl'
  },
  proof_of_address: {
    key: 'proof_of_address',
    label: 'Proof of Residential Address',
    description: 'Recent utility bill (JPS/NWC within 3 months) showing residential address in Jamaica',
    icon: '🏠',
    targetField: 'proofOfAddressUrl'
  },
  bank_or_address: {
    key: 'bank_or_address',
    label: 'Proof of Residential Address',
    description: 'Recent utility bill (JPS/NWC within 3 months) showing residential address in Jamaica',
    icon: '🏠',
    targetField: 'proofOfAddressUrl'
  }
};

export const RejectedDocumentsResubmit: React.FC<RejectedDocumentsResubmitProps> = ({
  user,
  onResubmitted,
  onSignOut
}) => {
  // Normalize rejected document keys
  const rawRejected = user.rejected_documents || [];
  const rejectedKeys: string[] = rawRejected.length > 0
    ? rawRejected
    : ['dl_front', 'trn']; // Sensible fallback if not set

  // Uploaded replacement files state: docKey -> { file, previewUrl, fileName, isPdf }
  const [replacementFiles, setReplacementFiles] = useState<Record<string, {
    file?: File;
    previewUrl: string;
    fileName: string;
    isPdf: boolean;
  }>>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resubmitSuccess, setResubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (docKey: string, file: File | null) => {
    if (!file) return;

    soundFX.playToggleClick();
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      setReplacementFiles(prev => ({
        ...prev,
        [docKey]: {
          file,
          previewUrl: dataUrl,
          fileName: file.name,
          isPdf
        }
      }));
      setErrorMessage(null);
    };

    reader.readAsDataURL(file);
  };

  // Check if all rejected documents have a replacement selected
  const allReplaced = rejectedKeys.every(k => Boolean(replacementFiles[k]));
  const missingCount = rejectedKeys.filter(k => !replacementFiles[k]).length;

  // Handle Resubmit Submission
  const handleResubmit = async () => {
    if (!allReplaced) {
      setErrorMessage(`Please select replacement files for all ${missingCount} flagged document${missingCount > 1 ? 's' : ''}.`);
      soundFX.playPop();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    soundFX.playToggleClick();

    const cleanEmail = (user.email || '').toLowerCase().trim();
    const nowIso = new Date().toISOString();

    try {
      // 1. Build document payload for updates
      const updatedFields: Record<string, string> = {};
      
      for (const key of rejectedKeys) {
        const item = replacementFiles[key];
        if (item) {
          const meta = DOC_METADATA[key];
          const fieldName = meta ? meta.targetField : key;
          updatedFields[fieldName] = item.previewUrl;
        }
      }

      // 2. Upload to Supabase Storage if online & configured
      try {
        if (supabase) {
          const bucketName = user.role === 'admin' ? 'admin-documents' : 'nurse-documents';
          for (const key of rejectedKeys) {
            const item = replacementFiles[key];
            if (item?.file) {
              const fileExt = item.file.name.split('.').pop() || 'png';
              const filePath = `${user.id}/${key}_${Date.now()}.${fileExt}`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, item.file, { upsert: true });

              if (!uploadError && uploadData) {
                const { data: publicUrlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(filePath);
                if (publicUrlData?.publicUrl) {
                  const meta = DOC_METADATA[key];
                  if (meta) updatedFields[meta.targetField] = publicUrlData.publicUrl;
                }
              }
            }
          }
        }
      } catch (storageErr) {
        console.warn('[Resubmit] Storage upload note (using data URLs):', storageErr);
      }

      // 3. Update public.profiles in Supabase
      try {
        if (supabase) {
          const updatePayload: any = {
            status: 'pending',
            rejected_documents: [],
            // keep rejection_date so Admin Portal shows "RESUBMITTED - 2nd Review"
          };

          if (updatedFields.driversLicenseFrontUrl) updatePayload.drivers_license_front_url = updatedFields.driversLicenseFrontUrl;
          if (updatedFields.driversLicenseBackUrl) updatePayload.drivers_license_back_url = updatedFields.driversLicenseBackUrl;
          if (updatedFields.trnCertificateUrl) updatePayload.trn_certificate_url = updatedFields.trnCertificateUrl;
          if (updatedFields.licenseDocumentUrl) updatePayload.license_document_url = updatedFields.licenseDocumentUrl;
          if (updatedFields.photoUrl) updatePayload.avatar_url = updatedFields.photoUrl;

          const { error: profileError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', user.id);

          if (profileError) {
            console.warn('[Resubmit] Supabase profiles update note:', profileError.message);
          }
        }
      } catch (dbErr) {
        console.warn('[Resubmit] Supabase update exception:', dbErr);
      }

      // 4. Update Local Dossier
      try {
        const dossierKey = `wecare_dossier_${cleanEmail}`;
        const rawDossier = localStorage.getItem(dossierKey) || localStorage.getItem(`wecare_dossier_${user.id}`);
        let dossier = rawDossier ? JSON.parse(rawDossier) : {};
        
        dossier.status = 'pending';
        dossier.rejected_documents = [];
        dossier.resubmitted_at = nowIso;
        if (!dossier.documents) dossier.documents = {};

        for (const [k, url] of Object.entries(updatedFields)) {
          dossier[k] = url;
          dossier.documents[k] = url;
        }

        localStorage.setItem(dossierKey, JSON.stringify(dossier));
        localStorage.setItem(`wecare_dossier_${user.id}`, JSON.stringify(dossier));
      } catch (locErr) {
        console.warn('[Resubmit] Local dossier update note:', locErr);
      }

      // 5. Update local nurses roster if nurse
      try {
        const rawNurses = localStorage.getItem('wecare_nurses');
        if (rawNurses) {
          const nurses = JSON.parse(rawNurses);
          const updated = nurses.map((n: any) => {
            if (n.id === user.id || (n.email && n.email.toLowerCase() === cleanEmail)) {
              return {
                ...n,
                status: 'pending',
                rejected_documents: [],
                resubmitted_at: nowIso,
                ...updatedFields
              };
            }
            return n;
          });
          localStorage.setItem('wecare_nurses', JSON.stringify(updated));
        }
      } catch {}

      // 6. Update local user accounts
      const updatedUserAccount: UserAccount = {
        ...user,
        status: 'pending',
        approvalStatus: 'pending_approval',
        rejected_documents: [],
        ...updatedFields
      };

      try {
        const rawUsers = localStorage.getItem('wecare_user_accounts');
        if (rawUsers) {
          const users = JSON.parse(rawUsers);
          const updated = users.map((u: any) => u.id === user.id ? updatedUserAccount : u);
          localStorage.setItem('wecare_user_accounts', JSON.stringify(updated));
        }
      } catch {}

      soundFX.playSuccessFanfare();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1A1E4E', '#F59E0B', '#3B82F6']
      });

      setResubmitSuccess(true);

      if (onResubmitted) {
        onResubmitted(updatedUserAccount);
      }
    } catch (err: any) {
      console.error('[Resubmit] Failed to resubmit documents:', err);
      setErrorMessage(`Failed to resubmit: ${err?.message || 'Please check your connection and retry.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D24] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <WeCareTrackLogo size="md" variant="full" />
        
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full my-6 flex-1 space-y-6">
        {resubmitSuccess ? (
          /* Celebratory Confirmation Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0f0a26] border-2 border-emerald-500/50 text-center space-y-5 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Resubmitted for 2nd Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Documents Successfully Received!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{user.full_name || user.name}</strong>. Your updated statutory documents have been dispatched to the WeCare Track Jamaica administration team for accelerated verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Status:</span>
                <span className="font-bold text-amber-300">Pending 2nd Review</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Review Time:</span>
                <span className="font-bold text-blue-300">Within 2 to 4 Hours</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Support Contact:</span>
                <span className="font-mono text-emerald-300">(876) 582-7613</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-400">
                You will receive a notification and SMS once your credentials are authorized.
              </p>
            </div>
          </div>
        ) : (
          /* Rejection and Re-Upload Workflow */
          <div className="space-y-6">
            {/* Top Red Alert Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-950/80 via-red-900/60 to-[#1A1E4E] border-2 border-red-500/60 shadow-2xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-400 flex items-center justify-center text-red-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white shadow-xs">
                    Action Required
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Your application needs correction
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed pl-13">
                The WeCare Track Jamaica Credentialing Board reviewed your registration and found issues with one or more uploaded files. Please review the administrator's feedback below and upload replacement scans to proceed.
              </p>
            </div>

            {/* Admin Explanation & Reason Card */}
            <div className="p-5 rounded-3xl bg-[#0f0a26] border-2 border-[#1E1B4B] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Administrator Verification Feedback</span>
                </span>
                {user.rejection_date && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Flagged: {new Date(user.rejection_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-white text-xs sm:text-sm leading-relaxed">
                <p className="italic text-slate-200">
                  "{user.rejection_reason || 'Please provide clear, legible replacements for the flagged statutory documents to comply with Ministry of Health regulations.'}"
                </p>
              </div>

              {/* Badges for each document that must be fixed */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Documents required to fix ({rejectedKeys.length}):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {rejectedKeys.map((key) => {
                    const meta = DOC_METADATA[key] || { label: key, icon: '📄' };
                    const isReplaced = Boolean(replacementFiles[key]);
                    return (
                      <span
                        key={key}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                          isReplaced
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                            : 'bg-red-950/60 text-red-300 border-red-500/50 animate-pulse'
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                        {isReplaced ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                        ) : (
                          <span className="text-[10px] text-red-400 ml-1 font-mono">(Needs Re-upload)</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upload Inputs ONLY for Rejected Documents */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Targeted Document Re-upload</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {Object.keys(replacementFiles).length} of {rejectedKeys.length} files attached
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {rejectedKeys.map((key) => {
                  const meta = DOC_METADATA[key] || {
                    key,
                    label: key.replace(/_/g, ' ').toUpperCase(),
                    description: 'Please upload replacement scan',
                    icon: '📄',
                    targetField: key
                  };
                  const currentReplacement = replacementFiles[key];

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-3xl border-2 transition ${
                        currentReplacement
                          ? 'bg-[#101438] border-emerald-500/60 shadow-lg'
                          : 'bg-[#0f0a26] border-red-500/40 hover:border-red-500/70 shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{meta.icon}</span>
                            <h4 className="text-sm font-black text-white">
                              Re-upload {meta.label} <span className="text-red-400">*</span>
                            </h4>
                            {currentReplacement && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Attached</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300">
                            {meta.description}
                          </p>
                        </div>

                        {/* File Action / Replacement Trigger */}
                        <div className="shrink-0">
                          <label className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                            currentReplacement
                              ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
                              : 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-md'
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{currentReplacement ? 'Change File' : 'Select Replacement File'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* File Preview Frame if Attached */}
                      {currentReplacement && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {currentReplacement.isPdf ? (
                              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            ) : (
                              <img 
                                src={currentReplacement.previewUrl} 
                                alt={meta.label} 
                                className="w-10 h-10 object-cover rounded-xl border border-white/20 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate max-w-xs sm:max-w-md">
                                {currentReplacement.fileName}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Ready for submission
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={currentReplacement.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-blue-300 hover:text-white transition flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setReplacementFiles(prev => {
                                  const copy = { ...prev };
                                  delete copy[key];
                                  return copy;
                                });
                              }}
                              className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition"
                              title="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-5 rounded-3xl bg-[#1A1E4E] border border-white/15 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-300 space-y-0.5">
                <span className="font-bold text-white block">
                  {allReplaced 
                    ? 'All required documents ready for submission' 
                    : `Please attach replacements for remaining ${missingCount} document${missingCount > 1 ? 's' : ''}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Submitting will clear flagged status and return your account to the priority review queue.
                </span>
              </div>

              <button
                type="button"
                onClick={handleResubmit}
                disabled={!allReplaced || isSubmitting}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                  allReplaced && !isSubmitting
                    ? 'bg-[#F59E0B] hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-950/50'
                    : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Uploading &amp; Resubmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Resubmit for Review</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Statutory Compliance &amp; HIPAA-Grade Encrypted Document Storage</span>
        </span>
        <span>Powered by WeCare Track Jamaica HOME NURSING</span>
      </footer>
    </div>
  );
};
