import { gitConfigured } from "./gitAuth";
import { gitStore } from "./git";
import { localStore } from "./local";
import type { DataStore } from "./types";

const g = globalThis as unknown as { __frostlyStore?: { key: string; store: DataStore } };

/** Pick the durable git store when configured, else local files (dev). One instance per process. */
export function dataStore(): DataStore {
  const key = gitConfigured() ? `git:${process.env.ADMIN_DATA_REPO}` : "local";
  if (g.__frostlyStore?.key !== key) g.__frostlyStore = { key, store: key === "local" ? localStore() : gitStore() };
  return g.__frostlyStore.store;
}

export * from "./types";
