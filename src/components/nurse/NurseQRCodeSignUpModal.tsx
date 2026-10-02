import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { NurseProfile } from '../../types';
import { 
  QrCode, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  UserPlus, 
  Camera, 
  Upload, 
  ArrowRight,
  Stethoscope,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NurseQRCodeSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickSignUpNurse?: (newNurse: NurseProfile) => void;
}

export const NurseQRCodeSignUpModal: React.FC<NurseQRCodeSignUpModalProps> = ({
  isOpen,
  onClose,
  onQuickSignUpNurse
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('Kingston, St. Andrew, Portmore & Spanish Town');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'form' | 'scan'>('qr');
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickLicense, setQuickLicense] = useState('');
  const [quickSpecialty, setQuickSpecialty] = useState('Elderly Care & Vitals');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const qrContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Real deep link URL that launches the app directly into nurse onboarding
  const signUpUrl = `https://wecare.jm/nurse/signup?ref=qr_recruitment&zone=${encodeURIComponent(selectedZone)}&license_check=ncj_fasttrack`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signUpUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFastFillSample = () => {
    setQuickName('Nurse Tiana Blake, RN');
    setQuickPhone('+1 (876) 555-8392');
    setQuickEmail('tiana.blake@wecare.jm');
    setQuickLicense('NCJ-RN-2023-9912');
    setQuickSpecialty('Wound Care & Post-Op Recovery');
  };

  const handleSubmitQuickForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickLicense) return;

    const newNurse: NurseProfile = {
      id: `nurse-qr-${Date.now()}`,
      name: quickName,
      phone: quickPhone || '+1 (876) 555-0199',
      email: quickEmail || `${String(quickName || 'nurse').toLowerCase().replace(/[^a-z]/g, '')}@wecare.jm`,
      photoUrl: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400',
      nursingCouncilLicense: quickLicense,
      licenseVerified: false, // Sent to Admin for NCJ verification
      status: 'pending_approval',
      rating: 5.0,
      reviewCount: 1,
      yearsExperience: 4,
      specialties: [quickSpecialty, 'Emergency Response', 'Vitals'],
      zones: ['New Kingston & Liguanea', 'Portmore - Greater Portmore', 'Spanish Town Central'],
      hourlyRateJMD: 7500,
      currentLat: 18.0179,
      currentLng: -76.7845,
      bio: `NCJ Registered Nurse registered via Quick QR Code Fast-Track. Serving patients across Kingston, St. Andrew, Portmore, and Spanish Town.`,
      bankDetails: {
        bankName: 'National Commercial Bank (NCB) Jamaica',
        accountNumber: '•••• •••• 8821',
        accountType: 'Savings'
      },
      totalEarningsJMD: 0,
      pendingPayoutJMD: 0,
      completedVisitsCount: 0
    };

    if (onQuickSignUpNurse) {
      onQuickSignUpNurse(newNurse);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7209B7', '#10B981', '#E63946', '#C77DFF']
    });

    setSignUpSuccess(true);
    setTimeout(() => {
      setSignUpSuccess(false);
      onClose();
    }, 2200);
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f0416]/85 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/15 p-6 md:p-8 text-white relative">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7209B7]/40 text-[#C77DFF] border border-purple-400/30 flex items-center gap-1.5 shadow-sm">
                <QrCode className="w-3.5 h-3.5 text-[#C77DFF]" /> Instant Nurse Onboarding
              </span>
              <span className="text-xs text-slate-400">Kingston, St. Andrew, Portmore &amp; Spanish Town</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
              <span>Quick Nurse QR Code Sign-Up</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Scan with any mobile camera or tablet to immediately open the licensed nurse onboarding application.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 my-5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'qr'
                ? 'bg-[#7209B7] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Recruitment QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'form'
                ? 'bg-[#7209B7] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Instant 30s Form</span>
          </button>
        </div>

        {activeTab === 'qr' && (
          <div className="space-y-6">
            {/* Center QR Showcase */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.04] border border-white/10 shadow-inner">
              <div 
                ref={qrContainerRef}
                className="p-5 rounded-3xl bg-white text-slate-900 shadow-2xl border-4 border-purple-500/40 flex flex-col items-center"
              >
                <QRCodeSVG
                  value={signUpUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=100",
                    x: undefined,
                    y: undefined,
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
                <div className="text-center mt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-900 block">
                    We Care Jamaica
                  </span>
                  <span className="text-[9px] font-semibold text-slate-600 block">
                    Licensed Nurse Fast Sign-Up
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center space-y-1">
                <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Point Camera at QR Code
                </span>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Opens the mobile-optimized signup screen with nurse earnings calculator, NCJ license validator, and instant onboarding.
                </p>
              </div>
            </div>

            {/* Target Region Customizer */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Select Recruitment Campaign Zone:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Kingston & St Andrew',
                  'Portmore & St. Catherine',
                  'Spanish Town Central'
                ].map(zone => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                      selectedZone.includes(zone.split(' ')[0])
                        ? 'bg-purple-500/20 text-white border-purple-400/40 shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{zone}</span>
                    {selectedZone.includes(zone.split(' ')[0]) && <Check className="w-3.5 h-3.5 text-purple-300" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Signup Link'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintFlyer}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-300" />
                  <span>Print Recruitment Flyer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <form onSubmit={handleSubmitQuickForm} className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-300 block">Fast-Track Nurse Registration</span>
                <p className="text-[11px] text-slate-300">Enter nurse details to instantly activate on-call status for Kingston, St. Andrew, Portmore &amp; Spanish Town.</p>
              </div>
              <button
                type="button"
                onClick={handleFastFillSample}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold transition border border-white/10 shrink-0"
              >
                Auto-Fill Sample Nurse
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name &amp; Credentials *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nurse Tiana Blake, RN"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nursing Council License # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NCJ-RN-2023-9912"
                  value={quickLicense}
                  onChange={(e) => setQuickLicense(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jamaican Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (876) 555-8392"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="nurse@wecare.jm"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Specialties</label>
              <select
                value={quickSpecialty}
                onChange={(e) => setQuickSpecialty(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Elderly Care & Vitals" className="bg-[#150722] text-white">Elderly Care &amp; Chronic Disease Vitals</option>
                <option value="Wound Care & Post-Op Recovery" className="bg-[#150722] text-white">Wound Care &amp; Post-Op Recovery</option>
                <option value="Postnatal & Newborn Wellness" className="bg-[#150722] text-white">Postnatal Care &amp; Newborn Midwifery</option>
                <option value="IV Therapy & Injections" className="bg-[#150722] text-white">IV Therapy, Hydration &amp; Scheduled Injections</option>
                <option value="Emergency Response & Phlebotomy" className="bg-[#150722] text-white">Emergency Response &amp; Blood Draw</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                By registering, the nurse agrees to the 85/15 earnings split, Weekly Friday payouts, and adherence to Nursing Council of Jamaica standards.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-900/50 transition flex items-center gap-2"
              >
                {signUpSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Nurse Activated!</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Activate Nurse Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
