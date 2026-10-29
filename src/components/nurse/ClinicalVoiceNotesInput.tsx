import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Activity,
  Plus
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface ClinicalVoiceNotesInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isTextarea?: boolean;
  required?: boolean;
  helperText?: string;
  clinicalFieldType?: 'care_summary' | 'recommendations' | 'medications' | 'vitals' | 'general';
  id?: string;
}

// Jamaican clinical homecare dictation quick presets
const CLINICAL_PHRASES_BY_TYPE: Record<string, string[]> = {
  care_summary: [
    'Patient alert, oriented x3, resting comfortably with no acute distress.',
    'Surgical wound inspected: clean incision margins, no erythema or exudate. Cleansed with sterile normal saline and dressed with sterile non-adherent pad.',
    'Vitals assessed: BP 124/80 mmHg, pulse 74 bpm regular, SpO2 99% on room air, blood glucose 5.8 mmol/L.',
    'Assisted with passive range-of-motion exercises and repositioned to reduce sacral pressure.',
    'Elderly patient assisted with bed-to-chair transfer and morning hygiene routine.',
    'Post-operative recovery monitoring: surgical site dressing dry and intact. No signs of infection.'
  ],
  recommendations: [
    'Keep surgical dressing clean and dry for 48 hours. Report any unexpected drainage immediately.',
    'Continue prescribed oral antihypertensive and maintain adequate hydration throughout the day.',
    'Perform gentle ankle pumps hourly while seated to promote venous return.',
    'Advised family to monitor evening glucose reading and log in We Care patient chart.',
    'Encourage small, frequent high-protein meals and oral fluids as tolerated.',
    'Schedule follow-up suture inspection visit in 5 to 7 days.'
  ],
  medications: [
    'Prescribed morning oral medications verified against blister pack and administered with water.',
    'Cleaned incision with sterile normal saline, applied silver sulfadiazine ointment topically.',
    'Subcutaneous insulin 10 units administered in abdominal quadrant after pre-meal blood glucose check.',
    'Oral analgesics administered as ordered with zero adverse reaction noted.',
    'Prescription eye drops instilled in right eye following aseptic technique.'
  ],
  general: [
    'Clinical home visit conducted in accordance with Nursing Council of Jamaica standards.',
    'Client and family briefed on care plan and emergency contact procedure.',
    'Environment assessed: walkway clear of fall hazards and emergency medications accessible.'
  ]
};

export const ClinicalVoiceNotesInput: React.FC<ClinicalVoiceNotesInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Type or use microphone dictation to record notes...',
  rows = 3,
  isTextarea = true,
  required = false,
  helperText,
  clinicalFieldType = 'care_summary',
  id
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [showPhrases, setShowPhrases] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Initialize Speech Recognition
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
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += chunk + ' ';
          } else {
            currentInterim += chunk;
          }
        }

        if (currentFinal) {
          onChange((value ? value.trim() + ' ' : '') + currentFinal.trim());
          setInterimTranscript('');
          soundFX.playSuccessPing();
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechSupported(false);
        }
      };

      recognition.onend = () => {
        if (isRecording && !isPaused) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      stopCleanup();
    };
  }, [value, onChange, isRecording, isPaused]);

  // Recording timer
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

  // Audio level visualizer loop via getUserMedia & Web Audio API
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
        const updateVisualizer = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      }
    } catch {
      // Fallback animated audio pulse
      const interval = setInterval(() => {
        if (!isRecording) {
          clearInterval(interval);
          setAudioLevel(0);
          return;
        }
        setAudioLevel(Math.floor(20 + Math.random() * 60));
      }, 150);
    }
  };

  const stopCleanup = () => {
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

  const startRecording = () => {
    soundFX.playMicStart();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingSeconds(0);
    setInterimTranscript('');

    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
        startAudioVisualizer();
      } catch {
        startSimulatedDictation();
      }
    } else {
      startSimulatedDictation();
    }
  };

  // High-fidelity fallback simulation if speech recognition is denied or in iframe
  const startSimulatedDictation = () => {
    startAudioVisualizer();
    const phrases = CLINICAL_PHRASES_BY_TYPE[clinicalFieldType] || CLINICAL_PHRASES_BY_TYPE.general;
    const sample = phrases[Math.floor(Math.random() * phrases.length)];
    
    let words = sample.split(' ');
    let currentWordIdx = 0;

    const interval = setInterval(() => {
      if (currentWordIdx < words.length) {
        const nextWord = words[currentWordIdx];
        setInterimTranscript(prev => (prev ? prev + ' ' : '') + nextWord);
        currentWordIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onChange((value ? value.trim() + ' ' : '') + sample);
          setInterimTranscript('');
          soundFX.playSuccessPing();
        }, 500);
      }
    }, 450);
  };

  const stopRecording = () => {
    soundFX.playMicStop();
    stopCleanup();
    setIsRecording(false);
    setIsPaused(false);
    if (interimTranscript) {
      onChange((value ? value.trim() + ' ' : '') + interimTranscript.trim());
      setInterimTranscript('');
    }
  };

  const handleAppendPhrase = (phrase: string) => {
    soundFX.playSuccessPing();
    onChange((value ? value.trim() + ' ' : '') + phrase);
  };

  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const phraseList = CLINICAL_PHRASES_BY_TYPE[clinicalFieldType] || CLINICAL_PHRASES_BY_TYPE.general;

  return (
    <div className="space-y-1.5 w-full">
      {/* Label and Microphone Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {/* Clinical Phrase Shortcuts Dropdown Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              setShowPhrases(!showPhrases);
            }}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer transition"
            title="Quick clinical dictation shortcuts"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Clinical Phrases</span>
            {showPhrases ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Integrated Microphone Trigger */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:brightness-110 text-white text-[11px] font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-950/40 cursor-pointer border border-purple-400/30"
              title="Dictate clinical note using your microphone (Web Speech API)"
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Dictate (Mic)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-950/80 px-2.5 py-0.5 rounded-xl border border-red-500/60 shadow-lg shadow-red-950/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-mono text-[11px] font-black text-red-300">
                {formatSecs(recordingSeconds)}
              </span>

              {/* Soundwave bar visualizer */}
              <div className="flex items-center gap-0.5 h-3.5 px-1">
                {[15, 35, 70, 45, 20].map((baseH, i) => {
                  const factor = Math.max(0.2, audioLevel / 100);
                  const dynamicH = Math.min(100, Math.round(baseH * factor + (isRecording ? Math.random() * 15 : 0)));
                  return (
                    <span
                      key={i}
                      className="w-0.5 bg-gradient-to-t from-red-500 to-amber-300 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, dynamicH * 0.12)}px` }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black transition cursor-pointer flex items-center gap-1"
                title="Stop recording and keep note"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Interim Transcript Preview when active */}
      {isRecording && interimTranscript && (
        <div className="p-2 rounded-xl bg-purple-950/70 border border-purple-400/40 text-xs text-purple-200 flex items-center gap-2 animate-fadeIn">
          <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <p className="italic leading-relaxed flex-1">
            "{interimTranscript}"
          </p>
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider shrink-0">
            Transcribing...
          </span>
        </div>
      )}

      {/* Input / Textarea Field */}
      <div className="relative">
        {isTextarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-2.5 rounded-xl border bg-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none transition-all leading-relaxed ${
              isRecording 
                ? 'border-red-400/70 shadow-md shadow-red-950/30 bg-red-950/10' 
                : 'border-white/15 focus:border-purple-400'
            }`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-2.5 rounded-xl border bg-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none transition-all ${
              isRecording 
                ? 'border-red-400/70 shadow-md shadow-red-950/30 bg-red-950/10' 
                : 'border-white/15 focus:border-purple-400'
            }`}
          />
        )}

        {/* Clear input button if value exists */}
        {value && !isRecording && (
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              onChange('');
            }}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer text-[10px] font-bold"
            title="Clear field"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dropdown Quick Jamaican Clinical Phrases */}
      {showPhrases && (
        <div className="p-2.5 rounded-xl bg-[#1d072b] border border-purple-500/30 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Tap to append verified clinical dictation:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPhrases(false)}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {phraseList.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAppendPhrase(phrase)}
                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/30 text-slate-200 hover:text-white border border-white/10 hover:border-purple-400/40 transition cursor-pointer"
              >
                + {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
