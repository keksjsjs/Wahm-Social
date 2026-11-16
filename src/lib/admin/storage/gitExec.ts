import { execFile } from "node:child_process";

/** Run git with a scrubbed error message (never leaks tokens or key paths into logs/UI). */
export function git(args: string[], opts: { cwd?: string; env: NodeJS.ProcessEnv; timeoutMs?: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd: opts.cwd, env: opts.env, timeout: opts.timeoutMs ?? 30_000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(scrub(`${stderr || ""} ${err.message}`).slice(0, 400)));
      else resolve(String(stdout));
    });
  });
}

export function scrub(s: string): string {
  return s
    .replace(/https:\/\/[^@\s]+@/g, "https://***@")
    .replace(/(gh[pousr]_|github_pat_)[A-Za-z0-9_]+/g, "***")
    .replace(/-i\s+\S+/g, "-i ***");
}
