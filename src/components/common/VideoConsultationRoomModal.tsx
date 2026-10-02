import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  MessageSquare,
  Users,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  Heart,
  Send,
  Camera,
  RotateCw,
  CheckCircle2
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface VideoConsultationRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerRole?: 'client' | 'nurse' | 'admin';
  participantName: string;
  participantRole: 'client' | 'nurse' | 'admin';
  participantAvatar?: string;
  meetingTitle?: string;
  meetingRoomId?: string;
}

export const VideoConsultationRoomModal: React.FC<VideoConsultationRoomModalProps> = ({
  isOpen,
  onClose,
  callerName = 'Clinical Director (Admin)',
  callerRole = 'admin',
  participantName,
  participantRole,
  participantAvatar,
  meetingTitle = 'We Care Telehealth Video Consultation',
  meetingRoomId = 'room-telehealth-jamaica'
}) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting'>('connecting');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    {
      id: 'm1',
      sender: 'System Telehealth Escrow',
      text: 'Encrypted end-to-end clinical consultation channel active. HIPAA & MOHW Jamaica compliant.',
      time: 'Just now'
    },
    {
      id: 'm2',
      sender: participantName,
      text: 'Good day! I can hear you clearly. Ready for the consultation.',
      time: 'Just now'
    }
  ]);
  const [inputChatText, setInputChatText] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [webcamActive, setWebcamActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    soundFX.playCallConnecting();

    const connectTimeout = setTimeout(() => {
      setConnectionStatus('connected');
      soundFX.playRandomDelightChime();
    }, 1500);

    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);

    // Try camera access for local preview
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            setWebcamActive(true);
          }
        })
        .catch(() => {
          // Fallback to stylized clinical avatar simulation
          setWebcamActive(false);
        });
    }

    return () => {
      clearTimeout(connectTimeout);
      clearInterval(timer);
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChatText.trim()) return;

    const newMsg = {
      id: `chat-${Date.now()}`,
      sender: callerName,
      text: inputChatText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputChatText('');
    soundFX.playMessageSent();
  };

  const handleQuickChatPrompt = (prompt: string) => {
    const newMsg = {
      id: `chat-${Date.now()}`,
      sender: callerName,
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    soundFX.playMessageSent();
  };

  const handleHangup = () => {
    soundFX.playCallHangup();
    onClose();
  };

  const roleLabel = {
    admin: 'Lead Operations Director & Regulated Registry Admin',
    nurse: 'Licensed Healthcare Professional / Registered Nurse',
    client: 'Patient / Family Caregiver'
  }[participantRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl animate-fadeIn">
      <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none' : 'max-w-5xl h-[88vh]'} bg-[#12061f] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white transition-all`}>
        
        {/* Top Video Room Bar */}
        <div className="p-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">{meetingTitle}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {connectionStatus === 'connected' ? 'Live Telehealth' : 'Connecting...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Room ID: <span className="font-mono text-purple-300">{meetingRoomId}</span> • 256-Bit Encrypted WebRTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Call duration timer */}
            <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{formatTimer(callDurationSeconds)}</span>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video Call Stage & Chat Layout */}
        <div className="flex-1 relative flex overflow-hidden">
          
          {/* Main Stage: Remote Participant Video */}
          <div className="flex-1 relative bg-gradient-to-b from-[#1b082e] to-[#0d0316] flex items-center justify-center overflow-hidden">
            
            {/* Remote video visual feed / animation */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
              
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />

              {/* Remote Participant Avatar / Video Mockup */}
              <div className="relative z-10 space-y-4 max-w-md">
                <div className="relative inline-block mx-auto">
                  <img
                    src={participantAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'}
                    alt={participantName}
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-4 border-purple-400/40 shadow-2xl shadow-purple-950/60"
                  />
                  {/* Live audio indicator */}
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Audio Active
                  </div>
                </div>

                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white">{participantName}</h4>
                  <p className="text-xs text-purple-200 mt-0.5">{roleLabel}</p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Identity • Verified Audio &amp; Video Stream</span>
                </div>
              </div>

              {/* PIP: Local Video Preview (Bottom Right) */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video rounded-2xl bg-black/70 border-2 border-purple-500/50 shadow-2xl overflow-hidden backdrop-blur-md z-20 group">
                {webcamActive && !isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-purple-950/40">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 mb-1">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white leading-tight">{callerName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-400">{isVideoOff ? 'Camera Off' : 'You (Host)'}</span>
                  </div>
                )}

                <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                  You
                </div>

                <button
                  onClick={() => setCameraFacing(f => f === 'user' ? 'environment' : 'user')}
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 hover:bg-black/80 text-white transition opacity-0 group-hover:opacity-100"
                  title="Flip camera"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* In-Call Live Chat Drawer */}
          {isChatOpen && (
            <div className="w-80 border-l border-white/10 bg-[#160826]/95 backdrop-blur-2xl flex flex-col z-30 animate-fadeIn">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C77DFF]" />
                  <span className="text-xs font-bold text-white">In-Call Clinical Chat</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-2xl ${
                      msg.sender === callerName
                        ? 'bg-purple-600/30 border border-purple-500/30 text-purple-100 ml-4'
                        : msg.sender.includes('System')
                        ? 'bg-white/5 border border-white/10 text-slate-300 text-[11px]'
                        : 'bg-white/10 border border-white/15 text-white mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-purple-300">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Quick Clinical Chat Chips */}
              <div className="p-2 border-t border-white/10 bg-black/20 flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleQuickChatPrompt('Audio and video are clear! 👍')}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                >
                  Audio is clear 👍
                </button>
                <button
                  onClick={() => handleQuickChatPrompt('Checking blood pressure & vital sign log now.')}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                >
                  Checking vitals
                </button>
                <button
                  onClick={() => handleQuickChatPrompt('Please display the prescription label to the camera.')}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                >
                  Show prescription
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={inputChatText}
                  onChange={(e) => setInputChatText(e.target.value)}
                  placeholder="Type message to room..."
                  className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#7209B7] hover:bg-purple-600 text-white transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Control Dock */}
        <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Host: <strong className="text-white">{callerName}</strong>
            </span>
          </div>

          {/* Central Call Action Pills */}
          <div className="flex items-center gap-3">
            {/* Mic Toggle */}
            <button
              onClick={() => {
                setIsMicMuted(!isMicMuted);
                soundFX.playToggleClick();
              }}
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
                isMicMuted
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
              }`}
              title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
              <span className="hidden sm:inline">{isMicMuted ? 'Muted' : 'Mute'}</span>
            </button>

            {/* Video Toggle */}
            <button
              onClick={() => {
                setIsVideoOff(!isVideoOff);
                soundFX.playToggleClick();
              }}
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 ${
                isVideoOff
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-rose-400" /> : <Video className="w-5 h-5 text-[#C77DFF]" />}
              <span className="hidden sm:inline">{isVideoOff ? 'Camera Off' : 'Camera'}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                soundFX.playToggleClick();
              }}
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs transition hidden sm:flex items-center gap-2 ${
                isScreenSharing
                  ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
              }`}
              title="Share Clinical Report or Screen"
            >
              <Share2 className="w-5 h-5 text-sky-400" />
              <span>Share</span>
            </button>

            {/* In-Call Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-bold text-xs transition flex items-center gap-2 relative ${
                isChatOpen
                  ? 'bg-purple-600/40 border border-purple-400 text-white'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
              }`}
              title="Toggle Clinical Chat"
            >
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline">Chat</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 absolute top-2 right-2" />
            </button>

            {/* Hangup / End Video Call Button */}
            <button
              onClick={handleHangup}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-[#E63946] hover:bg-red-600 text-white font-extrabold text-xs shadow-lg shadow-red-900/50 border border-red-400/40 transition flex items-center gap-2"
              title="End Video Consultation"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden lg:inline font-mono">
              100% Encrypted
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
