import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() { return [{ source: "/subscribe", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] }]; },
  outputFileTracingIncludes: { "/*": ["./public/lighthouse-score.json"] },
  allowedDevOrigins: ["snowplow-morality-rise.ngrok-free.dev"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" }, // allow WP media/CDN
    ],
  },
};

export default nextConfig;
