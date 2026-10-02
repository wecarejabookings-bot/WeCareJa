import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Link2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Download,
  Check,
  Apple
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface TestOnPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestOnPhoneModal: React.FC<TestOnPhoneModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'qr' | 'install' | 'testflight' | 'roles'>('qr');

  if (!isOpen) return null;

  // Use the live preview / container domain if available, or fallback to the current window location
  const liveUrl = typeof window !== 'undefined' 
    ? window.location.href.split('?')[0].split('#')[0] 
    : 'https://ais-pre-r6crngqhjv3njpykl7wyg7-152138080594.us-east1.run.app';

  // QR Code URL via reliable public QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(liveUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    soundFX.playToggleClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Here is the link to test run the We Care Home Care app on your phone:\n${liveUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#140620] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Test Run on Your Phone</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C77DFF] text-[10px] font-bold border border-purple-500/30">
                  Mobile PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Scan with your phone camera or share your secure private link.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Access Control & Security Notice */}
        <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Private Access Control Guarantee</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your application runs on a dedicated, private Google Cloud instance. It is <strong className="text-white">only accessible to you and anyone you explicitly share this link or QR code with</strong>. No one outside your link holders can discover or browse your application data.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveMobileTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMobileTab === 'qr'
                ? 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Instant QR Scan</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('install')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMobileTab === 'install'
                ? 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add to Home Screen</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('testflight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMobileTab === 'testflight'
                ? 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-slate-200" />
            <span>iOS &amp; TestFlight</span>
          </button>

          <button
            onClick={() => setActiveMobileTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMobileTab === 'roles'
                ? 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Testing All 3 Roles</span>
          </button>
        </div>

        {/* TAB 1: QR CODE & LINK SHARING */}
        {activeMobileTab === 'qr' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-black/40 border border-white/10">
              
              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR Code to open on mobile"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="text-[10px] text-slate-800 font-bold mt-1">Point Phone Camera Here</span>
              </div>

              {/* Instructions and Direct Link */}
              <div className="space-y-3 flex-1 text-xs">
                <div>
                  <h4 className="font-extrabold text-sm text-white">How to open on iPhone or Android:</h4>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1.5 mt-2">
                    <li>Open your smartphone's built-in <strong>Camera app</strong>.</li>
                    <li>Point the lens at the QR code on your computer screen.</li>
                    <li>Tap the banner notification that appears to open <strong>We Care</strong> instantly.</li>
                  </ol>
                </div>

                {/* Direct Link Copy */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Your Direct Secure App Link:</span>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/15">
                    <span className="text-[11px] text-purple-300 font-mono truncate flex-1">{liveUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD TO HOME SCREEN (PWA) */}
        {activeMobileTab === 'install' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* iOS */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Smartphone className="w-4 h-4" />
                <h4 className="text-sm text-white font-black">Apple iPhone / iPad (Safari)</h4>
              </div>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                <li>Open your secure We Care link in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (the square icon with an upward arrow at the bottom).</li>
                <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
                <li>Tap <strong>'Add'</strong> in the top right corner.</li>
              </ol>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                ✨ The app will open full-screen like a native iOS app with high-definition icons and instant touch response!
              </div>
            </div>

            {/* Android */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Smartphone className="w-4 h-4" />
                <h4 className="text-sm text-white font-black">Android (Chrome)</h4>
              </div>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                <li>Open the link in <strong>Google Chrome</strong>.</li>
                <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</li>
                <li>Select <strong>'Install App'</strong> or <strong>'Add to Home screen'</strong>.</li>
                <li>Tap <strong>'Install'</strong> to confirm.</li>
              </ol>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200">
                ✨ Enables audio chime alerts, fast offline caching, and instant home-screen launch!
              </div>
            </div>
          </div>
        )}

        {/* TAB: iOS & APPLE TESTFLIGHT */}
        {activeMobileTab === 'testflight' && (
          <div className="space-y-4 text-xs animate-fadeIn">
            {/* Quick Answer: Instant Testing on iPhone */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                <Apple className="w-4 h-4 text-white" />
                <span>Good News: You can test on iPhone right now without TestFlight!</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                Because <strong>We Care Jamaica</strong> is built as a Progressive Web App (PWA), you do <em>not</em> need to wait days for Apple TestFlight review or pay the $99/yr Apple fee just to test it on your iPhone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                  <span className="font-bold text-white text-base">1</span>
                  <span>Open Safari on iPhone and load this link</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                  <span className="font-bold text-white text-base">2</span>
                  <span>Tap <strong>Share</strong> (box with arrow)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                  <span className="font-bold text-white text-base">3</span>
                  <span>Tap <strong>'Add to Home Screen'</strong></span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold pt-1">
                ✓ Launches with a standalone app icon, full-screen iOS UI, offline caching, and instant responsiveness.
              </p>
            </div>

            {/* Native TestFlight Pipeline Explanation */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>How to Publish to Apple TestFlight (App Store Connect)</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                  Xcode &amp; App Store Connect
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                TestFlight is Apple's beta invitation service for native <span className="font-mono text-white">.ipa</span> builds. To upload this app to TestFlight, follow these 3 standard steps:
              </p>
              
              <div className="space-y-2 text-slate-300">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">Step 1: Apple Developer Account ($99/year)</strong>
                  <p>Register an organization or individual developer account at <span className="text-purple-300 font-mono">developer.apple.com</span>.</p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">Step 2: Add Capacitor iOS Container</strong>
                  <p className="font-mono text-[11px] text-emerald-400 p-2 rounded-lg bg-black/60 overflow-x-auto">
                    npm install @capacitor/core @capacitor/cli @capacitor/ios<br/>
                    npx cap init "We Care Jamaica" "com.wecarejamaica.app"<br/>
                    npm run build &amp;&amp; npx cap add ios<br/>
                    npx cap open ios
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-white block">Step 3: Archive &amp; Distribute to TestFlight</strong>
                  <p>In Xcode, click <strong>Product → Archive → Distribute App → TestFlight &amp; App Store</strong>. Once uploaded, invite internal or external testers in App Store Connect with an instant public link.</p>
                </div>
              </div>
            </div>

            {/* Reviewer / Test Credentials */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">Need the pre-set App Reviewer / Tester logins?</span>
                <span className="text-slate-400 text-[11px]">Demo client and nurse accounts for Apple App Review and TestFlight testers.</span>
              </div>
              <button
                onClick={() => setActiveMobileTab('roles')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
              >
                View Accounts
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TESTING ALL 3 ROLES ON MOBILE */}
        {activeMobileTab === 'roles' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              When testing on your phone, you can test how one user's action immediately updates another user's screen:
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-white block">Patient / Family Caregiver Role:</strong>
                  <span className="text-slate-300">
                    Book a home visit, view the GPS route of the incoming nurse, review vital signs logs, and start a video consultation.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-white block">Nurse / Caregiver Role:</strong>
                  <span className="text-slate-300">
                    Accept new visit requests in Kingston, start the live clinical timer, record vitals, close out with an auto-calculated 85% payout invoice, or register with your school.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-white block">Clinical Administration:</strong>
                  <span className="text-slate-300">
                    Audit nurse performance charts with Recharts, schedule video meetings, approve newly submitted nursing schools, and verify NCJ licenses.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 text-white font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
