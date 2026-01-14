/**
 * ScanSnap CSV record structure
 * Exported from ScanSnap Home in Shift-JIS encoding
 */
export interface ScanSnapRecord {
  name: string;
  company: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  postalCode: string;
  address: string;
  url: string;
  notes: string;
  imagePath: string;
  scanDate: string;
}

/**
 * Lark Base record structure
 * Uses Japanese field names as defined in the Lark Base table
 * Phone fields are optional as Lark phone fields don't accept empty strings
 */
export interface LarkBaseRecord {
  fields: {
    '氏名': string;
    '会社名': string;
    '部署': string;
    '役職': string;
    '電子メール': string;
    '電話番号'?: string;
    '携帯番号'?: string;
    'FAX番号'?: string;
    '郵便番号': string;
    '住所': string;
    'URL': string;
    'メモ': string;
    '名刺日付': number; // Unix timestamp in milliseconds
  };
}

/**
 * Lark Drive API - Upload image response
 */
export interface LarkDriveUploadResponse {
  code: number;
  msg: string;
  data: {
    file_token: string;
  };
}

/**
 * Lark Base API - Add record response
 */
export interface LarkBaseAddRecordResponse {
  code: number;
  msg: string;
  data: {
    record: {
      record_id: string;
      fields: Record<string, unknown>;
    };
  };
}

/**
 * Lark API - Access token response
 */
export interface LarkAccessTokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

/**
 * Configuration for the sync tool
 */
export interface SyncConfig {
  larkAppId: string;
  larkAppSecret: string;
  larkBaseId: string;
  larkTableId: string;
  csvPath: string;
  imageDir: string;
}
