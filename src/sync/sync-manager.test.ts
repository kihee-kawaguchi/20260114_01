import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncManager } from './sync-manager.js';
import * as csvParser from '../parsers/csv-parser.js';
import { LarkClient } from '../api/lark-client.js';
import type { SyncConfig } from '../types/index.js';

vi.mock('../parsers/csv-parser.js');
vi.mock('../api/lark-client.js');
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true)
}));

describe('SyncManager', () => {
  let config: SyncConfig;
  let manager: SyncManager;

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      csvPath: './test.csv',
      imageDir: './images',
      larkAppId: 'app_id',
      larkAppSecret: 'app_secret',
      larkBaseId: 'base_id',
      larkTableId: 'table_id'
    };

    manager = new SyncManager(config);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('syncAll', () => {
    it('should sync all records successfully', async () => {
      const mockRecords = [
        {
          name: '山田太郎',
          company: 'テスト株式会社',
          department: '営業部',
          position: '部長',
          email: 'yamada@test.com',
          phone: '03-1234-5678',
          mobile: '090-1234-5678',
          fax: '',
          postalCode: '100-0001',
          address: '東京都',
          url: 'https://test.com',
          notes: '',
          imagePath: 'image1.jpg',
          scanDate: '2024-01-15'
        }
      ];

      vi.mocked(csvParser.parseScanSnapCSV).mockResolvedValue(mockRecords);

      const mockUploadImage = vi.fn().mockResolvedValue('file_token_123');
      const mockAddRecord = vi.fn().mockResolvedValue('record_id_123');

      vi.mocked(LarkClient).mockImplementation(() => ({
        uploadImage: mockUploadImage,
        addRecord: mockAddRecord
      }) as never);

      manager = new SyncManager(config);
      const result = await manager.syncAll();

      expect(result).toBe(1);
      expect(csvParser.parseScanSnapCSV).toHaveBeenCalledWith('./test.csv');
      expect(mockUploadImage).toHaveBeenCalled();
      expect(mockAddRecord).toHaveBeenCalled();
    });

    it('should handle records without images', async () => {
      const mockRecords = [
        {
          name: '田中花子',
          company: 'サンプル株式会社',
          department: '',
          position: '',
          email: 'tanaka@sample.com',
          phone: '',
          mobile: '',
          fax: '',
          postalCode: '',
          address: '',
          url: '',
          notes: '',
          imagePath: '',
          scanDate: '2024-01-16'
        }
      ];

      vi.mocked(csvParser.parseScanSnapCSV).mockResolvedValue(mockRecords);

      const mockUploadImage = vi.fn();
      const mockAddRecord = vi.fn().mockResolvedValue('record_id_456');

      vi.mocked(LarkClient).mockImplementation(() => ({
        uploadImage: mockUploadImage,
        addRecord: mockAddRecord
      }) as never);

      manager = new SyncManager(config);
      const result = await manager.syncAll();

      expect(result).toBe(1);
      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockAddRecord).toHaveBeenCalled();
    });

    it('should continue on error and return success count', async () => {
      const mockRecords = [
        {
          name: '成功',
          company: '株式会社OK',
          department: '',
          position: '',
          email: 'ok@test.com',
          phone: '',
          mobile: '',
          fax: '',
          postalCode: '',
          address: '',
          url: '',
          notes: '',
          imagePath: '',
          scanDate: '2024-01-15'
        },
        {
          name: '失敗',
          company: '株式会社NG',
          department: '',
          position: '',
          email: 'ng@test.com',
          phone: '',
          mobile: '',
          fax: '',
          postalCode: '',
          address: '',
          url: '',
          notes: '',
          imagePath: '',
          scanDate: '2024-01-16'
        }
      ];

      vi.mocked(csvParser.parseScanSnapCSV).mockResolvedValue(mockRecords);

      const mockAddRecord = vi
        .fn()
        .mockResolvedValueOnce('record_id_1')
        .mockRejectedValueOnce(new Error('API Error'));

      vi.mocked(LarkClient).mockImplementation(() => ({
        uploadImage: vi.fn(),
        addRecord: mockAddRecord
      }) as never);

      manager = new SyncManager(config);
      const result = await manager.syncAll();

      expect(result).toBe(1);
      expect(mockAddRecord).toHaveBeenCalledTimes(2);
    });
  });
});
