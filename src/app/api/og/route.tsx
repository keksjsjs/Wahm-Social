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
  const title = (sp.get("title") ?? "Wahm Social").slice(0, 80);
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
          background: "linear-gradient(135deg,#050a18 0%,#0f1a38 60%,#16244a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: "linear-gradient(135deg,#f3dc9b,#d4a944,#8f6a1f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              color: "#050a18",
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div style={{ fontSize: 40, color: "#e9c76b", fontWeight: 700 }}>Wahm Social</div>
        </div>
        {u ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
            <div style={{ fontSize: 72, fontWeight: 800 }}>{name || "@" + u}</div>
            <div style={{ fontSize: 40, color: "#9fb0d8", marginTop: 10 }}>
              @{u} · {p}
            </div>
            <div style={{ fontSize: 56, color: "#e9c76b", marginTop: 40, fontWeight: 700 }}>{compact(f)} followers</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
            <div style={{ fontSize: 34, color: "#9fb0d8", marginTop: 24 }}>TikTok & Instagram viewer · downloader · analytics</div>
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
