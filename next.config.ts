import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Destination for the service worker
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  workboxOptions: {
    disableDevLogs: true,
    // Handle navigation fallback for PWA standalone mode
    // This ensures internal routes work when offline or in installed app mode
    navigateFallback: "/",
    navigateFallbackDenylist: [/^\/api\//],
    // Runtime caching for API responses
    runtimeCaching: [
      {
        // Cache products API for offline access
        urlPattern: /.*\/api\/products.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-products-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // Cache transactions list (read-only)
        urlPattern: /.*\/api\/transactions(?!\/(create|$)).*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-transactions-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
        },
      },
      {
        // Auth endpoints - always network only for security
        urlPattern: /.*\/api\/auth.*/,
        handler: "NetworkOnly",
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
};

export default withPWA(nextConfig);
