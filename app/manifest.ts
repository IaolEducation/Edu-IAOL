import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eduiaol – JEE, NEET & Career Guidance",
    short_name: "Eduiaol",
    description: "Eduiaol – Affiliated with IAOL Education. Counselling thousands of JEE, NEET & other stream students. Kargil, Ladakh.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/nith.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/nith.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/nith.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "productivity"],
  }
}
