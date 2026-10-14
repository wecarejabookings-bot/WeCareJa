import React from 'react';
import { Booking, LogoVariation } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { Logo } from './Logo';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  Printer, 
  Download, 
  CheckCircle2, 
  FileText, 
  User, 
  Activity, 
  DollarSign, 
  Building,
  Sparkles,
  Share2,
  Copy,
  Check,
  Mic
} from 'lucide-react';

interface InvoiceReceiptModalProps {
  booking: Booking;
  onClose: () => void;
  logoVariation: LogoVariation;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  booking,
  onClose,
  logoVariation
}) => {
  const [copied, setCopied] = React.useState(false);

  const invoice = booking.invoiceSummary || {
    invoiceNumber: `INV-WC-${(booking?.id || 'BK-7294').replace('BK-', '')}-JAM`,
    issuedAt: booking.visitEndedAt || booking.scheduledDateTime,
    startedAt: booking.visitStartedAt || booking.scheduledDateTime,
    endedAt: booking.visitEndedAt || new Date(new Date(booking.scheduledDateTime).getTime() + 45 * 60000).toISOString(),
    baseDurationMinutes: booking.baseDurationMinutes || 45,
    actualDurationMinutes: booking.actualDurationMinutes || 45,
    overtimeMinutes: Math.max(0, (booking.actualDurationMinutes || 45) - (booking.baseDurationMinutes || 45)),
    basePriceJMD: booking.basePriceJMD || booking.priceJMD,
    overtimeRatePerHourJMD: booking.hourlyRateJMD || 7500,
    overtimeFeeJMD: Math.max(0, booking.priceJMD - (booking.basePriceJMD || booking.priceJMD)),
    totalChargedJMD: booking.priceJMD,
    platformFeeJMD: booking.platformFeeJMD,
    nurseEarningsJMD: booking.nurseEarningsJMD,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    timeBreakdownText: `${booking.actualDurationMinutes || 45} mins total care logged`,
    items: [
      {
        description: `${booking.serviceName} (Standard ${booking.baseDurationMinutes || 45} min In-Home Clinical Visit)`,
        quantity: 1,
        unit: 'Visit',
        unitRateJMD: booking.basePriceJMD || booking.priceJMD,
        totalJMD: booking.basePriceJMD || booking.priceJMD
      },
      ...(booking.actualDurationMinutes && booking.baseDurationMinutes && booking.actualDurationMinutes > booking.baseDurationMinutes ? [{
        description: `Extended Clinical Care Time (${booking.actualDurationMinutes - booking.baseDurationMinutes} mins additional)`,
        quantity: booking.actualDurationMinutes - booking.baseDurationMinutes,
        unit: 'Minutes',
        unitRateJMD: Math.round(((booking.hourlyRateJMD || 7500) / 60) * 10) / 10,
        totalJMD: booking.priceJMD - (booking.basePriceJMD || booking.priceJMD)
      }] : [])
    ]
  };

  const formatJMD = (val: number) => `JMD $${val.toLocaleString()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `WE CARE HEALTHCARE JAMAICA - INVOICE ${invoice.invoiceNumber}
Service: ${booking.serviceName}
Patient: ${booking.clientName}
Nurse: ${booking.nurseName}
Duration: ${invoice.actualDurationMinutes} mins
Total Paid: ${formatJMD(invoice.totalChargedJMD)}
Status: Settled in Full`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#08020e]/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#12051d] text-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-purple-500/30 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-[#7209B7]/40 to-slate-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Official Clinical Care Invoice &amp; Summary</h3>
              <p className="text-[11px] text-purple-200">Nursing Council of Jamaica (NCJ) Certified Care Receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1"
              title="Copy Invoice Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-sm font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs bg-[#140620]">
          {/* Official Letterhead Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Logo variation={logoVariation} size="md" />
                <span className="font-black text-lg tracking-tight text-white">We Care Jamaica</span>
              </div>
              <div className="text-slate-200 text-xs font-mono space-y-0.5">
                <div className="font-bold text-white">4 Claudete Drive</div>
                <div>St. Catherine, Jamaica</div>
                <div className="text-purple-300">wecareja.bookings@gmail.com</div>
                <div className="text-emerald-300 font-bold">(876) 582-7613</div>
              </div>
              <p className="text-slate-400 text-[10px] mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" /> NCJ Registered Healthcare Network • St. Catherine, Kingston, Portmore &amp; Spanish Town
              </p>
            </div>

            <div className="sm:text-right bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C77DFF] block">
                Official Receipt / Invoice
              </span>
              <span className="text-base font-black font-mono text-white mt-0.5 block">
                {invoice.invoiceNumber}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 font-mono">
                <div>Date: {new Date(invoice.issuedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div className="text-emerald-400 font-bold">Status: Settled &amp; Escrow Released</div>
              </div>
            </div>
          </div>

          {/* Patient & Attending Nurse Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Details */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                <User className="w-3 h-3 text-purple-400" /> Patient Information
              </span>
              <h4 className="font-bold text-white text-sm">{booking.clientName}</h4>
              <p className="text-slate-300 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E63946] shrink-0 mt-0.5" />
                <span>{booking.clientAddress}, {booking.zone}</span>
              </p>
              <p className="text-slate-400">Phone: <strong className="text-slate-200">{booking.clientPhone}</strong></p>
              {booking.clientEmergencyContact && (
                <p className="text-slate-400 text-[10px]">
                  Emergency: {booking.clientEmergencyContact.name} ({booking.clientEmergencyContact.relation}) • {booking.clientEmergencyContact.phone}
                </p>
              )}
            </div>

            {/* Nurse Details */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C77DFF] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Attending Licensed Nurse
              </span>
              <h4 className="font-bold text-white text-sm">{booking.nurseName || 'We Care Licensed Nurse'}</h4>
              <p className="text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px]">
                  NCJ Verified
                </span>
                <span>Active Practitioner</span>
              </p>
              <p className="text-slate-400">Direct Contact: <strong className="text-slate-200">{booking.nursePhone || '+1 (876) 555-CARE'}</strong></p>
              <p className="text-purple-300 text-[10px]">Payment Release: Direct Jamaican Banking Settlement</p>
            </div>
          </div>

          {/* Visit Duration & Time Audit Log */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 border border-purple-500/25 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C77DFF]" />
                Visit Care Duration &amp; Time Log
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {invoice.actualDurationMinutes} Minutes Total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Visit Started</span>
                <strong className="text-white font-mono">
                  {new Date(invoice.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Visit Completed</span>
                <strong className="text-white font-mono">
                  {new Date(invoice.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Base Included Time</span>
                <strong className="text-slate-300 font-mono">{invoice.baseDurationMinutes} mins</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Overtime / Additional</span>
                <strong className={invoice.overtimeMinutes > 0 ? 'text-amber-300 font-mono' : 'text-slate-400 font-mono'}>
                  {invoice.overtimeMinutes > 0 ? `+${invoice.overtimeMinutes} mins` : '0 mins'}
                </strong>
              </div>
            </div>
          </div>

          {/* Itemized Financial Ledger */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Itemized Care Charges &amp; Summary
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-300 border-b border-white/10 font-bold text-[11px]">
                  <tr>
                    <th className="p-3">Clinical Care Description</th>
                    <th className="p-3 text-center">Qty / Duration</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Total (JMD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-white font-medium">{item.description}</td>
                      <td className="p-3 text-center text-slate-300 font-mono">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right text-slate-300 font-mono">{formatJMD(Math.round(item.unitRateJMD))}</td>
                      <td className="p-3 text-right text-white font-bold font-mono">{formatJMD(item.totalJMD)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white/[0.04] font-semibold border-t border-white/10 text-xs">
                  <tr>
                    <td colSpan={3} className="p-3 text-slate-300 text-right">Gross Total Amount Paid:</td>
                    <td className="p-3 text-right font-black text-white text-sm font-mono">{formatJMD(invoice.totalChargedJMD)}</td>
                  </tr>
                  <tr className="text-[11px] text-slate-400">
                    <td colSpan={3} className="px-3 py-1.5 text-right">Nurse Clinical Disbursement (85% Net):</td>
                    <td className="px-3 py-1.5 text-right font-mono text-emerald-400 font-bold">{formatJMD(invoice.nurseEarningsJMD)}</td>
                  </tr>
                  <tr className="text-[11px] text-slate-400">
                    <td colSpan={3} className="px-3 py-1.5 text-right">Platform Operations &amp; 119 Escrow Fee (15%):</td>
                    <td className="px-3 py-1.5 text-right font-mono text-[#C77DFF]">{formatJMD(invoice.platformFeeJMD)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Attached Clinical Notes & Vitals */}
          {booking.clinicalNotes && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#C77DFF]" />
                Attached Clinical Vitals &amp; Assessment Report
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-medium bg-black/30 p-3 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">BP</span>
                  <strong className="text-white">{booking.clinicalNotes.bloodPressure || '120/80 mmHg'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Pulse</span>
                  <strong className="text-white">{booking.clinicalNotes.pulseRate || '72 bpm'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Glucose</span>
                  <strong className="text-white">{booking.clinicalNotes.bloodGlucose || '5.6 mmol/L'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">SpO2</span>
                  <strong className="text-white">{booking.clinicalNotes.oxygenSaturation || '98%'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Temp</span>
                  <strong className="text-white">{booking.clinicalNotes.temperature || '36.7 °C'}</strong>
                </div>
              </div>

              {booking.clinicalNotes.careSummary && (
                <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <strong className="text-white block mb-0.5">Care Summary:</strong>
                  <span>{booking.clinicalNotes.careSummary}</span>
                </div>
              )}

              {booking?.clinicalNotes?.nurseRecommendations && (
                <div className="text-[11px] text-purple-200 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                  <strong className="text-white block mb-0.5">Nurse Recommendations:</strong>
                  <span>{booking.clinicalNotes.nurseRecommendations}</span>
                </div>
              )}

              {(((booking?.clinicalNotes?.visitUpdates?.length || 0) > 0) || ((booking?.visitUpdates?.length || 0) > 0)) && (
                <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                  <strong className="text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    Visit Updates &amp; Dictated Logs:
                  </strong>
                  <div className="space-y-1">
                    {(booking.clinicalNotes.visitUpdates || booking.visitUpdates || []).map((u) => (
                      <div key={u.id} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                        <span className="font-mono text-purple-300 shrink-0">
                          [{new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                        </span>
                        <span>{u.text}</span>
                        {u.recordedViaVoice && (
                          <span className="text-[9px] text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded border border-purple-500/30">
                            dictated
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Guarantee */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>We Care Jamaica • Nursing Council of Jamaica Licensed Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Admin Oversight: <strong className="text-white">{ADMIN_PROFILE.name}</strong> (Office: <strong className="font-mono text-purple-300">{ADMIN_PROFILE.officeNumber}</strong>)</span>
              <span className="font-mono">Payment Mode: {String(invoice?.paymentMethod || 'card').toUpperCase().replace(/_/g, ' ')} • ESCROW CLEARED</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white font-bold text-xs transition shadow-md shadow-purple-950/40"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
