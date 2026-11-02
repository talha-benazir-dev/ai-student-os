import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
