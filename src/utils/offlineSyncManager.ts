import { useState, useEffect, useCallback, useRef } from 'react';
import { ClinicalNotes, VisitUpdateLog, Booking } from '../types';
import { soundFX } from './soundEffects';

export type OfflineSyncActionType = 
  | 'save_clinical_notes' 
  | 'doorstep_arrival' 
  | 'doorstep_checkout' 
  | 'visit_started'
  | 'create_booking';

export interface BookingFormDraft {
  serviceId?: string;
  serviceName?: string;
  zone?: string;
  clientAddress?: string;
  clientName?: string;
  clientPhone?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  visitDate?: string;
  visitTime?: string;
  notes?: string;
  selectedNurseId?: string;
  selectedNurseName?: string;
  paymentMethod?: string;
  currentStep?: 'browse' | 'select_service' | 'schedule_location' | 'select_nurse' | 'payment_confirm' | 'success';
  lastSavedAt: string;
}

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
    booking?: Booking;
    bookingDraft?: BookingFormDraft;
  };
  retryCount: number;
  synced: boolean;
}

const OFFLINE_QUEUE_STORAGE_KEY = 'wecare_offline_sync_queue';
const OFFLINE_DRAFT_NOTES_PREFIX = 'wecare_draft_notes_';
const OFFLINE_BOOKING_DRAFT_KEY = 'wecare_offline_booking_draft';
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
  const online = isNetworkOnline();
  window.dispatchEvent(new CustomEvent('wecare_network_status_changed', { 
    detail: { isOnline: online, isSimulated: simulated } 
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
  
  // Update existing pending action if same type and booking (unless it's creating a booking)
  const existingIdx = actionType === 'create_booking' 
    ? -1 
    : queue.findIndex(q => q.bookingId === bookingId && q.actionType === actionType);

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
 * Enqueues an entire booking that was created while offline
 */
export function enqueueOfflineBooking(booking: Booking): PendingSyncAction {
  return enqueueOfflineAction('create_booking', booking.id, {
    booking: {
      ...booking,
      offlinePendingCreation: true
    }
  });
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
 * Save booking form data entered into client booking wizard locally to localStorage
 */
export function saveBookingFormDraft(draft: Partial<BookingFormDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getBookingFormDraft() || { lastSavedAt: '' };
    const merged: BookingFormDraft = {
      ...existing,
      ...draft,
      lastSavedAt: new Date().toISOString()
    };
    localStorage.setItem(OFFLINE_BOOKING_DRAFT_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('wecare_booking_draft_changed', { detail: merged }));
  } catch (err) {
    console.warn('Failed to save booking draft to localStorage', err);
  }
}

/**
 * Reads the unsaved booking form draft from localStorage
 */
export function getBookingFormDraft(): BookingFormDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFLINE_BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse booking draft from localStorage:', err);
    return null;
  }
}

/**
 * Checks if a non-empty booking draft exists
 */
export function hasBookingFormDraft(): boolean {
  const draft = getBookingFormDraft();
  if (!draft) return false;
  return Boolean(
    draft.serviceId || 
    draft.clientAddress || 
    draft.notes || 
    draft.selectedNurseId ||
    (draft.currentStep && draft.currentStep !== 'browse')
  );
}

/**
 * Clears the booking form draft once submitted or intentionally discarded
 */
export function clearBookingFormDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(OFFLINE_BOOKING_DRAFT_KEY);
    window.dispatchEvent(new CustomEvent('wecare_booking_draft_changed', { detail: null }));
  } catch (err) {
    console.warn('Failed to clear booking draft from localStorage', err);
  }
}

/**
 * Get the timestamp of the last successful synchronization
 */
export function getLastSyncTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Records a successful synchronization timestamp
 */
export function setLastSyncTimestamp(isoString: string): void {
  if (typeof window === 'undefined') return;
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
      } else if (item.actionType === 'create_booking') {
        clearBookingFormDraft();
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
 * React hook for observing network connectivity and pending offline queue,
 * with connection restored alert notifications.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => isNetworkOnline());
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(() => getIsSimulatedOffline());
  const [pendingQueue, setPendingQueue] = useState<PendingSyncAction[]>(() => getOfflineSyncQueue());
  const [bookingDraft, setBookingDraft] = useState<BookingFormDraft | null>(() => getBookingFormDraft());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastSyncTimestamp());
  const [showRestoredAlert, setShowRestoredAlert] = useState<boolean>(false);

  // Keep ref of previous online state to detect reconnection
  const prevOnlineRef = useRef<boolean>(isNetworkOnline());

  const updateStatus = useCallback(() => {
    const currentOnline = isNetworkOnline();
    const prevOnline = prevOnlineRef.current;
    
    setIsOnline(currentOnline);
    setIsSimulatedOfflineState(getIsSimulatedOffline());
    
    const queue = getOfflineSyncQueue();
    setPendingQueue(queue);
    
    const draft = getBookingFormDraft();
    setBookingDraft(draft);
    
    setLastSyncedAt(getLastSyncTimestamp());

    // When connection transitions from offline to online and there is pending work
    if (!prevOnline && currentOnline) {
      if (queue.length > 0 || (draft && (draft.serviceId || draft.clientAddress || draft.notes))) {
        setShowRestoredAlert(true);
        soundFX.playRandomDelightChime();
        // Dispatch window event for listeners in portal
        window.dispatchEvent(new CustomEvent('wecare_connection_restored', {
          detail: { queueCount: queue.length, hasDraft: Boolean(draft) }
        }));
      }
    }

    prevOnlineRef.current = currentOnline;
  }, []);

  useEffect(() => {
    const handleOnline = () => updateStatus();
    const handleOffline = () => {
      setIsOnline(false);
      prevOnlineRef.current = false;
    };
    const handleCustomChange = () => updateStatus();
    const handleQueueChange = () => {
      setPendingQueue(getOfflineSyncQueue());
      setLastSyncedAt(getLastSyncTimestamp());
    };
    const handleDraftChange = (e: any) => {
      setBookingDraft(e.detail || null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('wecare_network_status_changed', handleCustomChange);
    window.addEventListener('wecare_offline_queue_changed', handleQueueChange);
    window.addEventListener('wecare_booking_draft_changed', handleDraftChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('wecare_network_status_changed', handleCustomChange);
      window.removeEventListener('wecare_offline_queue_changed', handleQueueChange);
      window.removeEventListener('wecare_booking_draft_changed', handleDraftChange);
    };
  }, [updateStatus]);

  const toggleSimulatedOffline = useCallback(() => {
    const next = !getIsSimulatedOffline();
    setSimulatedOffline(next);
    setIsSimulatedOfflineState(next);
    const effectiveOnline = !next && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    setIsOnline(effectiveOnline);
    
    if (effectiveOnline && (pendingQueue.length > 0 || (bookingDraft && (bookingDraft.serviceId || bookingDraft.clientAddress)))) {
      setShowRestoredAlert(true);
      soundFX.playRandomDelightChime();
    }
    
    soundFX.playTabSwitch();
  }, [pendingQueue.length, bookingDraft]);

  const dismissRestoredAlert = useCallback(() => {
    setShowRestoredAlert(false);
  }, []);

  const clearDraft = useCallback(() => {
    clearBookingFormDraft();
    setBookingDraft(null);
    soundFX.playGentleDing();
  }, []);

  return {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingQueue,
    pendingCount: pendingQueue.length,
    bookingDraft,
    hasDraft: Boolean(bookingDraft && (bookingDraft.serviceId || bookingDraft.clientAddress || bookingDraft.notes)),
    lastSyncedAt,
    showRestoredAlert,
    dismissRestoredAlert,
    clearDraft,
    refreshStatus: updateStatus
  };
}
