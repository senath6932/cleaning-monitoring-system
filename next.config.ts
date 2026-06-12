import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds from deleting files used by the running dev server.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
