import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Activity, 
  Heart, 
  Bluetooth, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Download, 
  FileText, 
  Radio, 
  Share2,
  Sparkles,
  Thermometer,
  Droplet,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, HealthDevice, SyncedHealthReading } from '../../types';
import { 
  INITIAL_HEALTH_DEVICES, 
  INITIAL_VITALS_LOG, 
  simulateHealthDeviceDataStream 
} from '../../utils/healthDeviceSync';
import { soundFX } from '../../utils/soundEffects';

interface SyncHealthDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onTriggerNotification?: (type: any, title: string, description: string) => void;
}

export const SyncHealthDataModal: React.FC<SyncHealthDataModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onTriggerNotification
}) => {
  const [devices, setDevices] = useState<HealthDevice[]>(() => {
    try {
      const saved = localStorage.getItem('wecare_connected_devices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HEALTH_DEVICES;
  });

  const [vitalsLog, setVitalsLog] = useState<SyncedHealthReading[]>(() => {
    if ((currentUser?.patientBioData?.vitalsLog?.length || 0) > 0) {
      return currentUser.patientBioData.vitalsLog || [];
    }
    try {
      const saved = localStorage.getItem('wecare_patient_vitals_log');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_VITALS_LOG;
  });

  // Active streaming device
  const [activeStreamingDevice, setActiveStreamingDevice] = useState<HealthDevice | null>(null);
  const [currentLiveReading, setCurrentLiveReading] = useState<SyncedHealthReading | null>(null);
  const [isConnectingId, setIsConnectingId] = useState<string | null>(null);
  const [autoLogEnabled, setAutoLogEnabled] = useState<boolean>(true);
  const [pulseBeat, setPulseBeat] = useState<boolean>(false);
  const streamUnsubscribeRef = useRef<(() => void) | null>(null);

  // Clean up streaming on unmount or close
  useEffect(() => {
    return () => {
      if (streamUnsubscribeRef.current) {
        streamUnsubscribeRef.current();
        streamUnsubscribeRef.current = null;
      }
    };
  }, []);

  // Save changes to localStorage and patient record
  const persistVitalsLog = (newLog: SyncedHealthReading[]) => {
    setVitalsLog(newLog);
    try {
      localStorage.setItem('wecare_patient_vitals_log', JSON.stringify(newLog));
    } catch {}

    if (currentUser && onUpdateUser) {
      const updatedBio = {
        ...(currentUser.patientBioData || {
          knownIllnesses: [],
          allergies: [],
          medications: [],
          trustedFamilyMember: { name: '', phone: '', relation: '', photoUrl: '', canManageCare: true }
        }),
        vitalsLog: newLog
      };

      onUpdateUser({
        ...currentUser,
        patientBioData: updatedBio
      });
    }
  };

  // Connect device and start mock data stream
  const handleConnectDevice = (device: HealthDevice) => {
    // If already streaming this device, disconnect
    if (activeStreamingDevice?.id === device.id) {
      handleDisconnectDevice();
      return;
    }

    // Disconnect any existing stream
    if (streamUnsubscribeRef.current) {
      streamUnsubscribeRef.current();
      streamUnsubscribeRef.current = null;
    }

    setIsConnectingId(device.id);
    soundFX.playFilterSelect();

    // Simulate Bluetooth pairing handshake
    setTimeout(() => {
      setIsConnectingId(null);
      setActiveStreamingDevice(device);

      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, status: 'streaming', lastSyncedAt: new Date().toISOString() } 
          : { ...d, status: 'disconnected' }
      ));

      soundFX.playSuccessPing();

      // Start the mock data stream function
      const stopStream = simulateHealthDeviceDataStream(
        device.type,
        device.name,
        (incomingReading) => {
          setCurrentLiveReading(incomingReading);
          
          // Trigger visual heartbeat pulse
          setPulseBeat(true);
          setTimeout(() => setPulseBeat(false), 300);

          // If auto-log is enabled, save to patient record
          if (autoLogEnabled) {
            setVitalsLog(prev => {
              const updated = [incomingReading, ...prev.slice(0, 49)];
              try {
                localStorage.setItem('wecare_patient_vitals_log', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        },
        2200
      );

      streamUnsubscribeRef.current = stopStream;

      if (onTriggerNotification) {
        onTriggerNotification(
          'system_alert',
          `Connected to ${device.name}`,
          `Simulated telemetry stream is now streaming clinical data into your health record.`
        );
      }
    }, 1100);
  };

  // Disconnect stream
  const handleDisconnectDevice = () => {
    if (streamUnsubscribeRef.current) {
      streamUnsubscribeRef.current();
      streamUnsubscribeRef.current = null;
    }
    setActiveStreamingDevice(null);
    setCurrentLiveReading(null);
    setDevices(prev => prev.map(d => ({ ...d, status: 'disconnected' })));
  };

  // Explicitly log current reading
  const handleManualLogReading = () => {
    if (!currentLiveReading) return;

    soundFX.playSuccessPing();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#FFD166', '#4CC9F0']
    });

    const newLog = [currentLiveReading, ...vitalsLog.slice(0, 49)];
    persistVitalsLog(newLog);
  };

  const handleDeleteVitalEntry = (id: string) => {
    const newLog = vitalsLog.filter(v => v.id !== id);
    persistVitalsLog(newLog);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#180f2d] via-[#110924] to-[#0b0517] border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/80 text-white space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            handleDisconnectDevice();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Generic Telemetry Sync</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sync Health Data &amp; Telemetry
            </h3>
            <p className="text-xs text-purple-200">
              Connect blood pressure cuffs, pulse oximeters, &amp; glucometers to automatically log vitals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLogEnabled}
                onChange={(e) => setAutoLogEnabled(e.target.checked)}
                className="w-4 h-4 rounded-md accent-emerald-500 text-emerald-500"
              />
              <span className="font-semibold text-slate-200">Auto-Log to Record</span>
            </label>
          </div>
        </div>

        {/* ACTIVE STREAMING TELEMETRY BANNER (IF CONNECTED) */}
        {activeStreamingDevice && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-purple-950/40 to-black/60 border-2 border-emerald-400/60 shadow-xl shadow-emerald-950/50 space-y-3 relative overflow-hidden animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Live Telemetry Stream Active
                </span>
                <span className="text-xs text-purple-300 font-bold">• {activeStreamingDevice.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualLogReading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Log Snapshot to EHR</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectDevice}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Stop Stream
                </button>
              </div>
            </div>

            {/* Big Live Metric Gauge Display */}
            {currentLiveReading ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-emerald-400/30">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 transition-transform ${pulseBeat ? 'scale-110 shadow-lg shadow-emerald-500/50' : 'scale-100'}`}>
                    <Heart className={`w-7 h-7 ${pulseBeat ? 'fill-emerald-400' : ''}`} />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block uppercase">Real-Time Reading</span>
                    <h4 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
                      {currentLiveReading.formattedValue}
                    </h4>
                    <span className="text-xs text-emerald-300 font-medium">
                      Status: {currentLiveReading.status.toUpperCase()} • {currentLiveReading.notes}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <span>Streamed via Bluetooth BLE</span>
                  <div className="text-emerald-400 font-bold text-[11px]">
                    Updating every 2.2s
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/40 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Synchronizing incoming data stream packets...</span>
              </div>
            )}
          </div>
        )}

        {/* GENERIC MONITORING DEVICES GRID */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Bluetooth className="w-4 h-4 text-blue-400" />
              <span>Available Generic Monitoring Devices</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Supports standard Bluetooth LE Health Profile (GATT)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((device) => {
              const isStreaming = activeStreamingDevice?.id === device.id;
              const isConnecting = isConnectingId === device.id;

              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-2xl transition border ${
                    isStreaming 
                      ? 'bg-emerald-950/40 border-emerald-400/60 shadow-lg shadow-emerald-950/40' 
                      : 'bg-white/5 border-white/10 hover:border-purple-400/40'
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-purple-200">
                          {device.connectionType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Bat: {device.batteryPercent}%
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white">{device.name}</h5>
                      <p className="text-[11px] text-slate-300 font-mono truncate max-w-[220px]">
                        {device.model}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConnectDevice(device)}
                      disabled={isConnecting}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isStreaming
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-md'
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Pairing...</span>
                        </>
                      ) : isStreaming ? (
                        <>
                          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Disconnect</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Connect &amp; Stream</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOGGED VITALS HISTORY IN PATIENT RECORD */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Logged Vitals in Patient Record ({vitalsLog.length})</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Accessible to assigned clinical caregivers &amp; visiting nurses
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playSuccessPing();
                confetti({ particleCount: 30, spread: 50 });
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Vitals</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-slate-300 font-bold border-b border-white/10">
                <tr>
                  <th className="p-3">Time &amp; Date</th>
                  <th className="p-3">Device / Parameter</th>
                  <th className="p-3">Telemetry Value</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Source</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {vitalsLog.map((vital) => (
                  <tr key={vital.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(vital.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {vital.deviceName}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-300">
                      {vital.formattedValue}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        vital.status === 'normal' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}>
                        {vital.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-purple-300">
                      Bluetooth BLE
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteVitalEntry(vital.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Health Record Storage</span>
          </span>

          <button
            type="button"
            onClick={() => {
              handleDisconnectDevice();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 text-xs font-black shadow-md transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
