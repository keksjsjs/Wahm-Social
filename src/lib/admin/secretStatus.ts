import "server-only";
import { SECRET_DEFS, type SecretDef } from "./secrets-def";
import { snapshot } from "../site/snapshot";
import { originalEnv } from "../site/apply";

/** Lengths only — values never leave the server. */
export function secretStatus(group: SecretDef["group"]) {
  const sec = snapshot().secrets;
  return SECRET_DEFS.filter((d) => d.group === group).map((def) => ({
    def,
    panel: (sec[def.key] || "").length,
    renderEnv: (originalEnv(def.env) || "").length,
  }));
}
