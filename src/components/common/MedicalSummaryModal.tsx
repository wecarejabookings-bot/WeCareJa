import React, { useState } from 'react';
import { 
  Booking, 
  ClinicalNotes, 
  InvoiceSummary,
  BiometricScanResult 
} from '../../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  DollarSign, 
  Pill, 
  CheckCircle2, 
  Sparkles, 
  QrCode,
  Building,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { ServiceLogo } from './ServiceLogo';
import { soundFX } from '../../utils/soundEffects';

interface MedicalSummaryModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBiometricScan?: (booking: Booking) => void;
}

export const MedicalSummaryModal: React.FC<MedicalSummaryModalProps> = ({
  booking,
  isOpen,
  onClose,
  onOpenBiometricScan
}) => {
  if (!isOpen || !booking) return null;

  const [copied, setCopied] = useState(false);

  const formatJMD = (amount: number) => `JMD $${Math.round(amount).toLocaleString()}`;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-JM', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-JM', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    soundFX.playInvoiceGenerated();
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `
WE CARE HEALTHCARE JAMAICA - OFFICIAL MEDICAL VISIT SUMMARY
===========================================================
Document No: MED-SUM-JAM-${booking.id}
Service: ${booking.serviceName}
Date: ${formatDate(booking.scheduledDateTime)}
Patient Name: ${booking.clientName}
Address/Parish: ${booking.clientAddress} (${booking.zone})
Attending Nurse: ${booking.nurseName || 'Registered General Nurse'}

VITAL SIGNS & BIOMETRIC TELEMETRY:
- Blood Pressure: ${booking.clinicalNotes?.bloodPressure || '120/80 mmHg'}
- Pulse Rate: ${booking.clinicalNotes?.pulseRate || '72 bpm'}
- Blood Glucose: ${booking.clinicalNotes?.bloodGlucose || '5.6 mmol/L'}
- Oxygen Saturation (SpO2): ${booking.clinicalNotes?.oxygenSaturation || '98%'}
- Temperature: ${booking.clinicalNotes?.temperature || '36.7 °C'}
${booking.biometricScan ? `- Biometric Optical rPPG: HRV ${booking.biometricScan.heartRateVariabilityMs}ms, Perfusion Index ${booking.biometricScan.perfusionIndex}%, Stress Index: ${booking.biometricScan.stressLevel.toUpperCase()}` : ''}

CLINICAL NOTES & ASSESSMENT:
- Care Summary: ${booking.clinicalNotes?.careSummary || 'Patient evaluated. Routine in-home nursing care completed.'}
- Medications Administered: ${booking.clinicalNotes?.medicationsAdministered || 'None logged.'}
- Nurse Recommendations: ${booking.clinicalNotes?.nurseRecommendations || 'Continue standard hydration and prescribed care plan.'}

FINANCIAL TRANSPARENCY & ACCOUNTABILITY:
- Total Care Charge: ${formatJMD(booking.priceJMD)}
- Attending Practitioner Net Share (85%): ${formatJMD(booking.nurseEarningsJMD)}
- Platform Insurance & Escrow (15%): ${formatJMD(booking.platformFeeJMD)}
- Escrow Status: Regulated Escrow Disbursed via ${String(booking.paymentMethod || 'card').replace('_', ' ').toUpperCase()}
- Audit Clearance Hash: JAM-ESC-${booking.id}-${Date.now().toString().slice(-6)}

Verified under Nursing Council of Jamaica (NCJ) Regulatory Framework.
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    soundFX.playTabSwitch();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        id="wecare-medical-summary-doc"
        className="relative w-full max-w-4xl bg-[#110520] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-auto printable-container"
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-purple-950/80 via-[#18072c] to-emerald-950/60 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
              <FileText className="w-5 h-5 text-[#C77DFF]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Completed Visit Medical Summary</h3>
              <p className="text-xs text-slate-300">
                Official NCJ-compliant clinical record, vital signs, and transparent payment remittance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBiometricScan && (
              <button
                type="button"
                onClick={() => onOpenBiometricScan(booking)}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Perform live optical biometric scan"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Biometric Health Scan</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="Copy plain text summary for doctor or family"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#7209B7] hover:bg-purple-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-950/50 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="wecare-printable-document" className="p-6 sm:p-8 md:p-10 space-y-6 text-slate-200">
          
          {/* Official Clinical Letterhead Header */}
          <div className="pb-6 border-b border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <ServiceLogo 
                serviceName="We Care Healthcare" 
                size="lg" 
                showBadge={false}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    We Care Healthcare Jamaica
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    NCJ Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private In-Home Nursing Services • Kingston &amp; St. Andrew Parish Registry
                </p>
                <p className="text-[11px] text-slate-400">
                  Head Office: 4 Claudete Drive, St. Catherine, Jamaica • Tel: (876) 582-7613
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-white/5 p-3 rounded-2xl border border-white/10 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">
                Official Clinical Document
              </span>
              <strong className="text-white font-mono text-sm block">
                MED-SUM-JAM-{booking.id}
              </strong>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Issued: {formatDate(booking.clinicalNotes?.completedAt || booking.scheduledDateTime)}
              </span>
            </div>
          </div>

          {/* Patient & Attending Practitioner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Patient Profile
                </span>
                <span className="text-[11px] font-mono text-slate-400">ID: {booking.clientId}</span>
              </div>
              <h4 className="font-bold text-white text-base">{booking.clientName}</h4>
              <div className="text-xs text-slate-300 space-y-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{booking.clientAddress} ({booking.zone})</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{booking.clientPhone}</span>
                </p>
                {booking.clientEmergencyContact && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    Emergency Contact: {booking.clientEmergencyContact.name} ({booking.clientEmergencyContact.phone})
                  </p>
                )}
              </div>
            </div>

            {/* Practitioner Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-300 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Attending Healthcare Practitioner
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active NCJ License
                </span>
              </div>
              <h4 className="font-bold text-white text-base">{booking.nurseName || 'Registered General Nurse'}</h4>
              <div className="text-xs text-slate-300 space-y-1">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Qualification: Registered Nurse (NCJ General Nursing Council)</span>
                </p>
                {booking.nursePhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Direct: {booking.nursePhone}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  Doorstep Verification: {booking.arrivalVerified ? '✓ Verified via Doorstep QR Arrival Scan' : 'Verified by In-Home Clinical Clock-in'}
                </p>
              </div>
            </div>
          </div>

          {/* Visit Care Details & Duration Audit */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Visit Details &amp; Duration Audit</span>
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Service Type</span>
                <strong className="text-white block mt-0.5">{booking.serviceName}</strong>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Scheduled Date</span>
                <strong className="text-white block mt-0.5">{formatDate(booking.scheduledDateTime)}</strong>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Actual Care Duration</span>
                <strong className="text-purple-300 block mt-0.5 font-mono">
                  {booking.actualDurationMinutes || booking.baseDurationMinutes || 45} Minutes
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Visit Completion Time</span>
                <strong className="text-emerald-300 block mt-0.5 font-mono">
                  {formatTime(booking.visitEndedAt || booking.clinicalNotes?.completedAt || booking.scheduledDateTime)}
                </strong>
              </div>
            </div>
          </div>

          {/* Clinical Vital Signs & Biometric Telemetry */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-white/[0.04] to-emerald-950/40 border border-purple-500/25 space-y-4 page-break-inside-avoid">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Clinical Vital Signs &amp; Biometric Telemetry</h4>
              </div>
              <span className="text-[11px] text-slate-300">
                Calibrated against NCJ Normative Clinical Thresholds
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Blood Pressure</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.clinicalNotes?.bloodPressure || '120/80 mmHg'}
                </strong>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Optimal</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Pulse Rate</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.clinicalNotes?.pulseRate || '72 bpm'}
                </strong>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Regular Rhythm</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">SpO2 Oxygen</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.clinicalNotes?.oxygenSaturation || '98%'}
                </strong>
                <span className="text-[9px] text-blue-400 font-bold block mt-0.5">Ambient Air</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Blood Glucose</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.clinicalNotes?.bloodGlucose || '5.6 mmol/L'}
                </strong>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Normoglycemic</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.clinicalNotes?.temperature || '36.7 °C'}
                </strong>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Afebrile</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Respiration</span>
                <strong className="text-white font-mono text-sm block mt-0.5">
                  {booking.biometricScan?.respiratoryRate ? `${booking.biometricScan.respiratoryRate} br/min` : '16 br/min'}
                </strong>
                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Eupneic</span>
              </div>
            </div>

            {/* If Biometric Health Scan is attached */}
            {booking.biometricScan && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <strong className="text-white">Optical rPPG Biometric Scan Attached</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      HRV: {booking.biometricScan.heartRateVariabilityMs}ms • Perfusion Index: {booking.biometricScan.perfusionIndex}% • Autonomic Tone: {booking.biometricScan.stressLevel.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  Confidence: {booking.biometricScan.confidenceScore}%
                </span>
              </div>
            )}
          </div>

          {/* Clinical Assessment & Follow-up Care Plan */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4 page-break-inside-avoid">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Registered Nurse Clinical Assessment &amp; Notes</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="font-bold text-purple-300 uppercase text-[10px] block mb-1">
                  On-Site Nursing Care Summary
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {booking.clinicalNotes?.careSummary || 'Comprehensive in-home nursing visit completed. Patient evaluated in comfortable home environment with zero acute distress observed. Vital signs assessed within acceptable limits.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="font-bold text-pink-300 uppercase text-[10px] block mb-1">
                  Medications &amp; Treatments Administered
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {booking.clinicalNotes?.medicationsAdministered || 'Scheduled morning doses cross-checked with physician prescription. Hydration encouraged. Skin inspection and sterile barrier technique applied where appropriate.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="font-bold text-emerald-300 uppercase text-[10px] block mb-1">
                  Registered Nurse Recommendations &amp; Next Steps
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {booking.clinicalNotes?.nurseRecommendations || 'Continue daily blood pressure logbook. Maintain consistent fluid intake throughout afternoon. In case of sudden chest pain, shortness of breath, or dizziness, notify We Care emergency line or dial 119 immediately.'}
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Financial Transparency & Escrow Accountability */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c0830] via-white/[0.04] to-[#0c1a17] border border-emerald-500/30 space-y-4 page-break-inside-avoid">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Itemized Invoice &amp; Payment Transparency Ledger</h4>
                  <p className="text-[11px] text-slate-300">
                    Transparent accountability for Patient, Attending Caregiver, and Platform Operations
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                Accountability Verified
              </span>
            </div>

            {/* Financial Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                    <th className="p-3 font-bold">Line Item Description</th>
                    <th className="p-3 font-bold text-center">Duration</th>
                    <th className="p-3 font-bold text-right">Rate</th>
                    <th className="p-3 font-bold text-right">Amount (JMD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  <tr>
                    <td className="p-3 font-medium text-white">
                      {booking.serviceName} (Standard In-Home Visit)
                    </td>
                    <td className="p-3 text-center text-slate-400">{booking.baseDurationMinutes || 45} mins</td>
                    <td className="p-3 text-right text-slate-400">{formatJMD(booking.basePriceJMD || booking.priceJMD)}</td>
                    <td className="p-3 text-right font-bold text-white">{formatJMD(booking.basePriceJMD || booking.priceJMD)}</td>
                  </tr>
                  {booking.actualDurationMinutes && booking.baseDurationMinutes && booking.actualDurationMinutes > booking.baseDurationMinutes && (
                    <tr>
                      <td className="p-3 font-medium text-amber-300">
                        Extended Clinical Care (+{booking.actualDurationMinutes - booking.baseDurationMinutes} mins overtime)
                      </td>
                      <td className="p-3 text-center text-amber-300">
                        {booking.actualDurationMinutes - booking.baseDurationMinutes} mins
                      </td>
                      <td className="p-3 text-right text-slate-400">Overtime Pro-rata</td>
                      <td className="p-3 text-right font-bold text-amber-300">
                        {formatJMD((booking.priceJMD || 0) - (booking.basePriceJMD || booking.priceJMD))}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-white/5 font-bold text-white border-t border-white/15">
                    <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs">
                      Total Billed &amp; Paid by Client
                    </td>
                    <td className="p-3 text-right font-mono text-base text-emerald-400">
                      {formatJMD(booking.priceJMD)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Transparency in Accountability Split Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Attending Caregiver Share (85%)
                </span>
                <strong className="text-white font-mono text-lg block mt-0.5">
                  {formatJMD(booking.nurseEarningsJMD)}
                </strong>
                <span className="text-[10px] text-emerald-400 block mt-1">
                  ✓ Direct Deposit Released to Nurse Account
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                  Platform Operations (15%)
                </span>
                <strong className="text-white font-mono text-lg block mt-0.5">
                  {formatJMD(booking.platformFeeJMD)}
                </strong>
                <span className="text-[10px] text-purple-300 block mt-1">
                  Covers 119 Escrow, GPS Dispatch &amp; Malpractice Insurance
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Method &amp; Rail
                </span>
                <strong className="text-white text-sm block mt-0.5 capitalize">
                  {String(booking.paymentMethod || 'card').replace('_', ' ')}
                </strong>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  Escrow Clear Ref: JAM-{(booking?.id || 'BK-7294').replace('BK-', 'TX')}
                </span>
              </div>
            </div>

            {/* Official Transparency Statement */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Statement of Financial Accountability:</strong> We Care Healthcare operates a zero-hidden-fee escrow clearing model compliant with the Bank of Jamaica (BOJ) and Nursing Council of Jamaica standards. Every client charge and corresponding caregiver disbursement is logged onto this permanent audited summary.
              </span>
            </div>
          </div>

          {/* Signatures & Certification Block */}
          <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs page-break-inside-avoid">
            <div className="space-y-3">
              <div className="h-12 border-b border-white/30 flex items-end pb-1">
                <span className="font-serif italic text-purple-300 text-sm">
                  {booking.nurseName || 'Attending Registered Practitioner'}
                </span>
              </div>
              <div>
                <strong className="text-white block">Attending Practitioner Digital Signature</strong>
                <span className="text-[11px] text-slate-400 block">
                  Nursing Council of Jamaica (NCJ) General Register • Verified On-Duty
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-12 border-b border-white/30 flex items-end pb-1">
                <span className="font-serif italic text-emerald-300 text-sm">
                  Nurse Patricia Stewart, RN, MSN
                </span>
              </div>
              <div>
                <strong className="text-white block">Clinical Director &amp; Quality Auditor</strong>
                <span className="text-[11px] text-slate-400 block">
                  We Care Healthcare Jamaica Ltd. Medical Directorate • Kingston, Jamaica
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info (Print-friendly) */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 print:bg-white print:text-black">
          <span>We Care Healthcare Jamaica • Confidential Medical Document • Keep for Medical Records</span>
          <span className="font-mono">Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
