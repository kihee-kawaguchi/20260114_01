#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { SyncManager } from './sync/sync-manager.js';
import type { SyncConfig } from './types/index.js';

// Load environment variables
config();

const program = new Command();

program
  .name('scansnap-lark-sync')
  .description('Sync ScanSnap business card data to Lark Base')
  .version('1.0.0');

program
  .command('sync')
  .description('Sync all business cards from ScanSnap CSV to Lark Base')
  .option('-c, --csv <path>', 'Path to ScanSnap CSV file', process.env.SCANSNAP_CSV_PATH)
  .option('-i, --images <dir>', 'Directory containing scanned images', process.env.SCANSNAP_IMAGE_DIR)
  .option('--app-id <id>', 'Lark App ID', process.env.LARK_APP_ID)
  .option('--app-secret <secret>', 'Lark App Secret', process.env.LARK_APP_SECRET)
  .option('--base-id <id>', 'Lark Base ID', process.env.LARK_BASE_ID)
  .option('--table-id <id>', 'Lark Table ID', process.env.LARK_TABLE_ID)
  .action(async (options: Partial<SyncConfig> & { csv?: string; images?: string; appId?: string; appSecret?: string; baseId?: string; tableId?: string }) => {
    try {
      // Validate required options
      if (options.csv === undefined || options.csv === '') {
        throw new Error('CSV path is required (--csv or SCANSNAP_CSV_PATH)');
      }
      if (options.images === undefined || options.images === '') {
        throw new Error('Image directory is required (--images or SCANSNAP_IMAGE_DIR)');
      }
      if (options.appId === undefined || options.appId === '') {
        throw new Error('Lark App ID is required (--app-id or LARK_APP_ID)');
      }
      if (options.appSecret === undefined || options.appSecret === '') {
        throw new Error('Lark App Secret is required (--app-secret or LARK_APP_SECRET)');
      }
      if (options.baseId === undefined || options.baseId === '') {
        throw new Error('Lark Base ID is required (--base-id or LARK_BASE_ID)');
      }
      if (options.tableId === undefined || options.tableId === '') {
        throw new Error('Lark Table ID is required (--table-id or LARK_TABLE_ID)');
      }

      const config: SyncConfig = {
        csvPath: options.csv,
        imageDir: options.images,
        larkAppId: options.appId,
        larkAppSecret: options.appSecret,
        larkBaseId: options.baseId,
        larkTableId: options.tableId
      };

      const manager = new SyncManager(config);
      const successCount = await manager.syncAll();

      if (successCount > 0) {
        console.log(`\n✓ Successfully synced ${successCount} records`);
        process.exit(0);
      } else {
        console.error('\n✗ No records were synced');
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n✗ Error: ${error.message}`);
      } else {
        console.error('\n✗ Unknown error occurred');
      }
      process.exit(1);
    }
  });

program.parse();
