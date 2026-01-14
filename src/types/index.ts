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
 */
export interface LarkBaseRecord {
  fields: {
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
    image: Array<{
      file_token: string;
    }>;
    scanDate: number; // Unix timestamp in milliseconds
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
