import type { NextConfig } from "next";

const appUrl = process.env.APP_URL;

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.56.1'],
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: appUrl ? [new URL(appUrl).hostname] : [],
};

export default nextConfig;
