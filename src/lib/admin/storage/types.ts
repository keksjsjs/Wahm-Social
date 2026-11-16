export interface StoreStatus {
  kind: "git" | "local";
  ok: boolean;
  detail: string;
  lastSyncAt: number;
  lastError: string;
}

export interface DataStore {
  kind: "git" | "local";
  /** Pull the latest copy and return file contents (null when the file is absent). */
  readAll(): Promise<{ settings: string | null; secrets: string | null }>;
  readAsset(name: string): Promise<Buffer | null>;
  /** Write (or delete with null) files and persist them durably. */
  write(files: Record<string, Buffer | string | null>, message: string): Promise<void>;
  status(): StoreStatus;
}

export const SETTINGS_FILE = "settings.json";
export const SECRETS_FILE = "secrets.enc.json";
export const ASSET_DIR = "assets";
