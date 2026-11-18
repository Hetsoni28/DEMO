import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeCrew",
    short_name: "HomeCrew",
    description: "Book verified home-service professionals with genuine availability and secure payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#eeebda",
    theme_color: "#282b4a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "My bookings", url: "/customer/bookings" },
      { name: "Book a service", url: "/services" },
      { name: "Pro · Today", url: "/professional/dashboard" },
    ],
  };
}
