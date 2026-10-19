import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* standard serverless production config for Vercel */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
