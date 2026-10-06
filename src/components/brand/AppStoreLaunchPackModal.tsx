import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { LogoVariation } from '../../types';
import { 
  X, 
  Apple, 
  Smartphone, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Star, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface AppStoreLaunchPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoVariation?: LogoVariation;
}

export const AppStoreLaunchPackModal: React.FC<AppStoreLaunchPackModalProps> = ({
  isOpen,
  onClose,
  logoVariation = 'heart-cross'
}) => {
  const [platform, setPlatform] = useState<'ios' | 'testflight' | 'android' | 'reviewers'>('ios');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundFX.playSuccessSoftDing();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#120224] border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variation={logoVariation} size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>We Care Jamaica • App Store &amp; Google Play Launch Pack</span>
              </h2>
              <p className="text-xs text-purple-200">
                Sections 16 &amp; 17 • Production store listings, keywords, and reviewer credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex flex-wrap border-b border-white/10 bg-black/20 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              platform === 'ios' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple App Store</span>
          </button>
          <button
            onClick={() => setPlatform('testflight')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              platform === 'testflight' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>TestFlight (iOS Beta)</span>
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              platform === 'android' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play</span>
          </button>
          <button
            onClick={() => setPlatform('reviewers')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              platform === 'reviewers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Reviewer Logins</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-200 flex-1">
          {/* iOS LISTING */}
          {platform === 'ios' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">App Title (30 characters)</span>
                  <div className="flex items-center justify-between text-white font-extrabold text-base mt-0.5">
                    <span>We Care Jamaica</span>
                    <button 
                      onClick={() => handleCopy('We Care Jamaica', 'ios-title')}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'ios-title' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">Subtitle (30 characters)</span>
                  <div className="flex items-center justify-between text-white font-bold text-sm mt-0.5">
                    <span>Nurses to Your Door</span>
                    <button 
                      onClick={() => handleCopy('Nurses to Your Door', 'ios-sub')}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'ios-sub' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">Category</span>
                  <p className="text-white font-semibold">Primary: Medical • Secondary: Health &amp; Fitness</p>
                </div>
              </div>

              {/* Full Description */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] text-purple-300 font-bold uppercase block">Full App Description</span>
                <p className="leading-relaxed text-xs">
                  We Care Jamaica connects families in Kingston, St. Andrew, Portmore &amp; Spanish Town with licensed registered nurses, practical nurses, and certified caregivers for on-demand home healthcare and companion services.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                  <p className="font-bold text-white">WHAT WE OFFER:</p>
                  <p>• Elderly care &amp; companionship</p>
                  <p>• Post-op recovery support</p>
                  <p>• Diabetes management &amp; glucose monitoring</p>
                  <p>• Wellness checks &amp; vitals tracking</p>
                  <p>• Medication reminders &amp; assistance</p>
                  <p>• Certified caregiver home help</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                  <p className="font-bold text-white">EVERY HELPER VERIFIED:</p>
                  <p>• Nursing Council of Jamaica (NCJ) license checked</p>
                  <p>• Government photo ID verified</p>
                  <p>• Nursing school credentials authenticated</p>
                  <p>• Background check with official police record tracking</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                  <p className="font-bold text-white">SAFETY FIRST:</p>
                  <p>• Live nurse arrival tracking</p>
                  <p>• Doorstep QR code check-in</p>
                  <p>• 24/7 SOS panic button with 119 integration</p>
                  <p>• In-app chat</p>
                  <p>• Itemized digital receipts for health insurance claims (Sagicor, Guardian Life, Medecus)</p>
                </div>
              </div>

              {/* Keywords */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">App Store Keywords (100 Characters)</span>
                  <button 
                    onClick={() => handleCopy('nurse,jamaica,homecare,elderly care,kingston,caregiver,health,nursing,doctor,post-op,diabetes,vitals', 'ios-kw')}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'ios-kw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-emerald-300 break-all p-2 rounded-xl bg-black/40 border border-white/10">
                  nurse,jamaica,homecare,elderly care,kingston,caregiver,health,nursing,doctor,post-op,diabetes,vitals
                </p>
              </div>
            </div>
          )}

          {/* TESTFLIGHT (iOS BETA) */}
          {platform === 'testflight' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 space-y-2">
                <span className="text-[11px] font-bold text-blue-300 uppercase block">
                  Apple TestFlight Beta Distribution Guide
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  TestFlight lets you distribute pre-release native builds of <strong className="text-white">We Care Jamaica</strong> to up to 10,000 testers via a public link or email invitation before public App Store launch.
                </p>
              </div>

              {/* iOS Bundle & Config Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">Bundle Identifier</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-300 text-xs font-bold">com.wecarejamaica.app</span>
                    <button
                      onClick={() => handleCopy('com.wecarejamaica.app', 'bundle-id')}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'bundle-id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">App Store Version &amp; Build</span>
                  <span className="font-mono text-white text-xs font-bold">Version 1.0.0 (Build 1)</span>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm">How to Generate Your TestFlight Build:</h4>
                
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">1. Apple Developer Enrollment:</strong>
                    <span className="text-slate-300">
                      Sign in to <span className="text-purple-300 font-mono">developer.apple.com</span> with your Apple ID and enroll in the Apple Developer Program ($99 USD/year).
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white">2. Capacitor Native Packaging Commands:</strong>
                      <button
                        onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/ios\nnpx cap init "We Care Jamaica" "com.wecarejamaica.app"\nnpm run build\nnpx cap add ios\nnpx cap open ios', 'cap-cmd')}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'cap-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Commands</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-black/80 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "We Care Jamaica" "com.wecarejamaica.app"
npm run build
npx cap add ios
npx cap open ios`}
                    </pre>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">3. Archive in Xcode:</strong>
                    <span className="text-slate-300">
                      In Xcode, select <em>Any iOS Device (arm64)</em> → click <strong>Product → Archive</strong> → click <strong>Distribute App → TestFlight &amp; App Store</strong>.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <strong className="text-white block mb-1">4. Create Public TestFlight Link:</strong>
                    <span className="text-slate-300">
                      In App Store Connect under the <strong>TestFlight</strong> tab, click <strong>External Groups</strong> → Add Group (e.g., "Jamaica Beta Nurses &amp; Families") → Enable <strong>Public Link</strong> to share with anyone!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANDROID LISTING */}
          {platform === 'android' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">App Title (50 characters)</span>
                  <div className="flex items-center justify-between text-white font-extrabold text-base mt-0.5">
                    <span>We Care Jamaica - Home Nurses &amp; Caregivers</span>
                    <button 
                      onClick={() => handleCopy('We Care Jamaica - Home Nurses & Caregivers', 'android-title')}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'android-title' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Short Description (80 characters)</span>
                  <div className="flex items-center justify-between text-white font-bold text-sm mt-0.5">
                    <span>Licensed nurses &amp; caregivers to your door in 90 mins. Kingston &amp; beyond.</span>
                    <button 
                      onClick={() => handleCopy('Licensed nurses & caregivers to your door in 90 mins. Kingston & beyond.', 'android-short')}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'android-short' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Screenshot Headlines */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">5 Required Screenshot Headlines</span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span>1. "Licensed Nurses to Your Door in 90 Minutes"</span>
                    <span className="text-purple-300 text-[10px]">Home Screen</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span>2. "Every Helper Verified — NCJ License, ID &amp; School"</span>
                    <span className="text-purple-300 text-[10px]">Verified Badge</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span>3. "Live Arrival Tracking with Doorbell Chime"</span>
                    <span className="text-purple-300 text-[10px]">Tracking Map</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span>4. "QR Check-in at Your Doorstep"</span>
                    <span className="text-purple-300 text-[10px]">QR Code View</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span>5. "Insurance-Ready Receipts &amp; Visit Notes"</span>
                    <span className="text-purple-300 text-[10px]">Receipt View</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APP REVIEWER CREDENTIALS */}
          {platform === 'reviewers' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <span className="text-[11px] font-bold text-indigo-300 uppercase block">
                  Apple App Store &amp; Google Play Console Review Notes
                </span>
                <p className="text-xs text-slate-200">
                  Include these pre-configured demo test accounts in App Store Connect &amp; Google Play Console so reviewers can test client booking, nurse duty dispatch, and admin verification without entering a real payment method:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Client Reviewer */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Client Reviewer Account</span>
                  <div className="space-y-1">
                    <div>Username: <span className="font-mono text-white font-bold">reviewer.client@wecareja.com</span></div>
                    <div>Password: <span className="font-mono text-white font-bold">WeCareTest2026!</span></div>
                    <div>Location: <span className="text-slate-300">Kingston 6 (Corporate Area)</span></div>
                  </div>
                </div>

                {/* Nurse Reviewer */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-purple-300">Nurse Reviewer Account</span>
                  <div className="space-y-1">
                    <div>Username: <span className="font-mono text-white font-bold">reviewer.nurse@wecareja.com</span></div>
                    <div>Password: <span className="font-mono text-white font-bold">WeCareNurse2026!</span></div>
                    <div>License: <span className="text-slate-300">NCJ-RN-2024-8192 (Verified)</span></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">Reviewer Instructions Notice:</p>
                <p>
                  "We Care Jamaica is a booking platform for independent licensed healthcare professionals in Jamaica. Reviewers can test full visit workflows with the demo profiles provided above. Emergency SOS dialing simulates calling Jamaica's 119 dispatch service."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">Corporate Area Launch Pack 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
