import "server-only";
import { createHash } from "node:crypto";

export const ASSET_KINDS = ["favicon", "ogImage", "heroImage"] as const;
const MAX_BYTES = 1_500_000;

/** Sniff the real type from magic bytes (never trust the browser's mime). */
function sniff(b: Buffer): string | null {
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (b.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]))) return "ico";
  if (b.subarray(0, 6).toString("ascii") === "GIF89a" || b.subarray(0, 6).toString("ascii") === "GIF87a") return "gif";
  const head = b.subarray(0, 512).toString("utf8").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return "svg";
  return null;
}

export async function prepareAsset(kind: string, file: File): Promise<{ name: string; body: Buffer }> {
  if (file.size > MAX_BYTES) throw new Error("الصورة أكبر من 1.5MB");
  const body = Buffer.from(await file.arrayBuffer());
  const ext = sniff(body);
  if (!ext) throw new Error("صيغة غير مدعومة (PNG / JPG / WEBP / ICO / GIF / SVG)");
  if (ext === "svg" && /<script|on\w+\s*=|javascript:|<foreignObject/i.test(body.toString("utf8"))) throw new Error("ملف SVG فيه سكربت — مرفوض");
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 10);
  return { name: `${kind.toLowerCase()}-${hash}.${ext}`, body };
}

export const ASSET_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  ico: "image/x-icon",
  gif: "image/gif",
  svg: "image/svg+xml",
};
