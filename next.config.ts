import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "googleapis",
    "google-auth-library",
    "gaxios",
    "googleapis-common",
    "https-proxy-agent",
    "http-proxy-agent",
    "agent-base",
    "gcp-metadata",
  ],
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      const empty = false as const;
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        [path.resolve(__dirname, "src/instrumentation.node.ts")]: empty,
        [path.resolve(__dirname, "src/lib/worker.ts")]: empty,
        [path.resolve(__dirname, "src/lib/google.ts")]: empty,
      };
    }
    return config;
  },
};

export default nextConfig;
