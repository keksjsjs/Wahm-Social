/** Dynamic Open Graph image (1200x630) for landing and profile pages. */
import { ImageResponse } from "next/og";

export const runtime = "edge";

function compact(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const u = sp.get("u");
  const p = sp.get("p") === "instagram" ? "Instagram" : "TikTok";
  const f = Number(sp.get("f") ?? 0);
  const name = (sp.get("n") ?? "").slice(0, 40);
  const title = (sp.get("title") ?? "Frostly — TikTok & Instagram Downloader").slice(0, 80);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg,#f6f8fc 0%,#e6edfb 55%,#e9e3fd 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: "linear-gradient(135deg,#7dc4ff,#6378f6,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              color: "#ffffff",
              fontWeight: 800,
            }}
          >
            ❄
          </div>
          <div style={{ fontSize: 44, color: "#4f5ae6", fontWeight: 800 }}>Frostly</div>
        </div>
        {u ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
            <div style={{ fontSize: 72, fontWeight: 800 }}>{name || "@" + u}</div>
            <div style={{ fontSize: 40, color: "#64748b", marginTop: 10 }}>
              @{u} · {p}
            </div>
            <div style={{ fontSize: 56, color: "#4f5ae6", marginTop: 40, fontWeight: 700 }}>{compact(f)} followers</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 34, color: "#64748b", marginTop: 24 }}>TikTok & Instagram Downloader · Viewer · Analytics</div>
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
