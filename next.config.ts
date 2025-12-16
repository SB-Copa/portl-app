import type { NextConfig } from "next";

const rootDomain = process.env.VERCEL_ENV ? `${process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'localhost';

const nextConfig: NextConfig = {
  // rewrites: async () => ({
  //   beforeFiles: [
  //     {
  //       source: '/:path((?!_next|_static|_vercel|_.well-known|.*\\.\\w+$).*)*',
  //       has: [
  //         {
  //           type: 'host',
  //           value: `(?<subdomain>.*).${rootDomain}`
  //         }
  //       ],
  //       destination: '/:subdomain/:path*',
  //     }
  //   ]
  // })
};

export default nextConfig;
