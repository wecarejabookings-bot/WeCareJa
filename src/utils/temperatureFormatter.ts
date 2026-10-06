/**
 * Formats body temperature consistently across health records and vitals displays.
 * Prevents "36.6 °C°C" or "36.6°C°C" display bugs.
 */
export function formatTemperature(rawTemp?: string | number | null): string {
  if (rawTemp === null || rawTemp === undefined || rawTemp === '') {
    return '36.6 °C';
  }

  const str = String(rawTemp).trim();
  // Strip existing degree symbols, C, and trailing whitespace
  const cleanNumber = str.replace(/[°ºoO]?\s*[cC]/gi, '').replace(/[°º]/g, '').trim();

  // If parsed as number, return cleanly formatted with single °C
  const parsed = parseFloat(cleanNumber);
  if (!isNaN(parsed) && parsed > 20 && parsed < 50) {
    return `${parsed.toFixed(1)} °C`;
  }

  return cleanNumber ? `${cleanNumber} °C` : '36.6 °C';
}
