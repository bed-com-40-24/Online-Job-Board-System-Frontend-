import type { NextConfig } from "next";

const appUrl = process.env.APP_URL;

const allowedDevOrigins = ['192.168.56.1', 'localhost', '127.0.0.1'];

if (appUrl) {
  allowedDevOrigins.push(new URL(appUrl).hostname);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [...new Set(allowedDevOrigins)],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
