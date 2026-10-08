import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["snowplow-morality-rise.ngrok-free.dev"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" }, // allow WP media/CDN
    ],
  },
};

export default nextConfig;
