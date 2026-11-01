import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  CreditCard, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Lock, 
  FileText,
  Wallet,
  Check,
  ExternalLink,
  Info,
  Banknote
} from 'lucide-react';
import { Booking, NurseProfile, CashPlatformFeeSettlement } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface NursePlatformFeeChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurse: NurseProfile;
  booking?: Booking | null;
  totalOutstandingFee?: number;
  onFeeSettled: (
    settlement: CashPlatformFeeSettlement,
    updatedNurse: NurseProfile,
    updatedBooking?: Booking
  ) => void;
}

export const NursePlatformFeeChargeModal: React.FC<NursePlatformFeeChargeModalProps> = ({
  isOpen,
  onClose,
  nurse,
  booking,
  totalOutstandingFee,
  onFeeSettled
}) => {
  if (!isOpen) return null;

  // Calculate fee amount to settle
  const feeToSettle = booking 
    ? (booking.cashPlatformFeeAmountJMD || booking.platformFeeJMD || Math.round(booking.priceJMD * 0.15))
    : (totalOutstandingFee || nurse.outstandingPlatformFeeJMD || 0);

  const visitPrice = booking ? booking.priceJMD : Math.round(feeToSettle / 0.15);
  const nurseKeeps = visitPrice - feeToSettle;

  const [paymentChannel, setPaymentChannel] = useState<'card' | 'payout_deduction' | 'lynk' | 'ncb'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<CashPlatformFeeSettlement | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardholderName, setCardholderName] = useState(nurse.name || 'Registered Nurse');
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);

  // Lynk / NCB state
  const [transferReference, setTransferReference] = useState('');

  const formatJMD = (amt: number) => `JMD $${Math.round(amt).toLocaleString()}`;

  const canDeductFromPayout = (nurse.pendingPayoutJMD || 0) >= feeToSettle;

  const handleProcessCharge = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // Simulate real processing latency
      await new Promise(res => setTimeout(res, 900));

      let method: CashPlatformFeeSettlement['method'] = 'charged_to_card';
      let refNum = `TXN-FEE-${Date.now().toString().slice(-6)}`;
      let noteText = '';

      if (paymentChannel === 'card') {
        method = 'charged_to_card';
        refNum = `STRIPE-CH-${Date.now().toString().slice(-8)}`;
        noteText = `Charged to nurse card ending in ${cardNumber.slice(-4)} (${cardholderName})`;
      } else if (paymentChannel === 'payout_deduction') {
        if (!canDeductFromPayout) {
          throw new Error(`Insufficient digital payout balance (${formatJMD(nurse.pendingPayoutJMD || 0)}). Fee is ${formatJMD(feeToSettle)}.`);
        }
        method = 'deducted_from_payout';
        refNum = `DEDUCT-PAYOUT-${Date.now().toString().slice(-6)}`;
        noteText = `Automatically deducted from upcoming digital payout balance`;
      } else if (paymentChannel === 'lynk') {
        if (!transferReference.trim()) {
          throw new Error('Please enter the Lynk payment reference code from your Lynk transaction receipt.');
        }
        method = 'paid_via_lynk';
        refNum = `LYNK-${transferReference.trim().toUpperCase()}`;
        noteText = `Confirmed via Lynk Mobile Money to @wecareja`;
      } else if (paymentChannel === 'ncb') {
        if (!transferReference.trim()) {
          throw new Error('Please enter the NCB transaction confirmation reference number.');
        }
        method = 'paid_via_bank';
        refNum = `NCB-${transferReference.trim().toUpperCase()}`;
        noteText = `Transferred to WeCare NCB Chequing Account #214892019`;
      }

      const settlementRecord: CashPlatformFeeSettlement = {
        id: `fee-settle-${Date.now()}`,
        bookingId: booking?.id || 'multiple_cash_bookings',
        nurseId: nurse.id,
        nurseName: nurse.name,
        clientName: booking?.clientName || 'Cash Visit Client',
        amountJMD: feeToSettle,
        method,
        status: 'completed',
        timestamp: new Date().toISOString(),
        referenceNumber: refNum,
        notes: noteText
      };

      // Calculate updated nurse finances
      const currentOutstanding = nurse.outstandingPlatformFeeJMD || 0;
      const newOutstanding = Math.max(0, currentOutstanding - feeToSettle);
      const newTotalFeesPaid = (nurse.totalPlatformFeesPaidJMD || 0) + feeToSettle;
      
      let newPendingPayout = nurse.pendingPayoutJMD || 0;
      if (method === 'deducted_from_payout') {
        newPendingPayout = Math.max(0, newPendingPayout - feeToSettle);
      }

      const updatedNurse: NurseProfile = {
        ...nurse,
        outstandingPlatformFeeJMD: newOutstanding,
        totalPlatformFeesPaidJMD: newTotalFeesPaid,
        pendingPayoutJMD: newPendingPayout
      };

      let updatedBooking: Booking | undefined;
      if (booking) {
        updatedBooking = {
          ...booking,
          cashPlatformFeeStatus: 'settled',
          cashPlatformFeeChargedAt: new Date().toISOString(),
          cashFeeChargeMethod: method,
          cashFeeChargeTxnId: refNum
        };
      }

      // Save to local fee settlement history
      try {
        const stored = localStorage.getItem('wecare_nurse_fee_settlements');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(settlementRecord);
        localStorage.setItem('wecare_nurse_fee_settlements', JSON.stringify(list));
      } catch (e) {
        console.error('Failed to store fee settlement record:', e);
      }

      soundFX.playSuccessPing();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1A1E4E', '#F59E0B', '#3B82F6', '#10B981']
      });

      setSuccessReceipt(settlementRecord);
      onFeeSettled(settlementRecord, updatedNurse, updatedBooking);
    } catch (err: any) {
      soundFX.playLateTimerWarning();
      setErrorMsg(err.message || 'Payment processing failed. Please check details and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#1A1E4E] via-[#151945] to-[#0c0f2d] border-2 border-blue-400/40 shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Top Accent Blue Heartbeat Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FFA500] text-slate-950 flex items-center justify-center font-black shadow-md">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Cash Visit Platform Fee Charge</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F59E0B] border border-amber-500/30 text-[10px] font-bold">
                  15% Fee
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {booking ? `Booking #${booking.id} • ${booking.serviceName}` : 'Settle Outstanding Cash Fees'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {successReceipt ? (
            /* SUCCESS CONFIRMATION RECEIPT */
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Platform Fee Successfully Settled!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  WeCare Track has processed and confirmed the 15% platform service fee.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Transaction Reference:</span>
                  <span className="font-mono font-bold text-amber-300">{successReceipt.referenceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Practitioner Name:</span>
                  <span className="font-semibold text-white">{successReceipt.nurseName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fee Amount Settled:</span>
                  <strong className="text-emerald-400 font-bold text-sm">{formatJMD(successReceipt.amountJMD)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Settlement Channel:</span>
                  <span className="font-semibold text-white capitalize">{successReceipt.method.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Date &amp; Time:</span>
                  <span className="text-slate-300">{new Date(successReceipt.timestamp).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300/90 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account status: Good Standing • On-Call Dispatch Active</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1A1E4E] to-[#3B82F6] hover:opacity-95 text-white font-bold text-xs transition shadow-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* REGULAR CHARGE / SETTLE FORM */
            <>
              {/* Fee Breakdown Alert Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" /> Total Cash Paid by Client to Nurse:
                  </span>
                  <strong className="text-white font-mono text-sm">{formatJMD(visitPrice)}</strong>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Nurse Keeps (85% In Hand):
                  </span>
                  <strong className="font-mono text-sm">{formatJMD(nurseKeeps)}</strong>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#F59E0B] block">WeCare Track 15% Platform Fee Due:</span>
                    <span className="text-[10px] text-slate-400">Covers dispatch insurance, 119 safety &amp; telemetry</span>
                  </div>
                  <strong className="text-lg font-black text-amber-300 font-mono">
                    {formatJMD(feeToSettle)}
                  </strong>
                </div>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Select How to Charge / Settle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Select Method to Charge Platform Fee:
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Option 1: Card / Stripe */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPaymentChannel('card');
                    }}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                      paymentChannel === 'card'
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span>Credit / Debit Card</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Instant 1-click charge</span>
                  </button>

                  {/* Option 2: Automatic Payout Offset */}
                  <button
                    type="button"
                    disabled={!canDeductFromPayout}
                    onClick={() => {
                      soundFX.playClick();
                      setPaymentChannel('payout_deduction');
                    }}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                      !canDeductFromPayout
                        ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-500'
                        : paymentChannel === 'payout_deduction'
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-purple-400" />
                      <span>Payout Offset</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Balance: {formatJMD(nurse.pendingPayoutJMD || 0)}
                    </span>
                  </button>

                  {/* Option 3: Lynk Mobile Money */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPaymentChannel('lynk');
                    }}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                      paymentChannel === 'lynk'
                        ? 'bg-amber-600/30 border-amber-400 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Lynk Wallet</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">@wecareja mobile transfer</span>
                  </button>

                  {/* Option 4: NCB Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPaymentChannel('ncb');
                    }}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-start gap-1 transition cursor-pointer text-left ${
                      paymentChannel === 'ncb'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>NCB Quik / Bank</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Direct account deposit</span>
                  </button>
                </div>
              </div>

              {/* Conditional Channel Forms */}
              {paymentChannel === 'card' && (
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" /> Card Details
                    </span>
                    <span className="text-[10px] text-slate-400">256-bit Stripe encrypted</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full p-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      id="save-nurse-card"
                      checked={saveCardForFuture}
                      onChange={(e) => setSaveCardForFuture(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <label htmlFor="save-nurse-card">Save card to auto-charge future cash visit fees</label>
                  </div>
                </div>
              )}

              {paymentChannel === 'payout_deduction' && (
                <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-purple-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-purple-300" /> Digital Earnings Offset
                    </span>
                    <span className="font-bold text-emerald-400">Available</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You have <strong>{formatJMD(nurse.pendingPayoutJMD || 0)}</strong> in pending earnings from digital card visits. Clicking confirm will deduct <strong>{formatJMD(feeToSettle)}</strong> directly from your upcoming bank payout. No card charge needed!
                  </p>
                </div>
              )}

              {paymentChannel === 'lynk' && (
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Official Lynk Mobile Money</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-200 text-[10px] font-mono">
                      @wecareja
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Open your Lynk app, send <strong>{formatJMD(feeToSettle)}</strong> to Lynk ID <strong>@wecareja</strong>, and enter your Lynk transaction code below:
                  </p>
                  <div>
                    <input
                      type="text"
                      value={transferReference}
                      onChange={(e) => setTransferReference(e.target.value)}
                      placeholder="e.g. LYNK-829104"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {paymentChannel === 'ncb' && (
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">NCB Jamaica Business Transfer</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-[10px] font-mono">
                      Acc #214892019
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p><strong>Bank:</strong> National Commercial Bank (NCB) Jamaica</p>
                    <p><strong>Account Name:</strong> We Care Track Jamaica Holdings</p>
                    <p><strong>Account Number:</strong> 214892019 (Chequing)</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={transferReference}
                      onChange={(e) => setTransferReference(e.target.value)}
                      placeholder="Enter Bank Transfer Reference # (e.g. NCB-991204)"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessCharge}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FFA500] to-[#F59E0B] hover:brightness-105 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Processing Platform Fee Charge...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Charge Platform Fee ({formatJMD(feeToSettle)})</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
