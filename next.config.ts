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

export default withSentryConfig(
  nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "alex-smith-coaching",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Disable source map uploads to reduce memory usage during build
    // This prevents OOM errors on Vercel
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    // Disabled to improve build performance - can be re-enabled if needed for debugging
    widenClientFileUpload: false,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
    enabled: true,
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
});