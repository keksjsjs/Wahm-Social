import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wahm Social — وهم سوشال",
    short_name: "Wahm",
    description: "TikTok & Instagram public profile viewer, downloader and analytics",
    start_url: "/",
    display: "standalone",
    background_color: "#050a18",
    theme_color: "#050a18",
    dir: "rtl",
    lang: "ar",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
