import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export interface VerifiedPaymentMethod {
  id: string;
  user_id?: string;
  stripe_payment_method_id?: string;
  card_brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  cardholder_name: string;
  is_default: boolean;
  verified_funds: boolean;
  auth_amount_cents: number;
  created_at: string;
  // Aliases for camelCase convenience
  cardBrand?: string;
  expMonth?: number;
  expYear?: number;
  cardholderName?: string;
}

export type VerifiedCardInfo = VerifiedPaymentMethod;

export interface AddCardFormProps {
  userId?: string;
  userEmail?: string;
  onSuccess?: (paymentMethod: VerifiedPaymentMethod) => void;
  onCardVerified?: (paymentMethod: VerifiedPaymentMethod) => void;
  onCancel?: () => void;
  className?: string;
  compact?: boolean;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({
  userId,
  userEmail,
  onSuccess,
  onCardVerified,
  onCancel,
  className = '',
  compact = false
}) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState(''); // MM/YY
  const [cvc, setCvc] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Format Card Number with Spaces (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    setErrorMessage(null);
  };

  // Format Expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
    setErrorMessage(null);
  };

  // Detect card brand
  const cleanNumber = cardNumber.replace(/\D/g, '');
  let brand = 'card';
  if (cleanNumber.startsWith('4')) brand = 'visa';
  else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) brand = 'mastercard';
  else if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) brand = 'amex';
  else if (cleanNumber.startsWith('6')) brand = 'discover';

  // Fast test fill helper
  const handleFillTestCard = (type: 'pass' | 'fail_funds') => {
    setErrorMessage(null);
    setCardholderName(type === 'pass' ? 'Dr. Courtney Wilson' : 'Joyce Palmer');
    setExpiry('12/28');
    setCvc('123');
    if (type === 'pass') {
      setCardNumber('4242 4242 4242 4242');
    } else {
      setCardNumber('4000 0000 0000 9995');
    }
    soundFX.playToggleClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      soundFX.playWarningSound();
      return;
    }

    const expParts = expiry.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      setErrorMessage('Please enter a valid MM/YY expiration date.');
      soundFX.playWarningSound();
      return;
    }

    const expMonth = Number(expParts[0]);
    const expYear = Number(`20${expParts[1]}`);
    if (expMonth < 1 || expMonth > 12) {
      setErrorMessage('Please enter a valid expiration month (01-12).');
      soundFX.playWarningSound();
      return;
    }

    if (!cvc || cvc.length < 3) {
      setErrorMessage('Please enter a valid 3-digit security code (CVC).');
      soundFX.playWarningSound();
      return;
    }

    if (!cardholderName.trim()) {
      setErrorMessage('Please enter the name printed on the card.');
      soundFX.playWarningSound();
      return;
    }

    // Trigger Amazon-style verification
    setIsVerifying(true);
    soundFX.playToggleClick();

    try {
      // Call add-card endpoint
      const response = await fetch('/api/stripe/add-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: cleanCard,
          expMonth,
          expYear,
          cvc: cvc.trim(),
          cardholderName: cardholderName.trim(),
          userId: userId || 'anonymous',
          email: userEmail
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorText = data.error || 'Card declined - please check funds or try another card';
        setErrorMessage(errorText);
        soundFX.playWarningSound();
        return;
      }

      // Authorization succeeded & $1 voided!
      setSuccessMessage('Card verified successfully! $1.00 authorization check voided.');
      soundFX.playSuccessFanfare();

      if (data.paymentMethod) {
        const enriched: VerifiedPaymentMethod = {
          ...data.paymentMethod,
          cardBrand: data.paymentMethod.card_brand,
          expMonth: data.paymentMethod.exp_month,
          expYear: data.paymentMethod.exp_year,
          cardholderName: data.paymentMethod.cardholder_name
        };
        setTimeout(() => {
          if (onSuccess) onSuccess(enriched);
          if (onCardVerified) onCardVerified(enriched);
        }, 800);
      }
    } catch (err: any) {
      console.error('[AddCardForm Error]', err);
      setErrorMessage('Card declined - please check funds or try another card');
      soundFX.playWarningSound();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`bg-[#121539] border border-[#3B82F6]/30 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
              <span>Add Credit / Debit Card</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Stripe Verified
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Funds verified in real-time before saving (Amazon-style $1 authorization)
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Amazon-style $1.00 Verification Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#1A1E4E] to-black/60 border border-blue-500/40 space-y-1 text-xs">
        <div className="flex items-center gap-2 text-blue-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>Real-Time Funds Pre-Authorization (Amazon Model)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
          When you add this card, a temporary <strong>$1.00 USD hold</strong> will be authorized to verify available funds. The hold is <strong>immediately voided and canceled</strong> so you are never charged. Cards with insufficient funds or invalid status are rejected.
        </p>
      </div>

      {/* QA Test Card Presets for Verification */}
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className="text-slate-400 font-bold text-[10px] uppercase font-mono">Test Presets:</span>
        <button
          type="button"
          onClick={() => handleFillTestCard('pass')}
          className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-mono transition cursor-pointer flex items-center gap-1"
          title="Fill valid test card (4242...)"
        >
          <span>✓ 4242 (Valid Funds)</span>
        </button>
        <button
          type="button"
          onClick={() => handleFillTestCard('fail_funds')}
          className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-mono transition cursor-pointer flex items-center gap-1"
          title="Fill test card that fails with insufficient funds (4000...9995)"
        >
          <span>✕ 9995 (Fails Insufficient Funds)</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-red-100 font-bold mb-0.5">Card Rejected:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-100 font-bold mb-0.5">Card Authorized &amp; Saved:</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Cardholder Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Cardholder Name *
          </label>
          <input
            type="text"
            required
            value={cardholderName}
            onChange={(e) => {
              setCardholderName(e.target.value);
              setErrorMessage(null);
            }}
            placeholder="e.g. Courtney Campbell"
            autoComplete="cc-name"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:border-blue-400 outline-none text-xs"
          />
        </div>

        {/* Card Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-300">
              Card Number *
            </label>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-slate-400">
              {brand === 'visa' && <span className="text-blue-400">VISA</span>}
              {brand === 'mastercard' && <span className="text-orange-400">Mastercard</span>}
              {brand === 'amex' && <span className="text-blue-300">Amex</span>}
              {brand === 'discover' && <span className="text-amber-400">Discover</span>}
              {brand === 'card' && <span>Credit / Debit</span>}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4000 0000 0000 0000"
              autoComplete="cc-number"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-blue-400 outline-none text-xs tracking-wider"
            />
            <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Expiry & CVC Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Expires *
            </label>
            <input
              type="text"
              required
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              autoComplete="cc-exp"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-blue-400 outline-none text-xs text-center"
            />
          </div>

          {/* CVC */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>CVC / CVV *</span>
              <span className="text-[10px] text-slate-400 font-mono">3 digits</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                maxLength={4}
                value={cvc}
                onChange={(e) => {
                  setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setErrorMessage(null);
                }}
                placeholder="•••"
                autoComplete="cc-csc"
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono placeholder-slate-500 focus:border-blue-400 outline-none text-xs text-center tracking-widest"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Security & Jamaican Data Protection Act Guarantee */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>PCI-DSS Level 1 Encrypted via Stripe. Verified funds stored privately.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              disabled={isVerifying}
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition text-xs cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isVerifying
                ? 'bg-blue-600/50 text-blue-200 cursor-wait border border-blue-400/40'
                : 'bg-gradient-to-r from-[#1A1E4E] via-[#2E8BFF] to-[#F59E0B] hover:brightness-110 text-white border border-amber-400/40'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span className="font-mono tracking-wide">Verifying card...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Verify Funds &amp; Save Payment Method</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;
