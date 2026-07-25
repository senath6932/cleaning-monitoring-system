import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds from deleting files used by the running dev server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  experimental: {
    // Keep Turbopack from exhausting Windows' paging file with worker processes.
    cpus: 2,
    turbopackPluginRuntimeStrategy: "workerThreads",
    // Avoid reusing a cache after resource-exhaustion crashes.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
