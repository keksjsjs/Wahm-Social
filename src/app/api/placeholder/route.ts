/** Deterministic SVG placeholder art for demo data and empty states. */
export const dynamic = "force-static";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const seed = sp.get("seed") ?? "wahm";
  const w = Math.min(2000, Number(sp.get("w") ?? 600));
  const h = Math.min(2000, Number(sp.get("h") ?? 800));
  const n = hash(seed);
  const hue = n % 360;
  const hue2 = (hue + 40) % 360;
  const letter = (seed.replace(/^(avatar|story)-/, "")[0] ?? "W").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,18%)"/><stop offset="1" stop-color="hsl(${hue2},55%,8%)"/></linearGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9b"/><stop offset=".5" stop-color="#d4a944"/><stop offset="1" stop-color="#8f6a1f"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${(n % 70) + 15}%" cy="${(n % 50) + 20}%" r="${Math.min(w, h) / 3}" fill="hsl(${hue},60%,40%)" opacity=".18"/>
<text x="50%" y="54%" font-family="Georgia,serif" font-size="${Math.min(w, h) / 3}" fill="url(#gold)" text-anchor="middle" dominant-baseline="middle">${letter.replace(/[<>&"]/g, "")}</text>
</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=31536000, immutable" } });
}
