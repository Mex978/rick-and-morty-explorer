import type { NextConfig } from 'next';
const config: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'rickandmortyapi.com' }],
  },
};

export default config;
