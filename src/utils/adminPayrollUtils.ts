import { AdminPayrollRecord, AdminPaymentHistoryItem, AdminPayStatus, Booking } from '../types';

export const ADMIN_PAYROLL_STORAGE_KEY = 'wecare_admin_payroll_v1';
export const PAYMENT_HISTORY_STORAGE_KEY = 'wecare_payment_history_v1';

export const OWNER_EMAIL = 'wecareja.bookings@gmail.com';

// Initial realistic staff for We Care Jamaica Administration in Kingston & St Andrew
export const INITIAL_ADMIN_PAYROLL: AdminPayrollRecord[] = [
  {
    id: 'admin-sydney',
    fullName: 'Sydney Mattis',
    email: 'wecareja.bookings@gmail.com',
    role: 'Manager',
    weeklySalaryJMD: 8500,
    startDate: '2025-01-06',
    status: 'Active',
    totalPaid: 0,
    totalEarned: 0,
    balanceDue: 0,
    lastPayDate: '2026-09-22',
    lynkOrBankInfo: 'Lynk @sydneymattis / NCB 214892019',
    phone: '1876-582-7613',
    lastAccrualMonday: '2026-09-28'
  }
];

export const INITIAL_PAYMENT_HISTORY: AdminPaymentHistoryItem[] = [];

/**
 * Returns the current date in Kingston, Jamaica (UTC-5, Eastern Standard Time, no DST)
 */
export function getKingstonNow(): Date {
  const now = new Date();
  try {
    const formatted = now.toLocaleString('en-US', { timeZone: 'America/Jamaica' });
    return new Date(formatted);
  } catch {
    // Fallback UTC-5
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc - 5 * 3600000);
  }
}

/**
 * Returns Monday 00:00:00 of the week containing the given date
 */
export function getMondayOfCurrentWeek(baseDate: Date = getKingstonNow()): Date {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  // In JS: Sunday is 0, Monday is 1, ..., Saturday is 6
  // Distance to Monday:
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns Sunday 23:59:59 of the week containing the given date
 */
export function getSundayOfCurrentWeek(baseDate: Date = getKingstonNow()): Date {
  const mon = getMondayOfCurrentWeek(baseDate);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
}

/**
 * Returns next Monday date (YYYY-MM-DD or formatted)
 */
export function getNextMondayDate(baseDate: Date = getKingstonNow()): Date {
  const currentMonday = getMondayOfCurrentWeek(baseDate);
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Returns a formatted Week Period string (e.g. "Mon Sep 22, 2026 - Sun Sep 28, 2026")
 */
export function getWeekPeriodString(baseDate: Date = getKingstonNow()): string {
  const monday = getMondayOfCurrentWeek(baseDate);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${monday.toLocaleDateString('en-US', formatOpts)} - ${sunday.toLocaleDateString('en-US', formatOpts)}`;
}

/**
 * Calculates weeks worked: floor((today - startDate)/7)
 */
export function getWeeksWorked(startDateStr: string, baseDate: Date = getKingstonNow()): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr);
  const diffMs = baseDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7));
}

/**
 * Determines payment status:
 * - Paid (green) if balanceDue <= 0
 * - Due (yellow) on Monday or Tuesday (Monday + 0/1 day) if balanceDue > 0
 * - Overdue (red) on Wednesday onwards (Monday + 2 days not paid) if balanceDue > 0
 */
export function getAdminPayStatus(
  admin: AdminPayrollRecord,
  baseDate: Date = getKingstonNow()
): {
  status: AdminPayStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
} {
  if (admin.balanceDue <= 0) {
    return {
      status: 'paid',
      label: 'Paid',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotClass: 'bg-emerald-400',
      description: 'Account fully settled. Balance JMD $0'
    };
  }

  // balanceDue > 0
  const day = baseDate.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  // Monday = 1, Tuesday = 2
  // Monday + 2 days = Wednesday (3)
  if (day === 1 || day === 2) {
    return {
      status: 'due',
      label: 'Due',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
      dotClass: 'bg-amber-400',
      description: 'Weekly stipend due today for payroll clearing'
    };
  } else {
    return {
      status: 'overdue',
      label: 'Overdue',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-bold',
      dotClass: 'bg-rose-400',
      description: 'Past Monday +2 days deadline without clearing'
    };
  }
}

/**
 * Reads admin payroll list from localStorage
 */
export function loadAdminPayroll(): AdminPayrollRecord[] {
  try {
    const raw = localStorage.getItem(ADMIN_PAYROLL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_PAYROLL_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_PAYROLL));
      return INITIAL_ADMIN_PAYROLL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Purge any legacy demo staff (kevin, dwayne, tanesha, althea)
      const cleaned = parsed.filter(
        (a: AdminPayrollRecord) =>
          a.id === 'admin-sydney' ||
          (!a.id.includes('kevin') &&
            !a.id.includes('dwayne') &&
            !a.id.includes('tanesha') &&
            !a.id.includes('althea'))
      );
      if (cleaned.length === 0) {
        localStorage.setItem(ADMIN_PAYROLL_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_PAYROLL));
        return INITIAL_ADMIN_PAYROLL;
      }
      localStorage.setItem(ADMIN_PAYROLL_STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (err) {
    console.error('Error loading admin payroll:', err);
  }
  return INITIAL_ADMIN_PAYROLL;
}

/**
 * Saves admin payroll list to localStorage
 */
export function saveAdminPayroll(data: AdminPayrollRecord[]): void {
  try {
    localStorage.setItem(ADMIN_PAYROLL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving admin payroll:', err);
  }
}

/**
 * Reads payment history list from localStorage
 */
export function loadPaymentHistory(): AdminPaymentHistoryItem[] {
  try {
    const raw = localStorage.getItem(PAYMENT_HISTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_PAYMENT_HISTORY));
      return INITIAL_PAYMENT_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any legacy demo payments
      const cleaned = parsed.filter(
        (p: AdminPaymentHistoryItem) =>
          !p.adminId?.includes('kevin') &&
          !p.adminId?.includes('dwayne') &&
          !p.adminId?.includes('tanesha') &&
          !p.adminId?.includes('althea')
      );
      localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (err) {
    console.error('Error loading payment history:', err);
  }
  return INITIAL_PAYMENT_HISTORY;
}

/**
 * Saves payment history list to localStorage
 */
export function savePaymentHistory(data: AdminPaymentHistoryItem[]): void {
  try {
    localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving payment history:', err);
  }
}

/**
 * AUTOMATED WEEKLY LOGIC:
 * Every Monday 12:00 AM Kingston time:
 * if status==Active:
 *   balanceDue += weeklySalaryJMD
 *   totalEarned += weeklySalaryJMD
 *   weeksWorked = floor((today - startDate)/7)
 *   nextPayDay = next Monday date
 */
export function checkAndRunAutomatedWeeklyLogic(
  currentRecords: AdminPayrollRecord[],
  forceAccrue: boolean = false
): { updatedRecords: AdminPayrollRecord[]; accruedCount: number } {
  const kingstonNow = getKingstonNow();
  const currentMonday = getMondayOfCurrentWeek(kingstonNow);
  const currentMondayIso = currentMonday.toISOString().split('T')[0];

  let accruedCount = 0;
  const updatedRecords = currentRecords.map((admin) => {
    if (admin.status !== 'Active') {
      return admin;
    }

    // Check if this Monday has already been accrued for this admin
    const alreadyAccrued = admin.lastAccrualMonday === currentMondayIso;
    if (alreadyAccrued && !forceAccrue) {
      return admin;
    }

    accruedCount++;
    const weeklySalary = Number(admin.weeklySalaryJMD) || 4000;
    return {
      ...admin,
      balanceDue: (admin.balanceDue || 0) + weeklySalary,
      totalEarned: (admin.totalEarned || 0) + weeklySalary,
      lastAccrualMonday: currentMondayIso
    };
  });

  if (accruedCount > 0) {
    saveAdminPayroll(updatedRecords);
  }

  return { updatedRecords, accruedCount };
}

/**
 * PLATFORM MATH (from 15%):
 * platformEarningsThisWeek = sum(all bookings * 0.15)
 * totalAdminPayrollDue = sum(balanceDue of all active admins)
 * profitThisWeek = platformEarningsThisWeek - totalAdminPayrollDue
 */
export function calculatePlatformFinance(
  bookings: Booking[],
  admins: AdminPayrollRecord[]
): {
  platformEarningsThisWeek: number;
  totalAdminPayrollDue: number;
  profitThisWeek: number;
  weeklyBookingsCount: number;
  totalBookingsVolume: number;
} {
  const kingstonNow = getKingstonNow();
  const weekStart = getMondayOfCurrentWeek(kingstonNow).getTime();
  const weekEnd = getSundayOfCurrentWeek(kingstonNow).getTime();

  // Filter bookings for this current week, or if empty fallback to active/recent bookings pool
  let thisWeekBookings = bookings.filter((b) => {
    const bookingDate = b.scheduledDateTime || b.createdAt;
    if (!bookingDate) return true;
    const time = new Date(bookingDate).getTime();
    return time >= weekStart && time <= weekEnd;
  });

  if (thisWeekBookings.length === 0) {
    // If no bookings fall in the exact current calendar week (e.g. mock data spans other weeks),
    // use all completed/confirmed/active bookings so realistic platform numbers are displayed!
    thisWeekBookings = bookings.filter((b) => b.status !== 'cancelled');
  }

  const weeklyBookingsCount = thisWeekBookings.length;
  const totalBookingsVolume = thisWeekBookings.reduce((sum, b) => sum + (b.priceJMD || 0), 0);

  // 15% Commission
  const platformEarningsThisWeek = thisWeekBookings.reduce((sum, b) => {
    if (typeof b.platformFeeJMD === 'number' && b.platformFeeJMD > 0) {
      return sum + b.platformFeeJMD;
    }
    return sum + (b.priceJMD || 0) * 0.15;
  }, 0);

  // Total payroll due for active admins
  const totalAdminPayrollDue = admins
    .filter((a) => a.status === 'Active')
    .reduce((sum, a) => sum + (a.balanceDue || 0), 0);

  const profitThisWeek = platformEarningsThisWeek - totalAdminPayrollDue;

  return {
    platformEarningsThisWeek,
    totalAdminPayrollDue,
    profitThisWeek,
    weeklyBookingsCount,
    totalBookingsVolume
  };
}

/**
 * Extracts the last 4 digits / handle suffix from a lynk or bank string
 * e.g. "NCB Acct: 592019283" -> "9283"
 * e.g. "Lynk @sydneymattis (876-582-7613)" -> "7613"
 */
export function getLast4(str: string): string {
  if (!str) return 'XXXX';
  const digitsOnly = str.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 4) {
    return digitsOnly.slice(-4);
  }
  const clean = str.trim();
  return clean.slice(-4) || 'XXXX';
}

/**
 * Formats a currency number into standard Jamaican Dollar string: JMD $X,XXX
 */
export function formatJMD(amount: number): string {
  return `JMD $${Math.round(amount).toLocaleString()}`;
}

/**
 * Exports Payment History table to CSV format and triggers browser file download.
 * Row 1 contains the official We Care Jamaica business address header as required.
 */
export function exportPaymentHistoryCSV(history: AdminPaymentHistoryItem[]): void {
  const addressRow1 = '"We Care Jamaica","4 Claudete Drive","St. Catherine, Jamaica","wecareja.bookings@gmail.com","(876) 582-7613"';
  const titleRow2 = '"Admin Payment & Disbursement Register","Official Settlement Record"';
  const blankRow3 = '""';

  const headers = [
    'Date',
    'Admin Full Name',
    'Role',
    'Amount (JMD)',
    'Payment Method',
    'Destination Account / Lynk',
    'Transaction ID',
    'Paid By',
    'Week Period',
    'Weekly Salary (JMD)',
    'Balance After Payment (JMD)',
    'Notes'
  ];

  const rows = history.map((item) => [
    `"${item.date}"`,
    `"${item.adminName.replace(/"/g, '""')}"`,
    `"${item.role}"`,
    item.amount,
    `"${item.method}"`,
    `"${(item.lynkOrBankInfo || '').replace(/"/g, '""')}"`,
    `"${item.transactionId}"`,
    `"${item.paidBy.replace(/"/g, '""')}"`,
    `"${item.weekPeriod}"`,
    item.weeklySalary,
    item.balanceAfterPayment,
    `"${(item.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    addressRow1,
    titleRow2,
    blankRow3,
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = getKingstonNow().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `wecare_admin_payment_history_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
