import type { NextConfig } from "next";

const rootDomain = process.env.VERCEL_ENV ? `${process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'localhost';

const nextConfig: NextConfig = {
  cacheComponents: false,
};

export default nextConfig;
