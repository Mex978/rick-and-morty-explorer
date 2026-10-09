import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  // Avatars are small JPEGs already served by the upstream's CDN. Optimizing them would funnel every user's
  // image traffic through this server's single IP, which the upstream rate-limits, and buys nothing on a 300px thumbnail.
  images: {
    unoptimized: true,
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
