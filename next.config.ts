import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project, since a stray lockfile in a
  // parent directory would otherwise make Next.js guess (and warn).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
