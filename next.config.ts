import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow ALL HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // allow ALL HTTP domains (optional)
      },
    ],
  },
};

export default nextConfig;
