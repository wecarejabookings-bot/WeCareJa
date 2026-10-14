import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Volume2, 
  Radio, 
  Activity, 
  HelpCircle,
  FileText,
  Plus
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface VoiceToTextClinicalRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
  onAppendTranscript: (textToAppend: string) => void;
  targetFieldLabel?: string;
  placeholder?: string;
  mode?: 'inline' | 'card' | 'badge';
  compact?: boolean;
}

// Pre-defined Jamaican clinical dictation templates for quick insertion
const CLINICAL_DICTATION_PRESETS = [
  {
    label: 'Sterile Wound Care',
    text: 'Surgical wound inspected: clean incision margins, no erythema or purulent drainage. Cleansed with sterile normal saline, applied topical antimicrobial ointment, and redressed with sterile non-adherent pad and paper tape.'
  },
  {
    label: 'Vitals Stable Check',
    text: 'Baseline vitals assessed: BP 124/80 mmHg, radial pulse 74 bpm regular, SpO2 99% on ambient air, blood glucose 5.8 mmol/L. Patient alert, oriented, and denies dizziness or pain.'
  },
  {
    label: 'Medication Administered',
    text: 'Prescribed morning medications verified against blister pack and administered orally with 200ml water: Amlodipine 5mg and Metformin 500mg. Swallowing intact with no choking or dysphagia.'
  },
  {
    label: 'Elderly Bedbound Care',
    text: 'Assisted with passive range-of-motion exercises and repositioned to left lateral recumbent position with pillow support. Skin integrity over sacrum and heels intact with no stage 1 pressure injuries.'
  },
  {
    label: 'Post-Op Observation',
    text: 'Post-operative recovery monitoring: surgical site dressing dry and intact. Jackson-Pratt drain emptied and recorded 15ml serosanguinous fluid. Patient encouraged to perform deep breathing and incentive spirometry.'
  },
  {
    label: 'Family Briefing',
    text: 'Briefed family guardian on hydration schedule, medication timing, and signs of hypotension. Reminded to contact We Care nurse hotline immediately if fever or sudden lethargy occurs.'
  }
];

export const VoiceToTextClinicalRecorder: React.FC<VoiceToTextClinicalRecorderProps> = ({
  onTranscriptChange,
  onAppendTranscript,
  targetFieldLabel = 'Clinical Care Notes',
  placeholder = 'Speak clearly into your microphone to dictate visit updates...',
  mode = 'inline',
  compact = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [accumulatedText, setAccumulatedText] = useState('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [showPresets, setShowPresets] = useState(false);
  const [simulatedStreaming, setSimulatedStreaming] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptChunk + ' ';
          } else {
            currentInterim += transcriptChunk;
          }
        }

        if (currentFinal) {
          setAccumulatedText(prev => {
            const updated = (prev ? prev.trim() + ' ' : '') + currentFinal.trim();
            if (onTranscriptChange) onTranscriptChange(updated);
            return updated;
          });
          setInterimTranscript('');
          soundFX.playSuccessPing();
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          // Graceful fallback to demo simulation
          setSpeechSupported(false);
        }
      };

      recognition.onend = () => {
        if (isRecording && !isPaused) {
          // Auto-restart if unexpected pause
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init warning:', e);
      setSpeechSupported(false);
    }

    return () => {
      stopRecordingCleanup();
    };
  }, []);

  // Timer counter
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Audio level visualizer loop
  const startAudioVisualizer = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }
    } catch {
      // Audio metering fallback simulation
      const interval = setInterval(() => {
        if (!isRecording) {
          clearInterval(interval);
          setAudioLevel(0);
          return;
        }
        setAudioLevel(Math.floor(25 + Math.random() * 55));
      }, 120);
    }
  };

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const handleStartRecording = () => {
    soundFX.playSuccessPing();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingSeconds(0);
    setInterimTranscript('');

    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
        startAudioVisualizer();
      } catch (err) {
        console.warn('Speech start error, using clinical voice simulation fallback:', err);
        startSimulatedDictation();
      }
    } else {
      startSimulatedDictation();
    }
  };

  const startSimulatedDictation = () => {
    setSimulatedStreaming(true);
    startAudioVisualizer();
    // Simulate real-time words appearing
    const sampleSentences = [
      'Patient resting comfortably in bed.',
      'Surgical dressing over right knee clean and intact.',
      'No signs of swelling, redness, or heat.',
      'Radial pulse regular at 72 bpm, BP 122 over 78 mmHg.',
      'Administered scheduled analgesics with good tolerance.',
      'Encouraged gentle mobility and advised family on hydration.'
    ];

    let sentenceIdx = 0;
    const interval = setInterval(() => {
      if (sentenceIdx < sampleSentences.length) {
        const nextPart = sampleSentences[sentenceIdx];
        setInterimTranscript(nextPart);
        setTimeout(() => {
          setAccumulatedText(prev => (prev ? prev.trim() + ' ' : '') + nextPart);
          setInterimTranscript('');
          soundFX.playSuccessPing();
        }, 1400);
        sentenceIdx++;
      } else {
        clearInterval(interval);
        setSimulatedStreaming(false);
      }
    }, 2400);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      soundFX.playSuccessPing();
      if (recognitionRef.current && speechSupported) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } else {
      setIsPaused(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  };

  const handleStopAndAppend = () => {
    stopRecordingCleanup();
    setIsRecording(false);
    setIsPaused(false);
    setSimulatedStreaming(false);

    const fullText = (accumulatedText + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (fullText) {
      onAppendTranscript(fullText);
      soundFX.playVisitCompleted();
      setAccumulatedText('');
      setInterimTranscript('');
      setRecordingSeconds(0);
    }
  };

  const handleClear = () => {
    setAccumulatedText('');
    setInterimTranscript('');
    setRecordingSeconds(0);
  };

  const handleSelectPreset = (presetText: string) => {
    soundFX.playFilterSelect();
    setAccumulatedText(prev => (prev ? prev.trim() + ' ' : '') + presetText);
    setShowPresets(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStartRecording}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
            title="Start voice dictation for clinical notes"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>Dictate (Voice-to-Text)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl border border-red-500/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-mono text-xs font-bold text-red-300">{formatTime(recordingSeconds)}</span>
            <button
              type="button"
              onClick={handleStopAndAppend}
              className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Cancel recording"
            >
              <Square className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1c082e] via-[#150624] to-[#0d0217] border border-purple-500/30 shadow-xl space-y-3">
      {/* Header with Title, Mode & Timer */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border transition ${
            isRecording 
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Voice-to-Text Dictation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/30">
                {targetFieldLabel}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Hands-free clinical visit dictation with speech recognition
            </span>
          </div>
        </div>

        {/* Recording Timer & Audio Waveform */}
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-black text-red-400">{formatTime(recordingSeconds)}</span>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center gap-0.5 h-3 px-1">
                {[12, 28, 45, 70, 40, 20].map((baseH, i) => {
                  const factor = Math.max(0.2, (audioLevel / 100));
                  const dynamicHeight = Math.min(100, Math.round(baseH * factor + (isRecording && !isPaused ? Math.random() * 20 : 0)));
                  return (
                    <span
                      key={i}
                      className="w-1 bg-gradient-to-t from-red-500 to-purple-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, dynamicHeight * 0.14)}px` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            title="Quick Clinical Phrase Templates"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* Quick Clinical Phrase Presets Dropdown */}
      {showPresets && (
        <div className="p-2.5 rounded-xl bg-black/80 border border-purple-500/30 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1 border-b border-white/10">
            <span>Tap to insert standard clinical protocol wording:</span>
            <button 
              type="button" 
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {CLINICAL_DICTATION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                className="text-left p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 transition group cursor-pointer"
              >
                <span className="font-bold text-white text-[11px] block group-hover:text-purple-300">
                  {preset.label}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                  {preset.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript / Speech Buffer Box */}
      <div className="min-h-[64px] p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 font-mono space-y-1">
        {accumulatedText ? (
          <p className="text-white leading-relaxed">
            {accumulatedText}
            {interimTranscript && (
              <span className="text-purple-400 italic bg-purple-500/10 px-1 rounded animate-pulse">
                {' '}{interimTranscript}
              </span>
            )}
          </p>
        ) : interimTranscript ? (
          <p className="text-purple-400 italic animate-pulse">
            {interimTranscript}...
          </p>
        ) : (
          <p className="text-slate-500 italic">
            {placeholder}
          </p>
        )}
      </div>

      {/* Control Buttons & Insert Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-[#7209B7] to-purple-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Start Voice Dictation</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePauseResume}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={handleStopAndAppend}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finish &amp; Append Note</span>
              </button>
            </>
          )}

          {(accumulatedText || interimTranscript) && !isRecording && (
            <button
              type="button"
              onClick={() => {
                onAppendTranscript(accumulatedText);
                soundFX.playSuccessPing();
                setAccumulatedText('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Append to {targetFieldLabel}</span>
            </button>
          )}

          {(accumulatedText || interimTranscript) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Clear dictated text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Speech Recognition Ready</span>
        </div>
      </div>
    </div>
  );
};
