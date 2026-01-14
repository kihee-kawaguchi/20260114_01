import { join } from 'path';
import { existsSync } from 'fs';
import { LarkClient } from '../api/lark-client.js';
import { parseScanSnapCSV } from '../parsers/csv-parser.js';
import { dateToTimestamp } from '../utils/data-transformer.js';
import type { SyncConfig, ScanSnapRecord, LarkBaseRecord } from '../types/index.js';

export class SyncManager {
  private readonly client: LarkClient;
  private readonly config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
    this.client = new LarkClient(config.larkAppId, config.larkAppSecret);
  }

  /**
   * Sync all records from ScanSnap CSV to Lark Base
   * @returns Number of successfully synced records
   */
  async syncAll(): Promise<number> {
    console.log('Starting sync...');
    console.log(`Reading CSV from: ${this.config.csvPath}`);

    // Parse CSV
    const records = await parseScanSnapCSV(this.config.csvPath);
    console.log(`Found ${records.length} records`);

    let successCount = 0;
    let errorCount = 0;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`\nProcessing record ${i + 1}/${records.length}: ${record.name || '(No name)'}`);

      try {
        await this.syncRecord(record);
        successCount++;
        console.log(`✓ Successfully synced: ${record.name}`);
      } catch (error) {
        errorCount++;
        if (error instanceof Error) {
          console.error(`✗ Failed to sync ${record.name}: ${error.message}`);
        } else {
          console.error(`✗ Failed to sync ${record.name}: Unknown error`);
        }
      }
    }

    console.log('\n--- Sync Complete ---');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Total: ${records.length}`);

    return successCount;
  }

  /**
   * Sync a single record
   * @param record - ScanSnap record
   */
  private async syncRecord(record: ScanSnapRecord): Promise<void> {
    // Step 1: Upload image if exists
    let fileToken: string | undefined;

    if (record.imagePath) {
      const imagePath = join(this.config.imageDir, record.imagePath);

      if (existsSync(imagePath)) {
        console.log(`  Uploading image: ${record.imagePath}`);
        fileToken = await this.client.uploadImage(imagePath);
        console.log(`  ✓ Image uploaded: ${fileToken}`);
      } else {
        console.log(`  ! Image not found: ${imagePath}`);
      }
    }

    // Step 2: Convert scan date to timestamp
    const scanTimestamp = dateToTimestamp(record.scanDate);

    // Step 3: Create Lark Base record
    const larkRecord: LarkBaseRecord = {
      fields: {
        name: record.name,
        company: record.company,
        department: record.department,
        position: record.position,
        email: record.email,
        phone: record.phone,
        mobile: record.mobile,
        fax: record.fax,
        postalCode: record.postalCode,
        address: record.address,
        url: record.url,
        notes: record.notes,
        image: fileToken !== undefined ? [{ file_token: fileToken }] : [],
        scanDate: scanTimestamp
      }
    };

    // Step 4: Add to Lark Base
    console.log('  Adding record to Lark Base...');
    const recordId = await this.client.addRecord(
      this.config.larkBaseId,
      this.config.larkTableId,
      larkRecord
    );
    console.log(`  ✓ Record added: ${recordId}`);
  }
}
