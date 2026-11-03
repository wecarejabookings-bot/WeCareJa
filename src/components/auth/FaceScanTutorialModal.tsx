import React, { useState } from 'react';
import { 
  X, 
  Scan, 
  ShieldCheck, 
  Sun, 
  Eye, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Smartphone,
  Lock
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface FaceScanTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadyToScan?: () => void;
  role?: 'nurse' | 'admin';
}

export const FaceScanTutorialModal: React.FC<FaceScanTutorialModalProps> = ({
  isOpen,
  onClose,
  onReadyToScan,
  role = 'nurse'
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);

  if (!isOpen) return null;

  const roleTitle = role === 'admin' ? 'Administrator' : 'Healthcare Practitioner';

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);
    soundFX.playToggleClick();

    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          soundFX.playBiometricSuccess();
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  const TUTORIAL_STEPS = [
    {
      step: 1,
      title: 'Good Front Lighting',
      icon: Sun,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      description: 'Face a window, soft room lamp, or daytime light. Avoid strong backlights (e.g. bright window behind you) which creates dark silhouettes.',
      tip: 'Natural room lighting works best for clinical biometric capture.'
    },
    {
      step: 2,
      title: 'Hold Device at Eye Level',
      icon: Smartphone,
      color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
      description: 'Hold your smartphone or laptop camera directly in front of your eyes at arm\'s length (18–24 inches). Do not tilt down toward your lap.',
      tip: 'Keep your neck and head straight looking at the camera lens.'
    },
    {
      step: 3,
      title: 'Clear Face Visibility',
      icon: Eye,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      description: 'Remove sunglasses, tinted shades, hats, or masks. Regular prescription eyeglasses are acceptable as long as lenses have no heavy glare.',
      tip: 'Keep your full forehead, cheeks, and chin visible.'
    },
    {
      step: 4,
      title: 'Align in Oval & Snap',
      icon: Scan,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
      description: 'Position your face inside the dashed oval targeting reticle. When centered, hold steady for 1 second and tap "Scan & Capture Face Photo".',
      tip: 'The system instantly confirms liveness and locks your verified profile headshot.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f1333] border border-cyan-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Biometric Face Scan Tutorial</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {roleTitle} Safety Standard
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Official guide for live camera anti-fraud liveness &amp; profile headshot verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Policy Context Callout */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
            <Lock className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs">Why is live face scanning required?</h4>
              <p className="text-[11px] text-purple-200/90 leading-relaxed">
                To protect Jamaican patients and verify clinical credentials, all {role === 'admin' ? 'Administrators' : 'Nurses and Caregivers'} must establish a live biometric headshot. Uploading pre-existing photos from gallery albums is strictly disabled to prevent identity spoofing.
              </p>
            </div>
          </div>

          {/* Interactive 4-Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TUTORIAL_STEPS.map((s) => {
              const IconComponent = s.icon;
              const isSelected = activeStep === s.step;
              return (
                <div
                  key={s.step}
                  onClick={() => {
                    setActiveStep(s.step);
                    soundFX.playToggleClick();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/60 shadow-lg shadow-cyan-950/50'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${s.color}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-xs">
                        {s.step}. {s.title}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {s.description}
                  </p>

                  <div className="text-[10px] text-cyan-300/90 font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    💡 <strong>Tip:</strong> {s.tip}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Do's vs Don'ts Checklist */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Face Scan Checklist</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              {/* DO */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DO (Recommended)</span>
                </span>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-1.5">✓ Center face inside oval guide</li>
                  <li className="flex items-center gap-1.5">✓ Neutral clinical facial expression</li>
                  <li className="flex items-center gap-1.5">✓ Clean lens and bright front lighting</li>
                  <li className="flex items-center gap-1.5">✓ Keep eyes wide open facing camera</li>
                </ul>
              </div>

              {/* DON'T */}
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>DON'T (Avoid)</span>
                </span>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-1.5">✕ Don't wear sunglasses or masks</li>
                  <li className="flex items-center gap-1.5">✕ Don't stand in front of bright windows</li>
                  <li className="flex items-center gap-1.5">✕ Don't tilt camera up from low angles</li>
                  <li className="flex items-center gap-1.5">✕ Don't upload photos from camera roll</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Practice Simulation Widget */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Oval Simulation Graphic */}
              <div className="relative w-16 h-20 rounded-[45%] border-2 border-dashed border-cyan-400 flex items-center justify-center bg-black/60 shrink-0 overflow-hidden shadow-inner">
                {isSimulating ? (
                  <>
                    <div 
                      className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-200"
                      style={{ top: `${simProgress}%` }}
                    />
                    {simProgress === 100 ? (
                      <Check className="w-6 h-6 text-emerald-400 animate-bounce" />
                    ) : (
                      <Eye className="w-5 h-5 text-cyan-300 animate-pulse" />
                    )}
                  </>
                ) : (
                  <Eye className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="space-y-0.5">
                <h5 className="font-bold text-white text-xs">Simulated Biometric Reticle</h5>
                <p className="text-[11px] text-slate-300">
                  {isSimulating 
                    ? simProgress === 100 
                      ? '✓ Biometric reticle matched & ready for live scan!' 
                      : `Aligning facial points... ${simProgress}%`
                    : 'See how the anti-spoofing oval locks onto your face.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartSimulation}
              disabled={isSimulating && simProgress < 100}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold border border-cyan-400/30 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSimulating && simProgress < 100 ? 'Testing...' : 'Test Oval Reticle'}
            </button>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 text-center sm:text-left">
            Have your camera ready and allow browser permissions when prompted.
          </span>

          <button
            type="button"
            onClick={() => {
              soundFX.playSuccessPing();
              onReadyToScan?.();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-cyan-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>I'm Ready — Start Live Face Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
