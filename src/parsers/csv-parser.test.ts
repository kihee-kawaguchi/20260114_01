import { describe, it, expect } from 'vitest';
import { writeFile, unlink } from 'fs/promises';
import iconv from 'iconv-lite';
import { parseScanSnapCSV } from './csv-parser.js';

describe('csv-parser', () => {
  const testCsvPath = './test-scansnap.csv';

  it('should parse CSV with Japanese headers', async () => {
    // Create test CSV in Shift-JIS
    const csvContent = `名前,会社名,部署,役職,メールアドレス,電話番号,携帯電話,FAX,郵便番号,住所,URL,備考,画像パス,スキャン日時
山田太郎,株式会社テスト,営業部,部長,yamada@test.com,03-1234-5678,090-1234-5678,03-1234-5679,100-0001,東京都千代田区,https://test.com,テストユーザー,image1.jpg,2024-01-15 10:30`;

    const buffer = iconv.encode(csvContent, 'cp932');
    await writeFile(testCsvPath, buffer);

    try {
      const records = await parseScanSnapCSV(testCsvPath);

      expect(records).toHaveLength(1);
      expect(records[0]?.name).toBe('山田太郎');
      expect(records[0]?.company).toBe('株式会社テスト');
      expect(records[0]?.department).toBe('営業部');
      expect(records[0]?.position).toBe('部長');
      expect(records[0]?.email).toBe('yamada@test.com');
      expect(records[0]?.phone).toBe('03-1234-5678');
      expect(records[0]?.mobile).toBe('090-1234-5678');
      expect(records[0]?.fax).toBe('03-1234-5679');
      expect(records[0]?.postalCode).toBe('100-0001');
      expect(records[0]?.address).toBe('東京都千代田区');
      expect(records[0]?.url).toBe('https://test.com');
      expect(records[0]?.notes).toBe('テストユーザー');
      expect(records[0]?.imagePath).toBe('image1.jpg');
      expect(records[0]?.scanDate).toBe('2024-01-15 10:30');
    } finally {
      await unlink(testCsvPath);
    }
  });

  it('should parse CSV with English headers', async () => {
    const csvContent = `name,company,department,position,email,phone,mobile,fax,postalCode,address,url,notes,imagePath,scanDate
John Doe,Test Inc,Sales,Manager,john@test.com,03-1234-5678,090-1234-5678,03-1234-5679,100-0001,Tokyo,https://test.com,Test user,image1.jpg,2024-01-15`;

    const buffer = iconv.encode(csvContent, 'cp932');
    await writeFile(testCsvPath, buffer);

    try {
      const records = await parseScanSnapCSV(testCsvPath);

      expect(records).toHaveLength(1);
      expect(records[0]?.name).toBe('John Doe');
      expect(records[0]?.company).toBe('Test Inc');
    } finally {
      await unlink(testCsvPath);
    }
  });

  it('should handle empty fields', async () => {
    const csvContent = `名前,会社名,部署,役職,メールアドレス,電話番号,携帯電話,FAX,郵便番号,住所,URL,備考,画像パス,スキャン日時
山田太郎,,,,,,,,,,,,image1.jpg,`;

    const buffer = iconv.encode(csvContent, 'cp932');
    await writeFile(testCsvPath, buffer);

    try {
      const records = await parseScanSnapCSV(testCsvPath);

      expect(records).toHaveLength(1);
      expect(records[0]?.name).toBe('山田太郎');
      expect(records[0]?.company).toBe('');
      expect(records[0]?.email).toBe('');
    } finally {
      await unlink(testCsvPath);
    }
  });

  it('should throw error for non-existent file', async () => {
    await expect(parseScanSnapCSV('./non-existent.csv')).rejects.toThrow();
  });
});
