import { HealthDevice, SyncedHealthReading } from '../types';

export const INITIAL_HEALTH_DEVICES: HealthDevice[] = [
  {
    id: 'dev-bp-1',
    name: 'Smart Blood Pressure Monitor',
    type: 'blood_pressure',
    model: 'CardioCheck BLE Arm Cuff (Model BP-200)',
    connectionType: 'Bluetooth BLE',
    batteryPercent: 88,
    lastSyncedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'disconnected'
  },
  {
    id: 'dev-pulse-1',
    name: 'Continuous Pulse Oximeter',
    type: 'pulse_oximeter',
    model: 'Onyx Clinical SpO2 Fingertip Sensor',
    connectionType: 'Bluetooth BLE',
    batteryPercent: 94,
    lastSyncedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'disconnected'
  },
  {
    id: 'dev-glu-1',
    name: 'Smart Blood Glucose Meter',
    type: 'glucometer',
    model: 'AccuTrack Wireless Gluco-Sensor',
    connectionType: 'Bluetooth BLE',
    batteryPercent: 76,
    lastSyncedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'disconnected'
  },
  {
    id: 'dev-temp-1',
    name: 'Infrared Temporal Thermometer',
    type: 'thermometer',
    model: 'ThermoGlow Clinical No-Touch Scanner',
    connectionType: 'Bluetooth BLE',
    batteryPercent: 91,
    lastSyncedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'disconnected'
  }
];

export const INITIAL_VITALS_LOG: SyncedHealthReading[] = [
  {
    id: 'vital-init-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    deviceType: 'blood_pressure',
    deviceName: 'Smart Blood Pressure Monitor',
    metrics: { systolic: 124, diastolic: 82, heartRate: 74 },
    formattedValue: '124/82 mmHg • HR 74 bpm',
    status: 'normal',
    notes: 'Morning resting reading. Within MOHW target range.',
    syncedVia: 'bluetooth_ble'
  },
  {
    id: 'vital-init-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    deviceType: 'pulse_oximeter',
    deviceName: 'Continuous Pulse Oximeter',
    metrics: { spo2: 98, heartRate: 72 },
    formattedValue: '98% SpO2 • Pulse 72 bpm',
    status: 'normal',
    notes: 'Room air oxygen saturation stable.',
    syncedVia: 'bluetooth_ble'
  },
  {
    id: 'vital-init-3',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    deviceType: 'glucometer',
    deviceName: 'Smart Blood Glucose Meter',
    metrics: { glucoseMmol: 5.8 },
    formattedValue: '5.8 mmol/L (Fasting)',
    status: 'normal',
    notes: 'Fasting blood glucose before breakfast.',
    syncedVia: 'bluetooth_ble'
  },
  {
    id: 'vital-init-4',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    deviceType: 'thermometer',
    deviceName: 'Infrared Temporal Thermometer',
    metrics: { temperatureC: 36.6 },
    formattedValue: '36.6 °C (97.9 °F)',
    status: 'normal',
    notes: 'Afebrile, normal core body temperature.',
    syncedVia: 'bluetooth_ble'
  }
];

/**
 * Mock function to simulate a continuous or discrete clinical data stream from connected health monitoring devices
 */
export function simulateHealthDeviceDataStream(
  deviceType: HealthDevice['type'],
  deviceName: string,
  onReading: (reading: SyncedHealthReading) => void,
  intervalMs = 2200
): () => void {
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const nowIso = new Date().toISOString();

    let reading: SyncedHealthReading;

    switch (deviceType) {
      case 'blood_pressure': {
        // Subtle physiologic fluctuations around 120-128 / 78-84
        const systolic = 120 + Math.floor(Math.sin(step) * 5) + (step % 3);
        const diastolic = 80 + Math.floor(Math.cos(step) * 3);
        const heartRate = 72 + Math.floor(Math.sin(step * 1.5) * 4);
        const status = systolic > 135 || diastolic > 88 ? 'attention' : 'normal';

        reading = {
          id: `reading-bp-${Date.now()}`,
          timestamp: nowIso,
          deviceType: 'blood_pressure',
          deviceName,
          metrics: { systolic, diastolic, heartRate },
          formattedValue: `${systolic}/${diastolic} mmHg • HR ${heartRate} bpm`,
          status,
          notes: status === 'normal' ? 'Normal arterial pressure' : 'Mild elevated pressure detected',
          syncedVia: 'bluetooth_ble'
        };
        break;
      }

      case 'pulse_oximeter': {
        // Realistic SpO2 97 - 99% with dynamic pulse
        const spo2 = 98 + (step % 2 === 0 ? 1 : 0) - (step % 5 === 0 ? 1 : 0);
        const heartRate = 70 + Math.floor(Math.sin(step) * 6);
        const status = spo2 < 94 ? 'attention' : 'normal';

        reading = {
          id: `reading-spo2-${Date.now()}`,
          timestamp: nowIso,
          deviceType: 'pulse_oximeter',
          deviceName,
          metrics: { spo2, heartRate },
          formattedValue: `${spo2}% SpO2 • HR ${heartRate} bpm`,
          status,
          notes: 'Optimal peripheral capillary oxygenation',
          syncedVia: 'bluetooth_ble'
        };
        break;
      }

      case 'glucometer': {
        // Fasting glucose fluctuations 5.4 - 6.4 mmol/L
        const glucoseMmol = Number((5.6 + (Math.sin(step) * 0.4)).toFixed(1));
        const status = glucoseMmol > 7.0 ? 'attention' : 'normal';

        reading = {
          id: `reading-glu-${Date.now()}`,
          timestamp: nowIso,
          deviceType: 'glucometer',
          deviceName,
          metrics: { glucoseMmol },
          formattedValue: `${glucoseMmol} mmol/L (Capillary Blood)`,
          status,
          notes: 'Standard pre-meal fasting range',
          syncedVia: 'bluetooth_ble'
        };
        break;
      }

      case 'thermometer': {
        const temperatureC = Number((36.5 + (Math.sin(step) * 0.2)).toFixed(1));
        const status = temperatureC >= 37.8 ? 'attention' : 'normal';

        reading = {
          id: `reading-temp-${Date.now()}`,
          timestamp: nowIso,
          deviceType: 'thermometer',
          deviceName,
          metrics: { temperatureC },
          formattedValue: `${temperatureC} °C (${((temperatureC * 9/5) + 32).toFixed(1)} °F)`,
          status,
          notes: 'Afebrile core temperature',
          syncedVia: 'bluetooth_ble'
        };
        break;
      }

      case 'weight_scale':
      default: {
        const weightKg = Number((68.4 + (Math.sin(step) * 0.2)).toFixed(1));
        reading = {
          id: `reading-wt-${Date.now()}`,
          timestamp: nowIso,
          deviceType: 'weight_scale',
          deviceName,
          metrics: { weightKg },
          formattedValue: `${weightKg} kg (${(weightKg * 2.20462).toFixed(1)} lbs)`,
          status: 'normal',
          notes: 'Stable body mass index baseline',
          syncedVia: 'bluetooth_ble'
        };
        break;
      }
    }

    onReading(reading);
  }, intervalMs);

  return () => clearInterval(timer);
}
