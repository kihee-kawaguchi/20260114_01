/**
 * Remove currency symbols and commas from amount strings
 * @param amount - Amount string with currency symbols (e.g., "¥1,000")
 * @returns Cleaned amount string (e.g., "1000")
 */
export function cleanAmount(amount: string): string {
  return amount.replace(/[¥,]/g, '').trim();
}

/**
 * Convert date string to Unix timestamp in milliseconds
 * Supports various Japanese date formats
 * @param dateStr - Date string (e.g., "2024/01/15 10:30", "2024-01-15")
 * @returns Unix timestamp in milliseconds
 */
export function dateToTimestamp(dateStr: string): number {
  if (!dateStr || dateStr.trim() === '') {
    return Date.now();
  }

  // Replace Japanese date separators
  const normalized = dateStr
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, ' ')
    .trim();

  const date = new Date(normalized);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  return date.getTime();
}

/**
 * Validate email format
 * @param email - Email string
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Japanese)
 * @param phone - Phone number string
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Remove hyphens and spaces for validation
  const cleaned = phone.replace(/[-\s]/g, '');
  // Japanese phone numbers are typically 10-11 digits
  return /^0\d{9,10}$/.test(cleaned);
}
