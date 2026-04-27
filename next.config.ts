import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/**/*'],
  },
};

export default nextConfig;
