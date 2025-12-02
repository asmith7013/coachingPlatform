import {withSentryConfig} from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false // Enable this to see if it builds with errors ignored
  },
  images: {
    domains: [
      'images.unsplash.com',
      'tailwindcss.com',
      // Add Clerk image domains
      'img.clerk.com',
      'images.clerk.dev',
      'images.clerk.com'
    ],
  },
  async redirects() {
    return [
      // Redirect all /roadmaps/* paths to /scm/roadmaps/*
      {
        source: '/roadmaps/:path*',
        destination: '/scm/roadmaps/:path*',
        permanent: true,
      },
      // Redirect all /incentives/* paths to /scm/incentives/*
      {
        source: '/incentives/:path*',
        destination: '/scm/incentives/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    // Optimize server memory usage
    serverMinification: true,
  },
  webpack: (config, { isServer }) => {
    // Optimize for memory usage during build
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate spectacle into its own chunk
            spectacle: {
              test: /[\\/]node_modules[\\/](spectacle|react-syntax-highlighter)[\\/]/,
              name: 'spectacle-vendor',
              priority: 10,
            },
            // Separate lucide-react icons
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'icons-vendor',
              priority: 9,
            },
          },
        },
      };
    }
    return config;
  },
};

// Only enable Sentry source maps in production builds (not during development/CI builds)
// This prevents OOM errors during Vercel builds while keeping Sentry error tracking active
const sentryWebpackPluginOptions = {
  org: "alex-smith-coaching",
  project: "javascript-nextjs",

  // Completely disable source map upload during builds
  silent: true,

  // Disable all webpack plugins during build to save memory
  disableServerWebpackPlugin: true,
  disableClientWebpackPlugin: true,

  // Keep runtime features enabled
  automaticVercelMonitors: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
};

// Conditionally apply Sentry config only if explicitly enabled
// Sentry runtime will still work, just no source maps uploaded during build
export default process.env.SENTRY_UPLOAD_SOURCEMAPS === 'true'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;