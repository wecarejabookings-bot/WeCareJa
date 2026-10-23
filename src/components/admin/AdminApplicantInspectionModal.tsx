import React from 'react';
import { X, CheckCircle2, XCircle, FileText, ExternalLink, Calendar, Mail, Phone, Shield, CreditCard, User } from 'lucide-react';

export interface AdminApplicantInspectionModalProps {
  applicant: any;
  onClose: () => void;
  onApprove: (applicant: any) => void;
  onReject: (applicant: any) => void;
}

export const AdminApplicantInspectionModal: React.FC<AdminApplicantInspectionModalProps> = ({
  applicant,
  onClose,
  onApprove,
  onReject
}) => {
  if (!applicant) return null;

  // Extract documents from applicant.documents (can be array of strings or objects, or extracted from trn string)
  let documentsList: { title: string; url: string }[] = [];

  if (Array.isArray(applicant.documents)) {
    documentsList = applicant.documents.map((doc: any, index: number) => {
      if (typeof doc === 'string') {
        return { title: `Document #${index + 1}`, url: doc };
      }
      return { title: doc.title || doc.name || `Document #${index + 1}`, url: doc.url || doc.file_url || '' };
    }).filter(d => Boolean(d.url));
  } else if (applicant.documents && typeof applicant.documents === 'object') {
    documentsList = Object.entries(applicant.documents).map(([key, val]) => {
      if (typeof val === 'string' && val.startsWith('http')) {
        const readableTitle = key.replace(/([A-Z])/g, ' $1').replace(/Url$/i, '').trim();
        return { title: readableTitle.charAt(0).toUpperCase() + readableTitle.slice(1), url: val };
      }
      return null;
    }).filter(Boolean) as { title: string; url: string }[];
  }

  // Fallback: extract any URLs from applicant.trn string if documents array is empty
  if (documentsList.length === 0 && applicant.trn && typeof applicant.trn === 'string') {
    const docMatches = applicant.trn.match(/https?:\/\/[^\s|",]+/g);
    if (docMatches) {
      docMatches.forEach((url: string, idx: number) => {
        documentsList.push({ title: `Uploaded Scan #${idx + 1}`, url });
      });
    }
  }

  const roleName = applicant.role || 'pending_applicant';
  const isNurse = roleName.includes('nurse');
  const isPending = applicant.status === 'pending' || roleName.includes('pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0f0a26] border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isNurse ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
            }`}>
              {isNurse ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {applicant.full_name || 'Applicant'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {roleName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  Status: {applicant.status || (isPending ? 'pending' : 'active')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Applicant ID: <span className="font-mono text-slate-300">{applicant.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Full Legal Name</span>
              <span className="text-sm font-bold text-white block">{applicant.full_name || '—'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Email Address</span>
              <a href={`mailto:${applicant.email}`} className="text-xs font-mono text-purple-300 hover:underline block truncate" title={applicant.email}>
                {applicant.email || '—'}
              </a>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Phone Number</span>
              <span className="text-xs font-mono text-amber-300 font-bold block">{applicant.phone || '—'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">TRN (Tax Registration Number)</span>
              <span className="text-xs font-mono text-emerald-400 font-bold block">{applicant.trn || '—'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Assigned / Requested Role</span>
              <span className="text-xs font-bold text-white capitalize block">{applicant.role || '—'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Application Status</span>
              <span className="text-xs font-bold text-amber-300 capitalize block">{applicant.status || (isPending ? 'pending' : 'active')}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 sm:col-span-2 md:col-span-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Application Created At</span>
              <span className="text-xs font-mono text-slate-300 block">
                {applicant.created_at ? new Date(applicant.created_at).toLocaleString() : 'Recent application'}
              </span>
            </div>
          </div>

          {/* Uploaded Documents Array */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Uploaded Documents ({documentsList.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Click preview or link to view full resolution</span>
            </div>

            {documentsList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-slate-400">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                <p>No document uploads found for this applicant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {documentsList.map((doc, idx) => {
                  const isImage = doc.url.match(/\.(jpeg|jpg|png|webp|gif)($|\?)/i) || doc.url.startsWith('data:image');
                  return (
                    <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate text-xs" title={doc.title}>{doc.title}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white transition"
                          title="Open full document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {isImage ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative h-28 rounded-xl bg-black/60 border border-white/10 overflow-hidden hover:border-amber-400 transition"
                        >
                          <img src={doc.url} alt={doc.title} className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <div className="h-28 rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-1 text-slate-400">
                          <FileText className="w-6 h-6 text-purple-400" />
                          <span className="text-[10px] font-mono">PDF / File Document</span>
                        </div>
                      )}

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-center text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span>View Full Doc</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-white/10 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold transition cursor-pointer"
          >
            Close
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onReject(applicant)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-red-500/50 hover:bg-red-500/20 text-red-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Reject</span>
            </button>
            <button
              type="button"
              onClick={() => onApprove(applicant)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Approve Applicant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
