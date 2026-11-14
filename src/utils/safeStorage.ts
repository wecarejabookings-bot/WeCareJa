/**
 * Safe browser Storage guard & quota recovery utility.
 * Prevents QuotaExceededError from crashing React when localStorage/sessionStorage
 * approaches browser limits (e.g., when inline base64 document previews are cached on static hosts).
 */

const GUARD_FLAG = '__wecareSafeStorageInstalled__';

const DISPOSABLE_CACHE_KEYS = [
  'wecare_uploaded_docs_latest',
  'wecare_custom_store_catalog',
  'wecare_topics_directory_cache',
  'wecare_cms_cache',
  'wecare_health_news_cache'
];

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number; message?: string };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    (typeof e.message === 'string' && e.message.toLowerCase().includes('quota'))
  );
}

function stripLargeInlineDataUrls(input: unknown, maxLen = 60000): unknown {
  if (typeof input === 'string') {
    if (input.startsWith('data:') && input.length > maxLen) {
      return '';
    }
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => stripLargeInlineDataUrls(item, maxLen));
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = stripLargeInlineDataUrls(v, maxLen);
    }
    return out;
  }
  return input;
}

function evictDisposableCaches(storage: Storage, protectedKey: string) {
  try {
    for (const k of DISPOSABLE_CACHE_KEYS) {
      if (k !== protectedKey) {
        storage.removeItem(k);
      }
    }

    const cacheCandidates: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (
        k &&
        k !== protectedKey &&
        (k.startsWith('wecare_uploaded_docs_') ||
          k.startsWith('wecare_news_') ||
          k.startsWith('wecare_dossier_'))
      ) {
        cacheCandidates.push(k);
      }
    }

    for (const k of cacheCandidates) {
      if (k.startsWith('wecare_uploaded_docs_') || k.startsWith('wecare_news_')) {
        storage.removeItem(k);
      }
    }

    for (const k of cacheCandidates) {
      if (k.startsWith('wecare_dossier_')) {
        const val = storage.getItem(k);
        if (val && val.length > 250000) {
          try {
            const parsed = JSON.parse(val);
            storage.setItem(k, JSON.stringify(stripLargeInlineDataUrls(parsed, 40000)));
          } catch {
            storage.removeItem(k);
          }
        }
      }
    }
  } catch {}
}

export function installSafeStorageGuard(): void {
  if (typeof window === 'undefined' || typeof Storage === 'undefined') return;
  const proto = Storage.prototype as Storage & { [GUARD_FLAG]?: boolean };
  if (proto[GUARD_FLAG]) return;

  const originalSetItem = proto.setItem;
  proto[GUARD_FLAG] = true;

  proto.setItem = function safeSetItem(this: Storage, key: string, value: string): void {
    try {
      originalSetItem.call(this, key, value);
    } catch (err) {
      if (!isQuotaError(err)) {
        console.warn(`[SafeStorage] Failed saving "${key}":`, err);
        return;
      }

      // 1. Evict disposable/oversized cache entries and retry
      evictDisposableCaches(this, key);
      try {
        originalSetItem.call(this, key, value);
        return;
      } catch {}

      // 2. If value is JSON with large inline base64 data URLs, compact them and retry
      if (typeof value === 'string' && value.length > 100000 && (value.startsWith('{') || value.startsWith('['))) {
        try {
          const parsed = JSON.parse(value);
          const compacted = JSON.stringify(stripLargeInlineDataUrls(parsed, 32000));
          originalSetItem.call(this, key, compacted);
          return;
        } catch {}
      }

      // 3. Last resort: remove largest non-auth wecare_* key and retry once
      try {
        let largestKey = '';
        let largestLen = 0;
        for (let i = 0; i < this.length; i++) {
          const k = this.key(i);
          if (
            k &&
            k !== key &&
            k !== 'wecare_current_user_id' &&
            k !== 'wecare_session_user_id' &&
            !k.startsWith('sb-')
          ) {
            const len = (this.getItem(k) || '').length;
            if (len > largestLen) {
              largestLen = len;
              largestKey = k;
            }
          }
        }
        if (largestKey && largestLen > 50000) {
          this.removeItem(largestKey);
          originalSetItem.call(this, key, value);
          return;
        }
      } catch {}

      console.warn(`[SafeStorage] Storage quota full; skipped caching "${key}" (${value?.length || 0} chars).`);
    }
  };
}

export function safeStorageSet(key: string, value: string, storage?: Storage): void {
  if (typeof window === 'undefined') return;
  try {
    const target = storage || window.localStorage;
    target.setItem(key, value);
  } catch (err) {
    console.warn(`[SafeStorage] Could not save "${key}":`, err);
  }
}

export function clearBloatedStorageCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('wecare_uploaded_docs_') ||
          k.startsWith('wecare_dossier_') ||
          k === 'wecare_custom_store_catalog' ||
          k === 'wecare_notifications')
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
