import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers untuk keamanan + CSP untuk Midtrans
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://apis.google.com https://accounts.google.com",
              "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://vtweb.midtrans.com https://ventora-coffe.firebaseapp.com https://securetoken.googleapis.com",
              "frame-ancestors 'self' https://ventora-coffe.firebaseapp.com",
              "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://accounts.google.com https://apis.google.com",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
