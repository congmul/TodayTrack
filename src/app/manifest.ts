import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TodayTrack",
    short_name: "TodayTrack",
    description: "A mobile-first PWA for project-based daily task tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#f6f1e8",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
