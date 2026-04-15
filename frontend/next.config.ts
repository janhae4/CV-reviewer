import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Ensure we don't have experimental turbo issues with directory names
  experimental: {
    // Explicitly disable turbo build if needed, or fix root
  }
};

export default nextConfig;
