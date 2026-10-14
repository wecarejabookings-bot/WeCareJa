import React, { useState } from 'react';
import { AdminPaymentHistoryItem } from '../../types';
import { getLast4, formatJMD } from '../../utils/adminPayrollUtils';
import { soundFX } from '../../utils/soundEffects';
import { Printer, Copy, Check, X, ShieldCheck, Download, Award, FileText } from 'lucide-react';

interface AdminPayslipModalProps {
  payment: AdminPaymentHistoryItem;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPayslipModal: React.FC<AdminPayslipModalProps> = ({
  payment,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const methodLast4 = `${payment.method} - ${getLast4(payment.lynkOrBankInfo || payment.method)}`;

  // Generate plain text version exactly as requested with required 5-line address header
  const plainTextPayslip = `We Care Jamaica
4 Claudete Drive
St. Catherine, Jamaica
wecareja.bookings@gmail.com
(876) 582-7613

We Care Jamaica - Admin Payslip
Date: ${payment.date}
Admin: ${payment.adminName}
Role: ${payment.role}
Week Period: ${payment.weekPeriod}
Weekly Salary: ${formatJMD(payment.weeklySalary)}
Amount Paid: ${formatJMD(payment.amount)}
Method: ${methodLast4}
Balance After Payment: JMD $${payment.balanceAfterPayment || 0}
Paid By: ${payment.paidBy || 'We Care Jamaica (wecareja.bookings@gmail.com)'}
Transaction ID: ${payment.transactionId}
Signature Owner: ________________________
Signature Admin: ________________________
Thank you for serving We Care Jamaica
Kingston, Jamaica`;

  const handleCopy = () => {
    soundFX.playToggleClick();
    navigator.clipboard.writeText(plainTextPayslip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#1E1B4B] via-slate-900 to-[#1E1B4B] p-4 sm:p-5 border-b border-purple-500/30 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Official Admin Payslip
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Payment
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-mono">TX: {payment.transactionId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Copy plaintext payslip"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 text-xs font-bold shadow-md shadow-emerald-950/40 cursor-pointer"
              title="Print official document"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 printable-container select-text font-mono text-sm leading-relaxed space-y-6">
          {/* Header with Mandatory Address Block */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans">
              We Care Jamaica
            </h1>
            <div className="text-xs text-slate-700 font-sans space-y-0.5 leading-snug">
              <div className="font-semibold">4 Claudete Drive</div>
              <div className="font-semibold">St. Catherine, Jamaica</div>
              <div className="text-purple-900 font-bold font-mono">wecareja.bookings@gmail.com</div>
              <div className="font-mono font-bold">(876) 582-7613</div>
            </div>
            <div className="mt-2 inline-block px-3 py-1 rounded bg-slate-100 text-slate-800 text-xs font-black border border-slate-300 font-sans tracking-wide">
              ADMIN PAYSLIP &amp; OFFICIAL SETTLEMENT VOUCHER
            </div>
          </div>

          {/* Structured Metadata Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Date:</span>
              <span className="font-black text-slate-900">{payment.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Admin:</span>
              <span className="font-black text-slate-900">{payment.adminName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Role:</span>
              <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                {payment.role}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Week Period:</span>
              <span className="font-bold text-slate-900">{payment.weekPeriod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Weekly Salary:</span>
              <span className="font-bold text-slate-900">{formatJMD(payment.weeklySalary)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5 bg-emerald-50/60 p-1.5 rounded">
              <span className="font-black text-emerald-900 text-sm">Amount Paid:</span>
              <span className="font-black text-emerald-700 text-base sm:text-lg">
                {formatJMD(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Method:</span>
              <span className="font-mono font-bold text-slate-900">{methodLast4}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Balance After Payment:</span>
              <span className="font-black text-emerald-800">
                JMD ${payment.balanceAfterPayment || 0}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-600">Paid By:</span>
              <span className="font-bold text-slate-900 text-right">
                {payment.paidBy || 'We Care Jamaica (wecareja.bookings@gmail.com)'}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-600">Transaction ID:</span>
              <span className="font-mono font-black text-purple-900">{payment.transactionId}</span>
            </div>
            {payment.note && (
              <div className="pt-2 text-[11px] text-slate-600 italic border-t border-slate-200">
                Note: {payment.note}
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-xs font-sans">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-1">
                <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                  Disbursing Authority
                </span>
                <span className="font-serif italic font-bold text-slate-800 text-sm">
                  Sydney Mattis
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-700">Signature Owner: ____________</div>
            </div>

            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-1">
                <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                  Admin Staff Member
                </span>
                <span className="font-serif italic font-bold text-slate-800 text-sm">
                  {payment.adminName}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-700">Signature Admin: ____________</div>
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="border-t border-slate-300 pt-4 text-center text-xs font-sans text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">Thank you for serving We Care Jamaica</p>
            <p className="text-[11px] text-slate-500">Kingston, Jamaica</p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted NCJ Platform Hash • Electronic Payroll Archive</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="bg-slate-950 p-4 border-t border-white/10 flex items-center justify-between no-print">
          <span className="text-xs text-slate-400">
            Storage: <code className="text-purple-300">wecare_payment_history_v1</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
