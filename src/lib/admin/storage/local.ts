import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "../../env";
import { ASSET_DIR, SECRETS_FILE, SETTINGS_FILE, type DataStore, type StoreStatus } from "./types";

/** Fallback for local dev: files under DATA_DIR/site (ephemeral on Render free — not used there when git is configured). */
export function localStore(): DataStore {
  const root = path.resolve(env.dataDir, "site");
  const st: StoreStatus = { kind: "local", ok: true, detail: `ملفات محلية (${root}) — تنحذف مع إعادة النشر`, lastSyncAt: 0, lastError: "" };
  const readOpt = (f: string) => fs.readFile(path.join(root, f), "utf8").catch(() => null);
  return {
    kind: "local",
    async readAll() {
      st.lastSyncAt = Date.now();
      return { settings: await readOpt(SETTINGS_FILE), secrets: await readOpt(SECRETS_FILE) };
    },
    async readAsset(name) {
      return fs.readFile(path.join(root, ASSET_DIR, path.basename(name))).catch(() => null);
    },
    async write(files) {
      for (const [rel, body] of Object.entries(files)) {
        const p = path.join(root, rel);
        if (body === null) await fs.rm(p, { force: true });
        else {
          await fs.mkdir(path.dirname(p), { recursive: true });
          await fs.writeFile(p, body);
        }
      }
    },
    status: () => st,
  };
}
