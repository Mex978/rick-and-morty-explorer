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
  // Keeps visited pages in the client router cache for a minute, so going back to an episode is instant
  // instead of showing its loading state again. The content never changes, so a minute of staleness costs nothing.
  experimental: {
    staleTimes: { dynamic: 60 },
  },
};

export default withNextIntl(config);
