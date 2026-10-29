import React, { useState, useEffect, useRef } from 'react';
import { Booking, ChatMessage } from '../../types';
import { Send, Phone, User, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  currentUserRole: 'client' | 'nurse' | 'admin';
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  booking,
  currentUserRole
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      bookingId: booking.id,
      senderId: 'system',
      senderRole: 'system',
      senderName: 'We Care System',
      text: `Chat opened for booking #${booking.id} (${booking.serviceName}). Please confirm gate code or special parking instructions for ${booking.zone}.`,
      timestamp: '10:15 AM'
    },
    {
      id: 'msg-2',
      bookingId: booking.id,
      senderId: booking.nurseId || 'nurse-assigned',
      senderRole: 'nurse',
      senderName: booking.nurseName || 'Assigned Nurse',
      text: 'Good day! I have accepted your visit request. I will be bringing sterile dressings and vitals monitoring equipment. Is there any specific symptom change since surgery?',
      timestamp: '10:18 AM'
    },
    {
      id: 'msg-3',
      bookingId: booking.id,
      senderId: booking.clientId,
      senderRole: 'client',
      senderName: booking.clientName,
      text: 'Hello Nurse, thank you! The knee has mild redness around the lower stitch. Gate security is informed, just give them name Sutherland at the gate.',
      timestamp: '10:22 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const senderName = currentUserRole === 'client' 
      ? booking.clientName 
      : currentUserRole === 'nurse'
      ? (booking.nurseName || 'Nurse')
      : 'We Care Admin';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: booking.id,
      senderId: currentUserRole,
      senderRole: currentUserRole,
      senderName,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // If client sent a message, simulate nurse reply after a short delay
    if (currentUserRole === 'client') {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          bookingId: booking.id,
          senderId: booking.nurseId || 'nurse-assigned',
          senderRole: 'nurse',
          senderName: booking.nurseName || 'Assigned Nurse',
          text: 'Understood! I will inspect the incision thoroughly and sanitize before removing the old dressing. See you shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1500);
    }
  };

  const otherPersonName = currentUserRole === 'client' 
    ? (booking.nurseName || 'Assigned Nurse')
    : booking.clientName;

  const otherPersonRole = currentUserRole === 'client' ? 'Licensed Nurse (NCJ)' : 'Client';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0F172A]/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#150722]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full h-[600px] max-h-[90vh] shadow-2xl border border-white/15 flex flex-col overflow-hidden text-white">
        {/* Chat Header */}
        <div className="bg-white/[0.06] backdrop-blur-xl border-b border-white/10 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-white border-2 border-purple-400/40">
                {otherPersonName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#150722]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-tight text-white">{otherPersonName}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-[#C77DFF] border border-purple-500/30 font-semibold">
                  {otherPersonRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" /> {booking.zone} • Booking #{booking.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${booking.nursePhone || booking.clientPhone}`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
              title="Call Phone"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notice Bar */}
        <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2 text-[11px] text-purple-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-end encrypted medical visit communication
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Kingston &amp; St Andrew
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0313]/60 backdrop-blur-md">
          {messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[10px] font-medium text-purple-200 bg-purple-500/15 border border-purple-500/20 px-3.5 py-1 rounded-full inline-block">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {msg.senderName} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                    isMe
                      ? 'bg-[#1E1B4B] text-white rounded-tr-xs border border-purple-400/30'
                      : 'bg-white/10 text-white border border-white/10 rounded-tl-xs backdrop-blur-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white/[0.04] backdrop-blur-xl border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${otherPersonName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-white placeholder-slate-400 transition"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#5A0694] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-purple-950/50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
