import { describe, it, expect } from 'vitest';
import {
  cleanAmount,
  dateToTimestamp,
  isValidEmail,
  isValidPhone
} from './data-transformer.js';

describe('data-transformer', () => {
  describe('cleanAmount', () => {
    it('should remove yen symbol', () => {
      expect(cleanAmount('¥1000')).toBe('1000');
    });

    it('should remove commas', () => {
      expect(cleanAmount('1,000,000')).toBe('1000000');
    });

    it('should remove both yen symbol and commas', () => {
      expect(cleanAmount('¥1,234,567')).toBe('1234567');
    });

    it('should trim whitespace', () => {
      expect(cleanAmount('  ¥1,000  ')).toBe('1000');
    });

    it('should handle empty string', () => {
      expect(cleanAmount('')).toBe('');
    });
  });

  describe('dateToTimestamp', () => {
    it('should convert ISO date string to timestamp', () => {
      const timestamp = dateToTimestamp('2024-01-15');
      expect(timestamp).toBeGreaterThan(0);
      const date = new Date(timestamp);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });

    it('should convert Japanese date format', () => {
      const timestamp = dateToTimestamp('2024年1月15日');
      expect(timestamp).toBeGreaterThan(0);
      const date = new Date(timestamp);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });

    it('should handle datetime with time', () => {
      const timestamp = dateToTimestamp('2024/01/15 10:30');
      expect(timestamp).toBeGreaterThan(0);
      const date = new Date(timestamp);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(10);
      expect(date.getMinutes()).toBe(30);
    });

    it('should return current timestamp for empty string', () => {
      const before = Date.now();
      const timestamp = dateToTimestamp('');
      const after = Date.now();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should throw error for invalid date', () => {
      expect(() => dateToTimestamp('invalid-date')).toThrow('Invalid date format');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.jp')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no-at-sign.com')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Japanese phone numbers', () => {
      expect(isValidPhone('03-1234-5678')).toBe(true);
      expect(isValidPhone('090-1234-5678')).toBe(true);
      expect(isValidPhone('0312345678')).toBe(true);
      expect(isValidPhone('09012345678')).toBe(true);
    });

    it('should allow spaces', () => {
      expect(isValidPhone('03 1234 5678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('1234')).toBe(false);
      expect(isValidPhone('abc-defg-hijk')).toBe(false);
      expect(isValidPhone('12345678901234')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidPhone('')).toBe(false);
    });
  });
});
