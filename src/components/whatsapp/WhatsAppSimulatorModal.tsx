import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  Phone, 
  Users, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Info,
  Radio
} from 'lucide-react';
import { Booking, WhatsAppMessageLogItem } from '../../types';
import { 
  WECARE_WHATSAPP_BUSINESS_NUMBER,
  checkRateLimit,
  processInboundWhatsAppMessage,
  sendStartCodeWhatsApp,
  sendEndCodeWhatsApp,
  sendNurseJobWhatsApp,
  sendReceiptWhatsApp,
  getBookingStartCode,
  getBookingEndCode
} from '../../utils/whatsappRemoteCare';
import { soundFX } from '../../utils/soundEffects';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
  activeBookings?: Booking[];
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status'], updates?: Partial<Booking>) => void;
  onUpdateBooking?: (bookingId: string, status: any, additionalData?: any) => void;
}

type SimulationRole = 'family' | 'elderly' | 'nurse';

interface ChatMessage {
  id: string;
  sender: 'wecare_business' | 'user';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  buttons?: { text: string; payload: string }[];
  isSmsFallback?: boolean;
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  isOpen,
  onClose,
  booking,
  activeBookings,
  onUpdateBookingStatus,
  onUpdateBooking
}) => {
  const [activeRole, setActiveRole] = useState<SimulationRole>('family');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ allowed: boolean; remainingAttempts: number; retryAfterMinutes?: number }>({ allowed: true, remainingAttempts: 5 });
  const [smsTimer, setSmsTimer] = useState<number | null>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Active booking reference
  const currentBooking: Booking = booking || (activeBookings && activeBookings[0]) || {
    id: 'BK-8950',
    serviceId: 'srv-2',
    serviceName: 'Elderly Vitals & Medication Management',
    clientId: 'cli-12',
    clientName: 'Mama Joyce (Joyce Campbell)',
    clientPhone: '+1 (876) 942-3311',
    clientAddress: '22 Cherry Drive, Kingston 8',
    zone: 'Barbican & Cherry Gardens',
    clientEmergencyContact: {
      name: 'Chloe Campbell (Daughter)',
      phone: '+44 7700 900123',
      relation: 'Daughter'
    },
    nurseId: 'nurse-103',
    nurseName: 'Nurse Keisha Thomas, BSN, RN',
    nursePhone: '+1 (876) 555-9012',
    scheduledDateTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    freeCancelDeadline: new Date(Date.now() + 7200000).toISOString(),
    status: 'en_route',
    priceJMD: 6000,
    basePriceJMD: 6000,
    baseDurationMinutes: 60,
    hourlyRateJMD: 6000,
    platformFeeJMD: 900,
    nurseEarningsJMD: 5100,
    paymentMethod: 'card',
    paymentStatus: 'held_in_escrow',
    startCode: '4829',
    endCode: '9174',
    trustedFamilyMember: {
      name: 'Chloe Campbell (Daughter in UK)',
      relation: 'Daughter',
      phone: '+44 7700 900123',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      canManageCare: true,
      whatsAppUpdatesOptIn: true,
      whatsAppPhone: '+44 7700 900123'
    }
  };

  const startCode = getBookingStartCode(currentBooking);
  const endCode = getBookingEndCode(currentBooking);

  // Initialize role messages
  useEffect(() => {
    if (!isOpen) return;

    if (activeRole === 'family') {
      // Family Helper received arrival start code
      setMessages([
        {
          id: 'msg-f1',
          sender: 'wecare_business',
          text: `We Care Jamaica: Nurse ${currentBooking.nurseName} has arrived for ${currentBooking.clientName}. Start Code is ${startCode}. Tell nurse the code or reply START ${startCode} to start remotely. Visit: ${currentBooking.serviceName} at 2:00 PM.`,
          time: '2:01 PM',
          status: 'read',
          buttons: [
            { text: `START ${startCode}`, payload: `START ${startCode}` },
            { text: 'Call Nurse', payload: 'CALL_NURSE' }
          ]
        }
      ]);
    } else if (activeRole === 'elderly') {
      // Elderly Patient View (Big readable card)
      setMessages([
        {
          id: 'msg-e1',
          sender: 'wecare_business',
          text: `*WE CARE JAMAICA VISIT CODES FOR TODAY*\n\nDear ${currentBooking.clientName},\nNurse ${currentBooking.nurseName} is scheduled today.\n\n▶ START CODE: *${startCode}*\nGive this code to your nurse when she arrives at your door.\n\n▶ END CODE: *${endCode}*\nGive this when the nurse is ready to leave.\n\nNo app required. Just show or read these numbers.\nEmergency Helpline: +1 (876) 555-CARE`,
          time: '1:45 PM',
          status: 'read'
        }
      ]);
    } else if (activeRole === 'nurse') {
      // Nurse WhatsApp Job Dispatch View
      setMessages([
        {
          id: 'msg-n1',
          sender: 'wecare_business',
          text: `New Job - JMD ${currentBooking.priceJMD.toLocaleString()} - 1.4km away in ${currentBooking.zone}. Service: ${currentBooking.serviceName}. Accept? Reply YES to accept. View in app: https://wecareja.com/jobs/${currentBooking.id}`,
          time: '1:15 PM',
          status: 'read',
          buttons: [
            { text: 'YES', payload: 'YES' },
            { text: 'NO', payload: 'NO' }
          ]
        }
      ]);
    }

    // Check rate limits
    const limit = checkRateLimit(startCode);
    setRateLimitInfo(limit);
  }, [isOpen, activeRole]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    soundFX.playToggleClick();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Process Inbound WhatsApp webhook message
    setTimeout(() => {
      // Mark user message as read
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));

      const senderPhone = activeRole === 'family' 
        ? currentBooking.trustedFamilyMember?.phone || '+44 7700 900123' 
        : currentBooking.clientPhone;

      const result = processInboundWhatsAppMessage(senderPhone, text, activeBookings || [currentBooking]);

      // Check rate limits
      if (result.matchedCode) {
        const limit = checkRateLimit(result.matchedCode);
        setRateLimitInfo(limit);
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'wecare_business',
        text: result.replyMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };

      const handleUpdate = (bId: string, st: Booking['status'], updates?: Partial<Booking>) => {
        if (onUpdateBookingStatus) {
          onUpdateBookingStatus(bId, st, updates);
        } else if (onUpdateBooking) {
          onUpdateBooking(bId, st, updates);
        }
      };

      if (result.success) {
        soundFX.playSuccessPing();

        // Update booking state if applicable
        if (result.action === 'start_visit') {
          handleUpdate(currentBooking.id, 'in_progress', {
            startCodeVerifiedAt: new Date().toISOString(),
            startCodeVerifiedBy: 'family_remote',
            verifiedBy: 'family_remote'
          });

          // After 2.5 seconds, simulate nurse finishing care and sending end code
          setTimeout(() => {
            const endCodeNotice: ChatMessage = {
              id: `end-msg-${Date.now()}`,
              sender: 'wecare_business',
              text: `We Care Jamaica: Nurse ${currentBooking.nurseName} is ready to finish for ${currentBooking.clientName}. End Code is ${endCode}. Reply END ${endCode} to complete visit and release payment. Thank you.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
              buttons: [
                { text: `END ${endCode}`, payload: `END ${endCode}` },
                { text: 'View Care Notes', payload: 'CARE_NOTES' }
              ]
            };
            setMessages(prev => [...prev, endCodeNotice]);
            soundFX.playSuccessPing();
          }, 2500);
        } else if (result.action === 'end_visit') {
          handleUpdate(currentBooking.id, 'completed', {
            endCodeVerifiedAt: new Date().toISOString(),
            endCodeVerifiedBy: 'family_remote',
            paymentStatus: 'paid_to_nurse'
          });

          // Send receipt template
          setTimeout(() => {
            const receiptNotice: ChatMessage = {
              id: `rec-msg-${Date.now()}`,
              sender: 'wecare_business',
              text: `Visit completed for ${currentBooking.clientName}. Amount JMD ${currentBooking.priceJMD.toLocaleString()} paid. Receipt: https://wecareja.com/receipt/${currentBooking.id}. Rate your nurse: https://wecareja.com/rate/${currentBooking.id}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered'
            };
            setMessages(prev => [...prev, receiptNotice]);
            soundFX.playBookingConfirmed();
          }, 1500);
        }
      } else {
        soundFX.playWarningSound();
      }

      setMessages(prev => [...prev, botReply]);
    }, 600);
  };

  // Simulate 60s SMS Fallback
  const handleSimulateSmsFallback = () => {
    setSmsTimer(60);
    setFallbackTriggered(false);
    soundFX.playToggleClick();

    const interval = setInterval(() => {
      setSmsTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setFallbackTriggered(true);
          soundFX.playSuccessPing();

          // Add SMS message
          const smsNotice: ChatMessage = {
            id: `sms-${Date.now()}`,
            sender: 'wecare_business',
            text: `[AUTOMATIC SMS FALLBACK - WhatsApp undelivered after 60s]\nWe Care Jamaica: Nurse ${currentBooking.nurseName} has arrived for ${currentBooking.clientName}. Start Code is ${startCode}. Reply START ${startCode} to start remotely.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            isSmsFallback: true
          };
          setMessages(prevMsgs => [...prevMsgs, smsNotice]);
          return null;
        }
        return prev - 1;
      });
    }, 100); // Accelerated simulation (6 seconds total)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0e1d17] via-[#0d161d] to-[#0a0f16] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-6">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#128C7E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-slate-950 flex items-center justify-center shadow-lg shadow-[#25D366]/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">We Care WhatsApp Remote Care Live Simulator</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Meta Cloud API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official We Care Jamaica Number: <strong className="text-emerald-300 font-mono">{WECARE_WHATSAPP_BUSINESS_NUMBER}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Grid: Left Phone, Right Telemetry & Rules */}
        <div className="relative z-10 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Realistic WhatsApp Phone Mockup (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Role Switcher Tabs */}
            <div className="w-full max-w-sm flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveRole('family')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeRole === 'family' 
                    ? 'bg-[#25D366] text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Family (UK)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('elderly')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeRole === 'elderly' 
                    ? 'bg-[#25D366] text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Patient (Big Text)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('nurse')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeRole === 'nurse' 
                    ? 'bg-[#25D366] text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Nurse (Job Alert)</span>
              </button>
            </div>

            {/* Smartphone Frame */}
            <div className="w-full max-w-sm bg-[#111b21] rounded-[36px] border-4 border-[#2a3942] shadow-2xl overflow-hidden flex flex-col h-[520px]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center font-black text-xs shadow-md">
                    WC
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white leading-none">We Care Jamaica</h4>
                      <CheckCircle2 className="w-3 h-3 text-[#00a884] fill-[#00a884]" />
                    </div>
                    <span className="text-[10px] text-[#00a884] font-medium">Official Business Account</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#aebac1]">
                  <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Chat Canvas (WhatsApp Wallpaper Pattern) */}
              <div 
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0b141a] bg-opacity-95"
                style={{
                  backgroundImage: `radial-gradient(#202c33 1px, transparent 1px)`,
                  backgroundSize: '16px 16px'
                }}
              >
                {/* Meta End-to-End Encryption Banner */}
                <div className="p-2 rounded-lg bg-[#182229] border border-[#222d34] text-[10px] text-[#ffd279] text-center leading-tight">
                  🔒 Messages are end-to-end encrypted and sent via We Care WhatsApp Business Number.
                </div>

                {/* Messages List */}
                {messages.map((m) => {
                  const isBusiness = m.sender === 'wecare_business';

                  return (
                    <div 
                      key={m.id}
                      className={`flex flex-col ${isBusiness ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm relative ${
                        isBusiness 
                          ? m.isSmsFallback 
                            ? 'bg-[#4a2e0a] text-amber-100 rounded-tl-none border border-amber-500/40' 
                            : 'bg-[#202c33] text-white rounded-tl-none border border-[#2a3942]' 
                          : 'bg-[#005c4b] text-white rounded-tr-none'
                      }`}>
                        {m.isSmsFallback && (
                          <div className="text-[9px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-amber-400" />
                            <span>FALLBACK SMS GATEWAY</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                          {m.text}
                        </p>

                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                          <span>{m.time}</span>
                          {!isBusiness && (
                            <CheckCheck className={`w-3.5 h-3.5 ${m.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                          )}
                        </div>
                      </div>

                      {/* Interactive Buttons under Bot Template */}
                      {isBusiness && m.buttons && m.buttons.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1.5 w-full max-w-[85%]">
                          {m.buttons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              type="button"
                              onClick={() => handleSendMessage(btn.payload)}
                              className="w-full py-1.5 px-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-[#00a884] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <Sparkles className="w-3 h-3 text-[#00a884]" />
                              <span>{btn.text}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <div className="bg-[#202c33] p-2 flex items-center gap-2 border-t border-[#2a3942]">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    activeRole === 'family' 
                      ? `Type 'START ${startCode}' or 'END ${endCode}'...`
                      : activeRole === 'nurse' 
                      ? "Type 'YES' to accept..." 
                      : "Type a reply..."
                  }
                  className="flex-1 bg-[#2a3942] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8696a0] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f70] text-slate-950 flex items-center justify-center transition shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Telemetry, Rules & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Rate Limiter & Rule Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <h4 className="font-bold text-white flex items-center justify-between">
                <span>Security &amp; Rate Limits</span>
                <span className="text-[10px] text-emerald-400 font-mono">Rule: 5 per 10m</span>
              </h4>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300">Rate Limit Status:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  rateLimitInfo.allowed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {rateLimitInfo.remainingAttempts} / 5 attempts remaining
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300">Code Expiry Window:</span>
                <span className="font-mono text-purple-300 font-bold text-[11px]">
                  +2 Hours after visit
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-300">Remote Verification Source:</span>
                <span className="font-mono text-emerald-300 font-bold text-[10px]">
                  whatsapp_family_remote
                </span>
              </div>
            </div>

            {/* 60s SMS Fallback Simulator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-black/50 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-200 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>60s SMS Automatic Fallback</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  Rule 3
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                If WhatsApp delivery is not confirmed within 60 seconds (poor data in Jamaica/hills), system automatically dispatches the identical message via SMS.
              </p>

              <button
                type="button"
                onClick={handleSimulateSmsFallback}
                disabled={smsTimer !== null}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {smsTimer !== null ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Triggering Fallback ({smsTimer}s)...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5" />
                    <span>Simulate 60s Delivery Timeout</span>
                  </>
                )}
              </button>

              {fallbackTriggered && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>SMS successfully sent via Jamaican carrier gateway!</span>
                </div>
              )}
            </div>

            {/* Quick Action Test Buttons */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <h4 className="font-bold text-white text-xs mb-2">Quick Test Actions</h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage(`START ${startCode}`)}
                  className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test START {startCode}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage(`END ${endCode}`)}
                  className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test END {endCode}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage("START 9999")}
                className="w-full p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Test Invalid Code (Rate Limit Check)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Current Booking: <strong className="text-white font-mono">{currentBooking.id}</strong> ({currentBooking.clientName})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
