import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Root must be the monorepo root (not this app's own dir) so Turbopack can
  // resolve the hoisted node_modules and the packages/db + packages/shared
  // source that live outside apps/admin.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  // @rs/db and @rs/shared are plain TS source (no build step) - Next needs
  // to transpile them itself rather than treat them as pre-built packages.
  transpilePackages: ["@rs/db", "@rs/shared"],
};

export default nextConfig;
