import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
      {
        protocol: "http",
        hostname: "**", 
      },
    ],
  },
  basePath: '',
  assetPrefix: '',
  reactStrictMode: true,
  telemetry: false,
};

export default nextConfig;

