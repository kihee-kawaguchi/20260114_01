import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { LarkClient } from './lark-client.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('LarkClient', () => {
  let client: LarkClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
      defaults: {},
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() }
      },
      getUri: vi.fn()
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    client = new LarkClient('test_app_id', 'test_app_secret');
  });

  describe('constructor', () => {
    it('should create instance with app credentials', () => {
      expect(client).toBeInstanceOf(LarkClient);
    });
  });

  describe('addRecord', () => {
    it('should add record to Lark Base', async () => {
      const mockToken = 'test_token';
      const mockRecordId = 'record_123';

      // Mock token response and record creation
      mockAxiosInstance.post.mockImplementation((url: string) => {
        if (url.includes('tenant_access_token')) {
          return Promise.resolve({
            data: {
              code: 0,
              msg: 'success',
              tenant_access_token: mockToken,
              expire: 7200
            }
          });
        }
        if (url.includes('/records')) {
          return Promise.resolve({
            data: {
              code: 0,
              msg: 'success',
              data: {
                record: {
                  record_id: mockRecordId,
                  fields: {}
                }
              }
            }
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const record = {
        fields: {
          name: 'Test Name',
          company: 'Test Company',
          department: '',
          position: '',
          email: 'test@example.com',
          phone: '',
          mobile: '',
          fax: '',
          postalCode: '',
          address: '',
          url: '',
          notes: '',
          image: [],
          scanDate: Date.now()
        }
      };

      const result = await client.addRecord('base_id', 'table_id', record);
      expect(result).toBe(mockRecordId);
    });

    it('should throw error when API returns error', async () => {
      mockAxiosInstance.post.mockImplementation((url: string) => {
        if (url.includes('tenant_access_token')) {
          return Promise.resolve({
            data: {
              code: 0,
              msg: 'success',
              tenant_access_token: 'test_token',
              expire: 7200
            }
          });
        }
        return Promise.resolve({
          data: {
            code: 500,
            msg: 'Internal error'
          }
        });
      });

      const record = {
        fields: {
          name: 'Test',
          company: '',
          department: '',
          position: '',
          email: '',
          phone: '',
          mobile: '',
          fax: '',
          postalCode: '',
          address: '',
          url: '',
          notes: '',
          image: [],
          scanDate: Date.now()
        }
      };

      await expect(client.addRecord('base_id', 'table_id', record)).rejects.toThrow(
        'Failed to add record'
      );
    });
  });
});
