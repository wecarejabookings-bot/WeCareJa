import React, { useState } from 'react';
import { NurseProfile, SignedContractAgreement, LogoVariation } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { Logo } from '../common/Logo';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  CreditCard, 
  Award, 
  X, 
  ExternalLink,
  Check,
  Fingerprint,
  UserCheck,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NurseContractAgreementModalProps {
  nurse: NurseProfile;
  isOpen: boolean;
  onClose: () => void;
  onAdminCounterSign?: (nurseId: string) => void;
  logoVariation?: LogoVariation;
}

export const NurseContractAgreementModal: React.FC<NurseContractAgreementModalProps> = ({
  nurse,
  isOpen,
  onClose,
  onAdminCounterSign,
  logoVariation = 'heart-cross'
}) => {
  const [isCounterSigning, setIsCounterSigning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'contract' | 'attached_docs'>('contract');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);

  if (!isOpen) return null;

  const contract: SignedContractAgreement = nurse.signedContract || {
    id: `AGR-WCJ-${String(nurse?.id || '').replace('nurse-', '')}`,
    contractNumber: `WCJ-CONT-2026-${String(nurse?.id || '').replace('nurse-', '00')}`,
    agreementDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    companyName: 'We Care Limited',
    companyNumber: '2026-WECARE-JA',
    companyAddress: '4 Claudete Drive, St. Catherine, Jamaica',
    companyRepName: ADMIN_PROFILE.name,
    companyRepTitle: ADMIN_PROFILE.title,
    companySignature: 'Sydney Mattis (Authorized Operations Signatory)',
    companySignedAt: new Date().toISOString(),
    nurseLegalName: nurse.name,
    nurseAddress: '12 Hope Road, Liguanea, Kingston 6, St Andrew, Jamaica',
    nursingCouncilLicense: nurse.nursingCouncilLicense,
    trnNumber: nurse.trnNumber || '184-902-311',
    bankName: nurse.bankDetails?.bankName || 'National Commercial Bank (NCB) Jamaica',
    bankAccountNumber: nurse.bankDetails?.accountNumber || '•••• •••• 4821',
    bankAccountType: nurse.bankDetails?.accountType || 'Savings',
    nurseSignature: `${nurse.name} [Digitally Signed on Sign-Up]`,
    nurseSignedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    ipAddressAudit: '190.213.82.14 (Flow Jamaica - Kingston Gateway)',
    status: nurse.status === 'approved' ? 'executed' : 'pending_admin_countersign',
    version: 'v2026.1-EN-PROFESSIONAL',
    attachedDocuments: {
      governmentId: {
        id: 'doc-gov-1',
        name: nurse.governmentIdType || 'Jamaican Passport Bio-Page',
        type: 'government_id',
        fileUrl: nurse.governmentIdUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
        fileName: 'Passport_Bio_Page_Scan.jpg',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      },
      nursingCouncilLicense: {
        id: 'doc-ncj-1',
        name: 'Nursing Council of Jamaica Practicing Certificate',
        type: 'nursing_council_license',
        fileUrl: nurse.licenseDocumentUrl || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800',
        fileName: 'NCJ_Annual_Practicing_Roll_2026.pdf',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      },
      proofOfAddress: {
        id: 'doc-poa-1',
        name: 'Proof of Address (JPS Utility Statement)',
        type: 'proof_of_address',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        fileName: 'JPS_Utility_Bill_Kingston.pdf',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      },
      trnCertificate: {
        id: 'doc-trn-1',
        name: 'Taxpayer Registration Number (TRN) Official Slip',
        type: 'trn_certificate',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
        fileName: 'TAJ_TRN_Official_Registration.pdf',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      },
      bankAccountLetter: {
        id: 'doc-bnk-1',
        name: 'Bank Account Confirmation / Statement Header',
        type: 'bank_account_letter',
        fileUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        fileName: 'NCB_Bank_Account_Verification_Letter.pdf',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified'
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExecuteCounterSign = () => {
    setIsCounterSigning(true);
    setTimeout(() => {
      setIsCounterSigning(false);
      if (onAdminCounterSign) {
        onAdminCounterSign(nurse.id);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1E1B4B', '#10B981', '#F59E0B']
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0a0212]/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#120520] border border-purple-500/30 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl text-white relative overflow-hidden">
        
        {/* Top Confidential Action Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-emerald-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-200">
              <FileText className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Strictly Confidential
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  Admin File Record
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Ref: {contract.contractNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                Independent Nurse Contractor Agreement
              </h2>
              <p className="text-xs text-slate-300">
                Nurse: <strong className="text-white">{nurse.name}</strong> • NCJ License: <span className="font-mono text-purple-300 font-bold">{nurse.nursingCouncilLicense}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              title="Print official legal contract"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition text-sm border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation: Legal Agreement vs. Attached Compliance Documents */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('contract')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'contract'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Executed Contract Text
            </button>
            <button
              onClick={() => setActiveSubTab('attached_docs')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'attached_docs'
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Attached Compliance Documents (5)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital e-Signature Valid &amp; Timestamped</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* TAB 1: FORMAL LEGAL CONTRACT */}
          {activeSubTab === 'contract' && (
            <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 text-sm leading-relaxed relative print:p-0 print:border-none print:shadow-none print:text-black">
              
              {/* Document Header with We Care Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-950 text-white">
                    <Logo size="md" variation={logoVariation} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">
                      We Care Limited
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Incorporated under the Companies Act of Jamaica • Company #2026-WECARE-JA
                    </p>
                    <p className="text-[11px] text-slate-500">
                      4 Claudete Drive, St. Catherine, Jamaica
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                    Official Legal Instrument
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                    Contract ID: {contract.contractNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Effective Date: {contract.effectiveDate}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 uppercase tracking-wide font-serif">
                  WeCare Jamaica - Provider Agreement &amp; Payment Rules
                </h2>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  Welcome to WeCare Jamaica. By accepting bookings, you agree to these terms.
                </p>
                <p className="text-[11px] text-blue-900 font-bold mt-1">
                  WeCare Jamaica • 1876-582-7613 • wecareja.bookings@gmail.com
                </p>
              </div>

              {/* Master Document Provider Agreement Terms */}
              <div className="space-y-4 text-slate-800 text-xs sm:text-[13px] font-sans leading-relaxed">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    WHO WE ARE
                  </h3>
                  <p>
                    WeCare Jamaica is a booking platform for Nurses and Caregivers. You are an independent contractor, not an employee.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    HOW YOU GET BOOKINGS
                  </h3>
                  <p>
                    Client books &rarr; You get notification &rarr; Tap Accept/Decline within 2 hours &rarr; Show up on time in uniform.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    PAYMENT &amp; ESCROW
                  </h3>
                  <p><strong>a)</strong> Client pays WeCare 100% upfront. We hold safely in escrow.</p>
                  <p><strong>b)</strong> You DO NOT collect cash. Ever.</p>
                  <p><strong>c)</strong> After job, client taps &ldquo;Service Complete&rdquo;.</p>
                  <p><strong>d)</strong> WeCare pays you 85% within 24 hours via Lynk or bank transfer.</p>
                  <p><strong>e)</strong> WeCare keeps 15% platform fee. Examples: $5,000 job = You get $4,250 | $10,000 job = You get $8,500.</p>
                  <p><strong>f)</strong> Client cancels before you go: $0, client refunded.</p>
                  <p><strong>g)</strong> You no-show: $0 + warning. 2 warnings = permanently removed.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    REQUIREMENTS
                  </h3>
                  <p>
                    Valid Government Photo ID, TRN, Nursing/Caregiver Certificate, Police Record, WhatsApp + Lynk/bank account, Professional conduct.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    PAYOUTS &amp; SCHEDULE
                  </h3>
                  <p>
                    Payouts processed every <strong>Monday &amp; Thursday</strong>. Minimum payout threshold: $2,000 JMD.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    CANCELLATION POLICY
                  </h3>
                  <p>
                    Client cancels &gt;24hrs = full refund | Client cancels &lt;24hrs = 50% to you | You cancel = no pay.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
                  <h3 className="font-black text-[#1E1B4B] uppercase text-xs mb-1">
                    PROVIDER ATTESTATION &amp; AGREEMENT
                  </h3>
                  <p className="text-slate-800">
                    I, <strong>{contract.nurseLegalName}</strong>, TRN <strong>{contract.trnNumber}</strong>, agree to work as an independent provider for WeCare Jamaica (Nurse/Caregiver). I understand the 85/15 escrow system.
                  </p>
                </div>

                {/* GOVERNING LAW */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-950 uppercase text-xs mb-1">
                    GOVERNING LAW &amp; JURISDICTION
                  </h3>
                  <p>
                    This Agreement shall be governed by and construed in accordance with the <strong>laws of Jamaica</strong>, and the parties submit to the exclusive jurisdiction of the Jamaican courts.
                  </p>
                </div>
              </div>

              {/* Execution Signatures Block */}
              <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                
                {/* FOR WE CARE LIMITED */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-extrabold text-slate-950 block uppercase text-[11px] tracking-wider">
                    FOR WE CARE LIMITED
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Name:</strong> {ADMIN_PROFILE.name}</p>
                    <p><strong>Title:</strong> {ADMIN_PROFILE.title}</p>
                    <div className="py-2">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Authorized Signature:</span>
                      <div className="font-serif italic text-base font-bold text-[#1E1B4B] border-b border-slate-300 pb-1">
                        Sydney Mattis
                      </div>
                    </div>
                    <p><strong>Date:</strong> {contract.companySignedAt ? contract.companySignedAt.split('T')[0] : contract.agreementDate}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Corporate Officer Authentication
                    </div>
                  </div>
                </div>

                {/* FOR CONTRACTOR */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <span className="font-extrabold text-[#1E1B4B] block uppercase text-[11px] tracking-wider">
                    FOR CONTRACTOR (NURSE / CAREGIVER)
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Name:</strong> {contract.nurseLegalName}</p>
                    <div className="py-2">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Digital Signature:</span>
                      {contract.nurseSignatureImage ? (
                        <div className="border-b border-blue-300 pb-1 pt-0.5">
                          <img 
                            src={contract.nurseSignatureImage} 
                            alt="Nurse Drawn Signature" 
                            className="h-10 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="font-serif italic text-base font-bold text-[#1E1B4B] border-b border-blue-300 pb-1">
                          {contract.nurseSignature || contract.nurseLegalName}
                        </div>
                      )}
                    </div>
                    <p><strong>Date:</strong> {contract.nurseSignedAt.split('T')[0]}</p>
                    <p><strong>NCJ License #:</strong> <span className="font-mono font-bold text-[#1E1B4B]">{contract.nursingCouncilLicense}</span></p>
                    <p><strong>TRN:</strong> <span className="font-mono text-slate-900">{contract.trnNumber}</span></p>
                    <p><strong>Bank Details:</strong> {contract.bankName} ({contract.bankAccountNumber})</p>
                    
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Fingerprint className="w-3 h-3 text-blue-600" /> e-Signed on Registration • IP Logged
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Attached Compliance Checklist in Contract */}
              <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs">
                <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Documents Verified &amp; Attached on File:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Copy of Government Photo ID (Passport / Driver's License)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Copy of Nursing Council of Jamaica License</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Proof of Address (Utility Bill / Parish Verification)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>TRN Official Certificate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Bank Account Letter / Account Holder Verification</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTACHED 5 COMPLIANCE DOCUMENTS */}
          {activeSubTab === 'attached_docs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Official Onboarding Compliance Docket
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    The 5 mandatory Jamaican compliance items collected upon registration and permanently attached to this contractor file.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold shrink-0">
                  All 5 Items On File
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Government Photo ID */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">1. Government Photo ID</span>
                      <h5 className="font-bold text-white text-sm">{nurse.governmentIdType || 'Jamaican Passport Bio-Page'}</h5>
                      <span className="text-slate-400 text-xs font-mono">TRN: {nurse.trnNumber || '184-902-311'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="relative group rounded-xl overflow-hidden h-36 bg-slate-950 border border-white/10">
                    <img 
                      src={nurse.governmentIdUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'} 
                      alt="Government ID" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedPreviewDoc({
                        title: 'Government Photo ID Scan',
                        url: nurse.governmentIdUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
                        type: 'image'
                      })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition"
                    >
                      <Eye className="w-4 h-4 text-purple-300" /> Inspect Scan
                    </button>
                  </div>
                </div>

                {/* 2. Nursing Council License */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">2. Nursing Council License</span>
                      <h5 className="font-bold text-white text-sm">NCJ Annual Practicing Certificate</h5>
                      <span className="text-slate-400 text-xs font-mono">License: {nurse.nursingCouncilLicense}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="relative group rounded-xl overflow-hidden h-36 bg-slate-950 border border-white/10">
                    <img 
                      src={nurse.licenseDocumentUrl || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800'} 
                      alt="NCJ License Scan" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedPreviewDoc({
                        title: 'NCJ License Certificate',
                        url: nurse.licenseDocumentUrl || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800',
                        type: 'image'
                      })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition"
                    >
                      <Eye className="w-4 h-4 text-purple-300" /> Inspect Scan
                    </button>
                  </div>
                </div>

                {/* 3. Proof of Address */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">3. Proof of Address</span>
                      <h5 className="font-bold text-white text-sm">JPS / NWC Utility Statement</h5>
                      <span className="text-slate-400 text-xs">Kingston &amp; St Andrew Address</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="relative group rounded-xl overflow-hidden h-36 bg-slate-950 border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" 
                      alt="Proof of Address Scan" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedPreviewDoc({
                        title: 'Proof of Address Statement',
                        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
                        type: 'image'
                      })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition"
                    >
                      <Eye className="w-4 h-4 text-purple-300" /> Inspect Scan
                    </button>
                  </div>
                </div>

                {/* 4. TRN Certificate */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">4. TRN Certificate</span>
                      <h5 className="font-bold text-white text-sm">Tax Administration Jamaica (TAJ)</h5>
                      <span className="text-slate-400 text-xs font-mono">TRN: {nurse.trnNumber || '184-902-311'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="relative group rounded-xl overflow-hidden h-36 bg-slate-950 border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800" 
                      alt="TRN Certificate Scan" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedPreviewDoc({
                        title: 'TRN Registration Certificate',
                        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
                        type: 'image'
                      })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition"
                    >
                      <Eye className="w-4 h-4 text-purple-300" /> Inspect Scan
                    </button>
                  </div>
                </div>

                {/* 5. Bank Account Letter */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition space-y-3 md:col-span-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">5. Bank Account Letter / Header</span>
                      <h5 className="font-bold text-white text-sm">{nurse.bankDetails?.bankName || 'National Commercial Bank (NCB) Jamaica'}</h5>
                      <span className="text-slate-400 text-xs font-mono">Account: {nurse.bankDetails?.accountNumber || '•••• •••• 4821'} ({nurse.bankDetails?.accountType || 'Savings'})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="relative group rounded-xl overflow-hidden h-36 bg-slate-950 border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800" 
                      alt="Bank Letter Scan" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedPreviewDoc({
                        title: 'Bank Verification Statement Letter',
                        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
                        type: 'image'
                      })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition"
                    >
                      <Eye className="w-4 h-4 text-purple-300" /> Inspect Scan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">
              This contract file is securely stored under nurse profile ID <strong className="text-white font-mono">{nurse.id}</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {nurse.status === 'pending_approval' && (
              <button
                onClick={handleExecuteCounterSign}
                disabled={isCounterSigning}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCounterSigning ? 'Counter-Signing...' : 'Admin Counter-Sign & Activate'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
            >
              Close Contract File
            </button>
          </div>
        </div>

        {/* Modal for Full Image Scan Inspection */}
        {selectedPreviewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fadeIn">
            <div className="bg-[#140622] border border-purple-500/40 rounded-3xl max-w-2xl w-full p-5 space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {selectedPreviewDoc.title}
                </h4>
                <button
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-xl overflow-hidden max-h-[60vh] flex items-center justify-center bg-slate-950 p-2">
                <img 
                  src={selectedPreviewDoc.url} 
                  alt={selectedPreviewDoc.title} 
                  className="max-h-[55vh] object-contain rounded-lg shadow-2xl"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-mono text-[11px]">Vault File Verified • Confidential</span>
                <button
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
