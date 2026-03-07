/** @type {import('next').NextConfig} */

// Content Security Policy
// Allows what the app actually needs while blocking injection attacks.
const CSP = [
  "default-src 'self'",
  // Next.js inline scripts + hydration
  "script-src 'self' 'unsafe-inline'",
  // Inline styles (used throughout) + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Font files from Google
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs, blob (canvas exports), Vercel Blob, localhost dev
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com http://localhost:*",
  // Fetch calls: Google Translate proxy + Upstash (from lib code on client)
  "connect-src 'self' https://translate.googleapis.com https://*.upstash.io",
  // YouTube no-cookie embeds only
  "frame-src https://www.youtube-nocookie.com",
  // Completely block plugins (Flash, etc.)
  "object-src 'none'",
  // Prevent clickjacking via iframes
  "frame-ancestors 'none'",
  // Only allow form submissions to our own domain
  "form-action 'self'",
  // Prevent base-tag injection
  "base-uri 'self'",
  // Block mixed content on HTTPS
  "upgrade-insecure-requests",
].join('; ');

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy',           value: CSP },
          { key: 'X-Content-Type-Options',            value: 'nosniff' },
          { key: 'X-Frame-Options',                   value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',                  value: '1; mode=block' },
          { key: 'Referrer-Policy',                   value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',                value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // HSTS — tells browsers to ALWAYS use HTTPS (only active on production HTTPS)
          { key: 'Strict-Transport-Security',         value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // Cache-control for static assets
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Uploaded images served from /uploads
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
