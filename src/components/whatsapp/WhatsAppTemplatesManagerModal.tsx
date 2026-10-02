import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Send, 
  Code, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { META_WHATSAPP_TEMPLATES, WECARE_WHATSAPP_BUSINESS_NUMBER } from '../../utils/whatsappRemoteCare';
import { WhatsAppTemplate } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface WhatsAppTemplatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator?: (templateName?: string) => void;
}

export const WhatsAppTemplatesManagerModal: React.FC<WhatsAppTemplatesManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenSimulator
}) => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(META_WHATSAPP_TEMPLATES[0]);
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, 'APPROVED' | 'IN_REVIEW'>>({
    wecare_start_code: 'APPROVED',
    wecare_end_code: 'APPROVED',
    wecare_nurse_job_whatsapp: 'APPROVED',
    wecare_receipt: 'APPROVED'
  });
  const [isSimulatingSubmit, setIsSimulatingSubmit] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, templateName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(templateName);
    soundFX.playSuccessPing();
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleSimulateMetaSubmission = (templateName: string) => {
    setIsSimulatingSubmit(templateName);
    soundFX.playToggleClick();
    setTimeout(() => {
      setSubmissionStatus(prev => ({ ...prev, [templateName]: 'APPROVED' }));
      setIsSimulatingSubmit(null);
      soundFX.playSuccessPing();
    }, 1200);
  };

  // Render template body with highlighted variables
  const renderHighlightedBody = (body: string, vars: string[]) => {
    let replaced = body || '';
    (vars || []).forEach((v, idx) => {
      const placeholder = `{{${idx + 1}}}`;
      replaced = replaced.replace(
        placeholder,
        `[#VAR_${idx + 1}:${v}#]`
      );
    });

    const parts = replaced.split(/(\[#VAR_\d+:[^#]+#\])/);
    return (
      <p className="text-xs text-slate-200 leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('[#VAR_')) {
            const match = part.match(/\[#VAR_(\d+):([^#]+)#\]/);
            if (match) {
              return (
                <span 
                  key={i} 
                  className="px-1.5 py-0.5 mx-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 inline-block font-mono text-[11px]"
                  title={`Variable {{${match[1]}}}`}
                >
                  {match[2]}
                </span>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0b1c15] via-[#0d141d] to-[#0a0f18] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-6">
        {/* Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-slate-950 flex items-center justify-center shadow-lg shadow-[#25D366]/20">
              <MessageSquare className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">Meta WhatsApp Cloud API Templates</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  4 Mandated Templates
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official templates registered under We Care Jamaica WhatsApp Business Account ({WECARE_WHATSAPP_BUSINESS_NUMBER})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-5 sm:p-6 space-y-6">
          {/* Quick Info Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#25D366] shrink-0" />
              <div>
                <span className="font-bold text-white block">Meta Business Manager Submission Status</span>
                <span className="text-slate-300 text-[11px]">
                  All 4 templates adhere to Meta Cloud API Utility Guidelines. Approved for immediate remote visit start/end automation.
                </span>
              </div>
            </div>

            {onOpenSimulator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSimulator();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test in Live Simulator</span>
              </button>
            )}
          </div>

          {/* 4 Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {META_WHATSAPP_TEMPLATES.map((tmpl, idx) => {
              const status = submissionStatus[tmpl.name] || 'APPROVED';
              const isSelected = selectedTemplate.name === tmpl.name;

              return (
                <div 
                  key={tmpl.name}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.03] border-[#25D366] shadow-lg shadow-[#25D366]/10 ring-1 ring-[#25D366]' 
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Template Card Top */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-purple-300 font-bold">
                            Template {idx + 1}:
                          </span>
                          <span className="text-xs font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                            {tmpl.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {tmpl.description}
                        </p>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 flex items-center gap-1 ${
                        status === 'APPROVED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {status}
                      </span>
                    </div>

                    {/* Verbatim Template Body Box */}
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 my-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                        <span>Verbatim Template Body:</span>
                        <span className="text-[9px] font-mono text-emerald-400">Category: {tmpl.category}</span>
                      </div>
                      <p className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed select-all">
                        {tmpl.body}
                      </p>
                    </div>

                    {/* Sample Output Preview */}
                    <div className="p-3 rounded-xl bg-[#075E54]/25 border border-emerald-500/30 my-2">
                      <div className="text-[10px] uppercase font-bold text-emerald-300 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#25D366]" />
                        <span>Live WhatsApp Message Preview:</span>
                      </div>
                      {renderHighlightedBody(tmpl.body, tmpl.sampleVariables)}

                      {/* Interactive Buttons Preview */}
                      {tmpl.buttons && tmpl.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-emerald-500/20">
                          {tmpl.buttons.map((btn, bIdx) => (
                            <span 
                              key={bIdx}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/30 text-emerald-100 font-mono text-[11px] font-bold border border-emerald-400/40 flex items-center gap-1"
                            >
                              <span>[{btn.text}]</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(tmpl.body, tmpl.name);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {copiedTemplate === tmpl.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Body</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isSimulatingSubmit === tmpl.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateMetaSubmission(tmpl.name);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {isSimulatingSubmit === tmpl.name ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit to Meta</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Instructions for Meta Business Manager */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#25D366]" />
              <span>How to submit to Meta Business Manager:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
              <li>Open <strong>business.facebook.com</strong> &gt; WhatsApp Manager &gt; Account Tools &gt; <strong>Message Templates</strong>.</li>
              <li>Click <strong>Create Template</strong> &gt; Select Category <strong>Utility</strong> &gt; Enter the exact template name (e.g., <code className="text-emerald-300 font-mono">wecare_start_code</code>).</li>
              <li>Select Language: <strong>English (US)</strong> &gt; Paste the exact Body text from above.</li>
              <li>Configure Quick Reply and Call-To-Action buttons as shown above, then click <strong>Submit</strong>. Meta automated approval typically completes in under 2 minutes.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Webhook URL: <code className="text-emerald-400 font-mono">/webhook/whatsapp</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
