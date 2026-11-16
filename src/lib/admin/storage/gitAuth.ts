import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/** GitHub's published SSH host key (https://api.github.com/meta) — pinned, no TOFU. */
const KNOWN_HOSTS = [
  "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl",
  "[ssh.github.com]:443 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl",
].join("\n");

export const dataRepo = () => (process.env.ADMIN_DATA_REPO || "").replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
export const gitConfigured = () => Boolean(dataRepo() && (process.env.ADMIN_DATA_SSH_KEY || process.env.ADMIN_GITHUB_TOKEN));

const secretDir = path.join(os.tmpdir(), "frostly-git-auth");

/** Remote URL candidates + environment for git. The deploy key is written to a 0600 temp file. */
export async function gitAuth(): Promise<{ urls: string[]; env: NodeJS.ProcessEnv }> {
  const repo = dataRepo();
  const base: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "echo" };
  const sshKey = process.env.ADMIN_DATA_SSH_KEY;
  if (sshKey) {
    await fs.mkdir(secretDir, { recursive: true, mode: 0o700 });
    const keyPath = path.join(secretDir, "id");
    const khPath = path.join(secretDir, "known_hosts");
    const pem = sshKey.includes("BEGIN") ? sshKey : Buffer.from(sshKey, "base64").toString("utf8");
    await fs.writeFile(keyPath, pem.endsWith("\n") ? pem : pem + "\n", { mode: 0o600 });
    await fs.writeFile(khPath, KNOWN_HOSTS + "\n", { mode: 0o600 });
    base.GIT_SSH_COMMAND = `ssh -i ${keyPath} -o IdentitiesOnly=yes -o UserKnownHostsFile=${khPath} -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -o BatchMode=yes`;
    return { urls: [`git@github.com:${repo}.git`, `ssh://git@ssh.github.com:443/${repo}.git`], env: base };
  }
  const token = process.env.ADMIN_GITHUB_TOKEN || "";
  return { urls: [`https://x-access-token:${token}@github.com/${repo}.git`], env: base };
}
