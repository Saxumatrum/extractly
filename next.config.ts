import type { NextConfig } from "next";
import path from "node:path";
import { BASE_PATH } from "./src/lib/basePath";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  // Pin the workspace root to this project, since a stray lockfile in a
  // parent directory would otherwise make Next.js guess (and warn).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
