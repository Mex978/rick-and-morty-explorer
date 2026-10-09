import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'rickandmortyapi.com' }],
  },
  logging: {
    fetches: { fullUrl: true },
  },
};

export default withNextIntl(config);
