import type { NextConfig } from "next";

const appUrl = process.env.APP_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: appUrl ? [new URL(appUrl).hostname] : [],
};

export default nextConfig;
