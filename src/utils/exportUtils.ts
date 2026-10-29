import { Booking, NurseProfile, UserAccount, PayoutRecord } from '../types';

export interface ExportArchiveItem {
  id: string;
  name: string;
  entityType: 'bookings' | 'nurses' | 'users' | 'payouts';
  recordCount: number;
  totalAmountJMD?: number;
  savedAt: string;
  filename: string;
  csvContent: string;
  filterSummary?: string;
  format: 'csv' | 'json';
}

const STORAGE_KEY = 'wecare_data_export_archives_v1';

/**
 * Escapes a field string for standard RFC4180 CSV format
 */
export function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // If string contains quotes, commas, newlines, or carriage returns, wrap in quotes and escape existing quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

/**
 * Generates an RFC4180 compliant CSV string with UTF-8 BOM
 */
export function generateCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map(row => row.map(escapeCSV).join(','));
  // Prepend UTF-8 BOM so Excel on Windows & Mac renders special characters and accents correctly
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Generates a TSV string for pasting directly into Excel or Google Sheets cells
 */
export function generateTSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(h => String(h).replace(/\t/g, ' ')).join('\t');
  const rowLines = rows.map(row => row.map(cell => {
    if (cell === null || cell === undefined) return '';
    return String(cell).replace(/\t|\r?\n/g, ' ');
  }).join('\t'));
  return [headerLine, ...rowLines].join('\n');
}

/**
 * Initiates browser download of text/csv/json content
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies text to user's system clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers / iframe restrictions
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

// -------------------------------------------------------------
// IN-APP LOCAL STORAGE ARCHIVES MANAGEMENT
// -------------------------------------------------------------

export function getExportArchives(): ExportArchiveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read export archives', e);
    return [];
  }
}

export function saveExportArchive(archive: Omit<ExportArchiveItem, 'id' | 'savedAt'>): ExportArchiveItem {
  const existing = getExportArchives();
  const newItem: ExportArchiveItem = {
    ...archive,
    id: `archive-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    savedAt: new Date().toISOString()
  };
  const updated = [newItem, ...existing].slice(0, 50); // keep up to 50 most recent
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist export archive', e);
  }
  return newItem;
}

export function deleteExportArchive(id: string): ExportArchiveItem[] {
  const existing = getExportArchives();
  const updated = existing.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function clearAllExportArchives(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

export function exportFullJsonStorageBackup(payload: {
  bookings: Booking[];
  nurses: NurseProfile[];
  userAccounts?: UserAccount[];
  payouts?: PayoutRecord[];
  archives?: ExportArchiveItem[];
}): void {
  const jsonContent = JSON.stringify({
    system: 'We Care Jamaica Clinical Dispatch Portal',
    exportedAt: new Date().toISOString(),
    version: '2.4.0',
    data: payload
  }, null, 2);

  const dateStr = new Date().toISOString().split('T')[0];
  triggerFileDownload(jsonContent, `wecare_complete_system_backup_${dateStr}.json`, 'application/json');
}
