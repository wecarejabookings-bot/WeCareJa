import React, { useState } from 'react';
import { NurseProfile, NursePeerChatMessage, UserRole } from '../../types';
import { sanitizeNurseListForViewer } from '../../utils/privacySanitizer';
import { soundFX } from '../../utils/soundEffects';
import { 
  Users, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Send, 
  Radio, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  HeartHandshake, 
  Car, 
  Stethoscope, 
  Clock, 
  CheckCheck,
  Search,
  Filter,
  Volume2
} from 'lucide-react';
import { VerifiedNursingCouncilBadge } from '../common/VerifiedNursingCouncilBadge';

interface NursePeerNetworkViewProps {
  allNurses: NurseProfile[];
  currentNurse: NurseProfile;
  peerMessages: NursePeerChatMessage[];
  onSendPeerMessage: (message: Omit<NursePeerChatMessage, 'id' | 'timestamp'>) => void;
}

export const NursePeerNetworkView: React.FC<NursePeerNetworkViewProps> = ({
  allNurses,
  currentNurse,
  peerMessages,
  onSendPeerMessage
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | 'broadcast'>('broadcast');
  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NursePeerChatMessage['category']>('broadcast');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Sanitize nurse profiles for peer viewer:
  // Nurses can only see active peer practitioners' names, photo, active zones, and proximity.
  // Private TRN, bank details, raw license strings, and contact details are masked!
  const sanitizedNurses = sanitizeNurseListForViewer(allNurses, 'nurse', currentNurse.id);
  const peerNurses = sanitizedNurses.filter(n => n.id !== currentNurse.id && n.status === 'approved');

  const filteredPeers = peerNurses.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.zones.some(z => z.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesZone = zoneFilter === 'all' || n.zones.some(z => z.toLowerCase().includes(zoneFilter.toLowerCase()));
    return matchesSearch && matchesZone;
  });

  const activeRecipient = selectedRecipientId === 'broadcast' 
    ? null 
    : peerNurses.find(n => n.id === selectedRecipientId);

  // Filter messages for current view
  const displayedMessages = peerMessages.filter(msg => {
    if (selectedRecipientId === 'broadcast') {
      return !msg.recipientNurseId || msg.category === 'broadcast' || msg.category === 'shift_assist' || msg.category === 'traffic_alert' || msg.category === 'clinical_tip';
    } else {
      // 1:1 conversation between currentNurse and selected peer
      return (
        (msg.senderNurseId === currentNurse.id && msg.recipientNurseId === selectedRecipientId) ||
        (msg.senderNurseId === selectedRecipientId && msg.recipientNurseId === currentNurse.id)
      );
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    soundFX.playChatMessageSent();
    onSendPeerMessage({
      senderNurseId: currentNurse.id,
      senderNurseName: currentNurse.name,
      senderNursePhoto: currentNurse.photoUrl,
      recipientNurseId: selectedRecipientId === 'broadcast' ? undefined : selectedRecipientId,
      recipientNurseName: activeRecipient ? activeRecipient.name : undefined,
      zone: currentNurse.zones[0] || 'Kingston',
      text: messageText.trim(),
      category: selectedCategory,
      isEmergencyBackup: selectedCategory === 'shift_assist'
    });

    setMessageText('');
  };

  const handleQuickTemplate = (text: string, category: NursePeerChatMessage['category']) => {
    soundFX.playPop();
    setMessageText(text);
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Network Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2c0b4d] via-[#1a052e] to-[#400e40] border border-purple-500/30 p-6 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Active Peer Practitioner Network
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                NCJ Verified Practitioners Only
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#C77DFF]" />
              Jamaica Nurse Peer Network &amp; Field Coordination
            </h2>

            <p className="text-xs text-purple-200/90 leading-relaxed">
              Connect with active licensed nurses across Kingston, St. Andrew, Portmore, and Spanish Town. Request shift backup, collaborate on patient care protocols, and share real-time road conditions.
            </p>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 backdrop-blur-md shrink-0 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Privacy Shield Active</span>
            </div>
            <p className="text-[11px] text-slate-300 max-w-xs">
              Peer nurses see only active names, zones, and proximity. Personal banking, TRN, and private details are strictly shielded.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Nearby Active Peers) & Right Column (Chat & Coordination Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Nearby Nurses Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#140526]/90 border border-purple-500/20 rounded-3xl p-4 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C77DFF]" />
                <h3 className="font-bold text-sm text-white">Active Nearby Nurses</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {peerNurses.length} Online in Jamaica
              </span>
            </div>

            {/* Search & Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nurse by name or parish..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setZoneFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    zoneFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  All Areas
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('Kingston')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    zoneFilter === 'Kingston'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Kingston &amp; St Andrew
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('Portmore')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    zoneFilter === 'Portmore'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Portmore
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('Spanish Town')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    zoneFilter === 'Spanish Town'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Spanish Town
                </button>
              </div>
            </div>

            {/* Broadcast Channel Selector Card */}
            <div
              onClick={() => {
                soundFX.playTabSwitch();
                setSelectedRecipientId('broadcast');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedRecipientId === 'broadcast'
                  ? 'border-purple-400 bg-gradient-to-r from-purple-900/60 to-purple-800/40 text-white shadow-lg ring-1 ring-purple-400/50'
                  : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7209B7] to-[#E63946] flex items-center justify-center text-white shadow-md">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Jamaica Nurse Collaboration Feed</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <span className="text-[10px] text-purple-200 block">
                    Public channel • All verified active nurses
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200">
                Network
              </span>
            </div>

            {/* Nurse List Items */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredPeers.map(peer => {
                const isSelected = selectedRecipientId === peer.id;
                return (
                  <div
                    key={peer.id}
                    onClick={() => {
                      soundFX.playTabSwitch();
                      setSelectedRecipientId(peer.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#C77DFF] bg-purple-900/50 text-white shadow-lg ring-1 ring-purple-400/40'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={peer.photoUrl}
                          alt={peer.name}
                          className="w-10 h-10 rounded-full object-cover border border-purple-400/40 shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#140526]" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{peer.name}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <VerifiedNursingCouncilBadge
                            nurse={peer}
                            size="xs"
                            variant="trust-pill"
                            label="NCJ Registered"
                            viewerRole="nurse"
                            showLicense={false}
                          />
                        </div>

                        <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                          📍 {peer.zones[0] || 'Kingston & St Andrew'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[10px] font-bold transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPeers.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active peer nurses found matching your filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat & Peer Coordination Hub */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#140526]/90 border border-purple-500/20 rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[560px]">
            {/* Chat Room Header */}
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedRecipientId === 'broadcast' ? (
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-[#C77DFF]">
                    <Radio className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : (
                  <img
                    src={activeRecipient?.photoUrl}
                    alt={activeRecipient?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-400"
                  />
                )}

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedRecipientId === 'broadcast' ? 'Jamaica Nurse Peer Network (All Island)' : activeRecipient?.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Verified Peer
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedRecipientId === 'broadcast'
                      ? 'Live collaborative messaging for registered nurses on duty'
                      : `Direct coordination with ${activeRecipient?.name} • ${activeRecipient?.zones[0] || 'Jamaica'}`}
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                End-to-End Logged
              </div>
            </div>

            {/* Quick Action Collaboration Templates */}
            <div className="py-2 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider shrink-0">
                Quick Template:
              </span>
              <button
                type="button"
                onClick={() => handleQuickTemplate('Cover assist needed: Can anyone take a 3 PM wound dressing in Portmore Pines?', 'shift_assist')}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 shrink-0 font-medium transition"
              >
                🚑 Shift Backup Request
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('Supplies check: Anyone near New Kingston with extra sterile vacutainers or 20G needles?', 'clinical_tip')}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/30 shrink-0 font-medium transition"
              >
                🩺 Supplies Assistance
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('Mandela Highway traffic notice: Heading west is moving smoothly after White Marl.', 'traffic_alert')}
                className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 shrink-0 font-medium transition"
              >
                🚗 Route &amp; Traffic Advisory
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-3.5 my-3 max-h-[340px] overflow-y-auto pr-2 border-y border-white/5 py-3">
              {displayedMessages.map(msg => {
                const isMe = msg.senderNurseId === currentNurse.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={msg.senderNursePhoto}
                      alt={msg.senderNurseName}
                      className="w-8 h-8 rounded-full object-cover border border-purple-400 shrink-0 mt-0.5"
                    />

                    <div className={`max-w-[78%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                      <div className="flex items-center gap-2 text-[10px]">
                        <strong className="text-white">{isMe ? 'You' : msg.senderNurseName}</strong>
                        {msg.category === 'shift_assist' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold">
                            Shift Assist
                          </span>
                        )}
                        {msg.category === 'traffic_alert' && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-bold">
                            Traffic Notice
                          </span>
                        )}
                        {msg.category === 'clinical_tip' && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-200 font-bold">
                            Clinical Tip
                          </span>
                        )}
                        <span className="text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-[#7209B7] to-purple-600 text-white rounded-tr-none shadow-md'
                            : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/10 shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {displayedMessages.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <HeartHandshake className="w-8 h-8 mx-auto text-purple-400/50 mb-2" />
                  <p>No messages in this channel yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Start collaborating with peer nurses across Jamaica!</p>
                </div>
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none"
                >
                  <option value="direct">Direct Message</option>
                  <option value="broadcast">General Broadcast</option>
                  <option value="shift_assist">Shift Coverage Backup</option>
                  <option value="clinical_tip">Clinical Consultation</option>
                  <option value="traffic_alert">Traffic / Route Alert</option>
                </select>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    selectedRecipientId === 'broadcast'
                      ? 'Type message to all active peer nurses...'
                      : `Type message to ${activeRecipient?.name}...`
                  }
                  className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#7209B7] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
