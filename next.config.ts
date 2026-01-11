import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@google/genai'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jnfxijwavgplafrikeud.supabase.co',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
