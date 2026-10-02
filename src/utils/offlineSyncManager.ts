import { useState, useEffect, useCallback } from 'react';
import { ClinicalNotes, VisitUpdateLog, Booking } from '../types';
import { soundFX } from './soundEffects';

export type OfflineSyncActionType = 'save_clinical_notes' | 'doorstep_arrival' | 'doorstep_checkout' | 'visit_started';

export interface PendingSyncAction {
  id: string;
  actionType: OfflineSyncActionType;
  bookingId: string;
  timestamp: string;
  data: {
    clinicalNotes?: ClinicalNotes;
    visitUpdates?: VisitUpdateLog[];
    arrivalData?: Partial<Booking>;
    checkoutData?: Partial<Booking>;
    status?: Booking['status'];
    startedAt?: string;
  };
  retryCount: number;
  synced: boolean;
}

const OFFLINE_QUEUE_STORAGE_KEY = 'wecare_offline_sync_queue';
const OFFLINE_DRAFT_NOTES_PREFIX = 'wecare_draft_notes_';
const SIMULATED_OFFLINE_KEY = 'wecare_simulated_offline';
const LAST_SYNC_KEY = 'wecare_last_sync_timestamp';

/**
 * Checks if the application currently considers itself online,
 * respecting both browser navigator.onLine and simulated offline toggle.
 */
export function isNetworkOnline(): boolean {
  if (typeof window === 'undefined') return true;
  const isSimulated = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  if (isSimulated) return false;
  return navigator.onLine;
}

/**
 * Gets whether simulated offline mode is currently active
 */
export function getIsSimulatedOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
}

/**
 * Toggles or sets simulated offline mode for demonstration/testing
 */
export function setSimulatedOffline(simulated: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_OFFLINE_KEY, simulated ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('wecare_network_status_changed', { 
    detail: { isOnline: isNetworkOnline(), isSimulated: simulated } 
  }));
}

/**
 * Reads queued offline actions from localStorage
 */
export function getOfflineSyncQueue(): PendingSyncAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse offline sync queue:', err);
    return [];
  }
}

/**
 * Saves queue to localStorage and dispatches a custom event for in-page reactivity
 */
export function saveOfflineSyncQueue(queue: PendingSyncAction[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('wecare_offline_queue_changed', { detail: queue }));
  } catch (err) {
    console.error('Failed to save offline sync queue:', err);
  }
}

/**
 * Enqueue an offline action to localStorage
 */
export function enqueueOfflineAction(
  actionType: OfflineSyncActionType,
  bookingId: string,
  data: PendingSyncAction['data']
): PendingSyncAction {
  const queue = getOfflineSyncQueue();
  
  // Update existing pending action if same type and booking
  const existingIdx = queue.findIndex(q => q.bookingId === bookingId && q.actionType === actionType);

  const actionItem: PendingSyncAction = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actionType,
    bookingId,
    timestamp: new Date().toISOString(),
    data,
    retryCount: 0,
    synced: false
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = {
      ...queue[existingIdx],
      data: {
        ...queue[existingIdx].data,
        ...data
      },
      timestamp: new Date().toISOString()
    };
  } else {
    queue.push(actionItem);
  }

  saveOfflineSyncQueue(queue);
  return actionItem;
}

/**
 * Save draft clinical notes per booking for local recovery while typing or offline
 */
export function saveDraftClinicalNotes(bookingId: string, notes: Partial<ClinicalNotes>): void {
  try {
    localStorage.setItem(`${OFFLINE_DRAFT_NOTES_PREFIX}${bookingId}`, JSON.stringify({
      notes,
      savedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Failed to save draft notes', e);
  }
}

/**
 * Retrieve draft clinical notes
 */
export function getDraftClinicalNotes(bookingId: string): { notes: Partial<ClinicalNotes>; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(`${OFFLINE_DRAFT_NOTES_PREFIX}${bookingId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear draft clinical notes once successfully synced or saved
 */
export function clearDraftClinicalNotes(bookingId: string): void {
  localStorage.removeItem(`${OFFLINE_DRAFT_NOTES_PREFIX}${bookingId}`);
}

/**
 * Get the timestamp of the last successful synchronization
 */
export function getLastSyncTimestamp(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Records a successful synchronization timestamp
 */
export function setLastSyncTimestamp(isoString: string): void {
  localStorage.setItem(LAST_SYNC_KEY, isoString);
}

/**
 * Process pending offline sync queue and push to application state.
 * Returns the count of actions successfully synced.
 */
export function processOfflineSyncQueue(
  applyAction: (action: PendingSyncAction) => void
): number {
  const queue = getOfflineSyncQueue();
  if (!queue.length) return 0;

  let syncedCount = 0;
  const remainingQueue: PendingSyncAction[] = [];

  for (const item of queue) {
    try {
      applyAction(item);
      syncedCount++;
      if (item.actionType === 'save_clinical_notes') {
        clearDraftClinicalNotes(item.bookingId);
      }
    } catch (err) {
      console.error(`Failed to apply sync action ${item.id}:`, err);
      remainingQueue.push({
        ...item,
        retryCount: item.retryCount + 1
      });
    }
  }

  saveOfflineSyncQueue(remainingQueue);

  if (syncedCount > 0) {
    setLastSyncTimestamp(new Date().toISOString());
    soundFX.playSuccessPing();
  }

  return syncedCount;
}

/**
 * React hook for observing network connectivity and pending offline queue
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => isNetworkOnline());
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(() => getIsSimulatedOffline());
  const [pendingQueue, setPendingQueue] = useState<PendingSyncAction[]>(() => getOfflineSyncQueue());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastSyncTimestamp());

  const updateStatus = useCallback(() => {
    setIsOnline(isNetworkOnline());
    setIsSimulatedOfflineState(getIsSimulatedOffline());
    setPendingQueue(getOfflineSyncQueue());
    setLastSyncedAt(getLastSyncTimestamp());
  }, []);

  useEffect(() => {
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();
    const handleCustomChange = () => updateStatus();
    const handleQueueChange = () => {
      setPendingQueue(getOfflineSyncQueue());
      setLastSyncedAt(getLastSyncTimestamp());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('wecare_network_status_changed', handleCustomChange);
    window.addEventListener('wecare_offline_queue_changed', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('wecare_network_status_changed', handleCustomChange);
      window.removeEventListener('wecare_offline_queue_changed', handleQueueChange);
    };
  }, [updateStatus]);

  const toggleSimulatedOffline = useCallback(() => {
    const next = !getIsSimulatedOffline();
    setSimulatedOffline(next);
    setIsSimulatedOfflineState(next);
    setIsOnline(!next && navigator.onLine);
    soundFX.playTabSwitch();
  }, []);

  return {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingQueue,
    pendingCount: pendingQueue.length,
    lastSyncedAt,
    refreshStatus: updateStatus
  };
}
