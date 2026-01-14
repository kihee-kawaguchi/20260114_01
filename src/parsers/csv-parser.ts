import { readFile } from 'fs/promises';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import type { ScanSnapRecord } from '../types/index.js';

/**
 * Parse ScanSnap CSV file (Shift-JIS encoded) and convert to UTF-8
 * @param csvPath - Path to the CSV file
 * @returns Array of ScanSnap records
 */
export async function parseScanSnapCSV(csvPath: string): Promise<ScanSnapRecord[]> {
  try {
    // Read file as buffer
    const buffer = await readFile(csvPath);

    // Decode from cp932 (Shift-JIS) to UTF-8
    const utf8Content = iconv.decode(buffer, 'cp932');

    // Parse CSV
    const records = parse(utf8Content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    }) as Array<Record<string, string>>;

    // Map to ScanSnapRecord type
    return records.map((record) => ({
      name: record['名前'] ?? record['name'] ?? '',
      company: record['会社名'] ?? record['company'] ?? '',
      department: record['部署'] ?? record['department'] ?? '',
      position: record['役職'] ?? record['position'] ?? '',
      email: record['メールアドレス'] ?? record['email'] ?? '',
      phone: record['電話番号'] ?? record['phone'] ?? '',
      mobile: record['携帯電話'] ?? record['mobile'] ?? '',
      fax: record['FAX'] ?? record['fax'] ?? '',
      postalCode: record['郵便番号'] ?? record['postalCode'] ?? '',
      address: record['住所'] ?? record['address'] ?? '',
      url: record['URL'] ?? record['url'] ?? '',
      notes: record['備考'] ?? record['notes'] ?? '',
      imagePath: record['画像パス'] ?? record['imagePath'] ?? '',
      scanDate: record['スキャン日時'] ?? record['scanDate'] ?? ''
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
    throw error;
  }
}
