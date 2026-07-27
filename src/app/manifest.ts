import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portfolio Tracker",
    short_name: "Portfolio",
    description:
      "Track stocks, ETFs, crypto and cash across currencies, with live prices and scenario projections.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0c0a",
    theme_color: "#0f0c0a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
