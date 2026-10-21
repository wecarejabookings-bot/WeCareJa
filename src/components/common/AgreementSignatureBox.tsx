import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  PenTool, 
  Type, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export interface SignatureData {
  signed: boolean;
  signatureMode: 'draw' | 'type';
  drawnSignatureDataUrl?: string;
  typedSignature?: string;
  agreedAt: string;
}

export interface AgreementSignatureBoxProps {
  title?: string;
  roleType: 'nurse' | 'admin';
  signerName: string;
  onSignatureChange: (data: SignatureData) => void;
  required?: boolean;
}

export const AgreementSignatureBox: React.FC<AgreementSignatureBoxProps> = ({
  title,
  roleType,
  signerName,
  onSignatureChange,
  required = true
}) => {
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(signerName || '');
  const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = useState<string>('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [signedDate] = useState(() => new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep typed signature in sync if signer name changes and user hasn't edited it
  useEffect(() => {
    if (signerName && !typedSignature) {
      setTypedSignature(signerName);
    }
  }, [signerName, typedSignature]);

  const onSignatureChangeRef = useRef(onSignatureChange);
  useEffect(() => {
    onSignatureChangeRef.current = onSignatureChange;
  }, [onSignatureChange]);

  // Notify parent of signature updates
  useEffect(() => {
    const isSigned = hasAgreedToTerms && (
      (signatureMode === 'draw' && hasDrawnSignature && Boolean(drawnSignatureDataUrl)) ||
      (signatureMode === 'type' && typedSignature.trim().length >= 2)
    );

    onSignatureChangeRef.current({
      signed: isSigned,
      signatureMode,
      drawnSignatureDataUrl: signatureMode === 'draw' ? drawnSignatureDataUrl : undefined,
      typedSignature: signatureMode === 'type' ? typedSignature.trim() : undefined,
      agreedAt: new Date().toISOString()
    });
  }, [hasAgreedToTerms, signatureMode, hasDrawnSignature, drawnSignatureDataUrl, typedSignature]);

  // Redraw canvas if switching back to draw mode with an existing signature
  useEffect(() => {
    if (signatureMode === 'draw' && canvasRef.current && drawnSignatureDataUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = drawnSignatureDataUrl;
      }
    }
  }, [signatureMode, drawnSignatureDataUrl]);

  // Pointer & Touch Drawing Handlers
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = roleType === 'admin' ? '#f59e0b' : '#34d399';
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}
    const dataUrl = canvas.toDataURL('image/png');
    setDrawnSignatureDataUrl(dataUrl);
    setHasDrawnSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setDrawnSignatureDataUrl('');
  };

  const drawSampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = roleType === 'admin' ? '#f59e0b' : '#34d399';

    ctx.beginPath();
    ctx.moveTo(35, 80);
    ctx.bezierCurveTo(55, 30, 80, 25, 105, 65);
    ctx.bezierCurveTo(120, 90, 135, 100, 155, 60);
    ctx.bezierCurveTo(170, 30, 190, 45, 215, 70);
    ctx.bezierCurveTo(240, 95, 275, 55, 305, 65);
    ctx.bezierCurveTo(335, 75, 365, 50, 415, 70);
    ctx.moveTo(85, 70);
    ctx.lineTo(435, 70);
    ctx.stroke();

    setHasDrawnSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    setDrawnSignatureDataUrl(dataUrl);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 shadow-xl ${
      roleType === 'admin' 
        ? 'bg-[#0f0a26] border-amber-500/40 text-amber-100' 
        : 'bg-[#0f0a26] border-emerald-500/40 text-emerald-100'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {roleType === 'admin' ? (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-white">
              {title || (roleType === 'admin' 
                ? 'Administrator Data Governance & Clinical Oversight Agreement' 
                : 'Healthcare Practitioner Independent Contractor Agreement')}
            </h4>
            <span className="text-[10px] text-slate-300 font-mono">
              Governed under the Laws of Jamaica • Electronic Signatures Act
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300 shrink-0">
          <Calendar className="w-3 h-3 text-amber-400" />
          <span>{signedDate}</span>
        </div>
      </div>

      {/* Scrollable Agreement Contract Information Box */}
      <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 max-h-44 overflow-y-auto text-[11px] leading-relaxed text-slate-300 space-y-2.5 pr-2 font-sans">
        {roleType === 'nurse' ? (
          <>
            <p>
              <strong>1. Engagement &amp; Independent Status:</strong> The Practitioner agrees to provide private-duty homecare and clinical nursing services as an independent healthcare contractor on the We Care Jamaica network.
            </p>
            <p>
              <strong>2. Payouts &amp; Compensation (85% / 15%):</strong> The Practitioner earns 85% of each completed client visit fee, deposited weekly via NCB, Scotiabank, JN Bank, Sagicor, or Lynk. A 15% platform fee covers insurance coordination, 119 emergency beacon coverage, and EHR notes dispatch.
            </p>
            <p>
              <strong>3. Clinical Licensing &amp; NCJ Standards:</strong> The Practitioner certifies that all provided Nursing Council of Jamaica (NCJ) credentials, TRN number, and Government IDs are authentic and active. Practitioner agrees to abide by the NCJ Code of Professional Ethics.
            </p>
            <p>
              <strong>4. Confidentiality &amp; Patient Privacy:</strong> Strict compliance with patient medical confidentiality (HIPAA / Data Protection Act of Jamaica). Patient vital signs, diagnoses, and addresses are strictly confidential and must not be disclosed.
            </p>
            <p>
              <strong>5. 119 Emergency Protocol:</strong> Practitioner agrees to trigger the in-app 119 SOS Emergency Beacon immediately in any clinical crisis, cardiac arrest, or patient trauma.
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>1. Administrative Fiduciary Responsibility:</strong> The Administrator agrees to execute operational supervision, nurse credential verification, dispatch routing, and escrow payouts with clinical diligence and integrity.
            </p>
            <p>
              <strong>2. Jamaican Data Protection Act &amp; Privacy:</strong> Administrator acknowledges access to confidential client health records, nurse banking details, and government IDs. Unauthorized disclosure, sharing, or export of patient data is strictly prohibited and subject to legal prosecution.
            </p>
            <p>
              <strong>3. Clinical Vetting &amp; NCJ Authentication:</strong> Administrator agrees to diligently inspect practicing certificates, TRN numbers, and government identification before approving any healthcare practitioner to accept patient visits.
            </p>
            <p>
              <strong>4. Escrow Fund Accountability:</strong> All payment approvals, refund resolutions, and bank payout dispatches must be documented with transparent operational notes and audit trails.
            </p>
            <p>
              <strong>5. Emergency Dispatch Readiness:</strong> Administrator agrees to maintain operational monitoring for 119 emergency alerts and hospital redirection protocols.
            </p>
          </>
        )}
      </div>

      {/* Signature Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Signature Box {required && '*'}</span>
          </label>

          {/* Draw vs Type Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setSignatureMode('draw')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                signatureMode === 'draw'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Draw</span>
            </button>
            <button
              type="button"
              onClick={() => setSignatureMode('type')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                signatureMode === 'type'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Type</span>
            </button>
          </div>
        </div>

        {/* Draw Signature Canvas */}
        {signatureMode === 'draw' ? (
          <div className="space-y-1.5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-[#050212] touch-none">
              <canvas
                ref={canvasRef}
                width={500}
                height={130}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                className="w-full h-28 cursor-crosshair block"
              />

              {/* Baseline signing guideline */}
              <div className="absolute left-6 right-6 bottom-7 border-b border-white/10 pointer-events-none" />

              {!hasDrawnSignature && !drawnSignatureDataUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign with your finger, stylus, or mouse above the line</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className={`font-medium flex items-center gap-1 ${
                hasDrawnSignature || drawnSignatureDataUrl ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {hasDrawnSignature || drawnSignatureDataUrl ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signature Recorded</span>
                  </>
                ) : (
                  <span>Signature required in box above</span>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer text-[10px]"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
                <button
                  type="button"
                  onClick={drawSampleSignature}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 hover:text-white transition flex items-center gap-1 cursor-pointer text-[10px]"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Auto-Sign</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Type Signature Field */
          <div className="space-y-1.5">
            <div className="p-3 rounded-2xl bg-[#050212] border-2 border-white/20 space-y-1.5">
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your full legal name as digital signature"
                className="w-full bg-transparent text-xl font-serif italic text-purple-300 focus:outline-none border-b border-white/20 pb-1"
              />
              <p className="text-[10px] text-slate-400">
                Typing your full legal name serves as an authorized electronic signature under the Electronic Transactions Act of Jamaica.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legally Binding Agreement Checkbox */}
      <div className="pt-2 border-t border-white/10">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200 select-none">
          <input
            type="checkbox"
            checked={hasAgreedToTerms}
            onChange={(e) => setHasAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0"
          />
          <span className="leading-snug">
            I, <strong className="text-white">{signerName || 'the applicant'}</strong>, have read, understood, and accept all terms of this Agreement. I confirm that my electronic signature above is legally binding and authentic.
          </span>
        </label>
      </div>
    </div>
  );
};
