import axios, { type AxiosInstance } from 'axios';
import FormData from 'form-data';
import { readFile } from 'fs/promises';
import type {
  LarkAccessTokenResponse,
  LarkDriveUploadResponse,
  LarkBaseAddRecordResponse,
  LarkBaseRecord
} from '../types/index.js';

export class LarkClient {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseUrl = 'https://open.larksuite.com/open-apis';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly axios: AxiosInstance;

  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000
    });
  }

  /**
   * Get tenant access token
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    // Return cached token if still valid
    if (this.accessToken !== null && this.tokenExpiry > now) {
      return this.accessToken;
    }

    // Request new token
    const response = await this.axios.post<LarkAccessTokenResponse>(
      '/auth/v3/tenant_access_token/internal',
      {
        app_id: this.appId,
        app_secret: this.appSecret
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`Failed to get access token: ${response.data.msg}`);
    }

    this.accessToken = response.data.tenant_access_token;
    this.tokenExpiry = now + response.data.expire * 1000 - 60000; // Refresh 1 minute before expiry

    return this.accessToken;
  }

  /**
   * Upload image to Lark Drive
   * @param imagePath - Path to the image file
   * @returns File token
   */
  async uploadImage(imagePath: string): Promise<string> {
    const token = await this.getAccessToken();

    // Read image file
    const imageBuffer = await readFile(imagePath);

    // Create form data
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: imagePath.split('/').pop() ?? 'image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('file_name', imagePath.split('/').pop() ?? 'image.jpg');
    form.append('parent_type', 'bitable_image');
    form.append('parent_node', 'root');
    form.append('size', imageBuffer.length.toString());

    // Upload
    const response = await this.axios.post<LarkDriveUploadResponse>(
      '/drive/v1/medias/upload_all',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`Failed to upload image: ${response.data.msg}`);
    }

    return response.data.data.file_token;
  }

  /**
   * Add record to Lark Base
   * @param baseId - Base ID
   * @param tableId - Table ID
   * @param record - Record data
   * @returns Record ID
   */
  async addRecord(
    baseId: string,
    tableId: string,
    record: LarkBaseRecord
  ): Promise<string> {
    const token = await this.getAccessToken();

    const response = await this.axios.post<LarkBaseAddRecordResponse>(
      `/bitable/v1/apps/${baseId}/tables/${tableId}/records`,
      record,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`Failed to add record: ${response.data.msg}`);
    }

    return response.data.data.record.record_id;
  }
}
