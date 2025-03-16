import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Disable eslint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Disable type checking during builds
  },
};

export default nextConfig;
