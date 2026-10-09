import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  // Avatars come straight from the upstream CDN; proxying them through one server IP trips its rate limit.
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: { fullUrl: true },
  },
  // Visited pages stay in the client router cache, so going back is instant; the content never changes.
  experimental: {
    staleTimes: { dynamic: 60 },
  },
};

export default withNextIntl(config);
