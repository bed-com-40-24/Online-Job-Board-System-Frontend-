import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', '192.168.168.1'],
  experimental: {
    serverActions: {
      // Allow a 5 MB document plus the registration fields and multipart overhead.
      bodySizeLimit: '6mb',
    },
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
