import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { git } from "./gitExec";
import { dataRepo, gitAuth } from "./gitAuth";
import { ASSET_DIR, SECRETS_FILE, SETTINGS_FILE, type DataStore, type StoreStatus } from "./types";

const DIR = path.join(os.tmpdir(), "frostly-data-repo");
const AUTHOR = ["-c", "user.name=frostly-admin", "-c", "user.email=admin@frostly.local"];

/**
 * Settings live in a private GitHub repo (ADMIN_DATA_REPO), synced with a shallow clone in /tmp.
 * Survives Render free-tier redeploys and restarts; pushes do not touch the app repo, so no redeploy.
 */
export function gitStore(): DataStore {
  const st: StoreStatus = { kind: "git", ok: false, detail: `GitHub: ${dataRepo()} (خاص)`, lastSyncAt: 0, lastError: "" };
  let url = "";
  let lock: Promise<unknown> = Promise.resolve();
  const serial = <T>(fn: () => Promise<T>): Promise<T> => {
    const p = lock.then(fn, fn);
    lock = p.catch(() => undefined);
    return p;
  };

  async function ensureClone() {
    const auth = await gitAuth();
    const exists = await fs.stat(path.join(DIR, ".git")).then(() => true, () => false);
    if (exists && url) return auth;
    await fs.rm(DIR, { recursive: true, force: true });
    let last: unknown;
    for (const u of auth.urls) {
      try {
        await git(["clone", "--depth", "1", "--branch", "main", u, DIR], { env: auth.env, timeoutMs: 25_000 });
        url = u;
        return auth;
      } catch (e) {
        last = e;
        await fs.rm(DIR, { recursive: true, force: true });
      }
    }
    throw last instanceof Error ? last : new Error("clone failed");
  }

  async function sync() {
    const auth = await ensureClone();
    await git(["fetch", "--depth", "1", "origin", "main"], { cwd: DIR, env: auth.env });
    await git(["reset", "--hard", "FETCH_HEAD"], { cwd: DIR, env: auth.env });
    st.ok = true;
    st.lastError = "";
    st.lastSyncAt = Date.now();
    return auth;
  }

  const readOpt = (f: string) => fs.readFile(path.join(DIR, f), "utf8").catch(() => null);

  return {
    kind: "git",
    readAll: () =>
      serial(async () => {
        try {
          await sync();
        } catch (e) {
          st.ok = false;
          st.lastError = (e as Error).message;
          throw e;
        }
        return { settings: await readOpt(SETTINGS_FILE), secrets: await readOpt(SECRETS_FILE) };
      }),
    async readAsset(name) {
      const p = path.join(DIR, ASSET_DIR, path.basename(name));
      const hit = await fs.readFile(p).catch(() => null);
      if (hit) return hit;
      await serial(sync).catch(() => undefined);
      return fs.readFile(p).catch(() => null);
    },
    write: (files, message) =>
      serial(async () => {
        for (let attempt = 0; attempt < 2; attempt++) {
          const auth = await sync();
          for (const [rel, body] of Object.entries(files)) {
            const p = path.join(DIR, rel);
            if (body === null) await fs.rm(p, { force: true });
            else {
              await fs.mkdir(path.dirname(p), { recursive: true });
              await fs.writeFile(p, body);
            }
          }
          await git(["add", "-A"], { cwd: DIR, env: auth.env });
          const dirty = (await git(["status", "--porcelain"], { cwd: DIR, env: auth.env })).trim();
          if (!dirty) return;
          await git([...AUTHOR, "commit", "-q", "-m", message], { cwd: DIR, env: auth.env });
          try {
            await git(["push", "-q", "origin", "HEAD:main"], { cwd: DIR, env: auth.env, timeoutMs: 30_000 });
            return;
          } catch (e) {
            st.lastError = (e as Error).message;
            if (attempt === 1) throw e;
          }
        }
      }),
    status: () => st,
  };
}
