import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PipePilot",
    short_name: "PipePilot",
    description: "Book verified home-service professionals with genuine availability and secure payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#eeebda",
    theme_color: "#282b4a",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
