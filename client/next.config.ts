import type { NextConfig } from "next";

const isProductionBuild = process.env.NODE_ENV === "production";

// Rewrites are resolved at build time, so a missing API_URL would silently ship
// a deployment that proxies to localhost. Fail the build instead.
if (isProductionBuild && !process.env.API_URL) {
    throw new Error(
        "API_URL is not set. Point it at the deployed Express API (e.g. https://api.example.com) before building.",
    );
}

const apiUrl = (process.env.API_URL ?? "http://localhost:4040").replace(/\/$/, "");

const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    ...(isProductionBuild
        ? [
              {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
              },
          ]
        : []),
];

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
    // The browser only ever talks to this origin; auth cookies stay first-party
    // and the Express API needs no public CORS exposure for the app itself.
    async rewrites() {
        return [
            {
                source: "/api/auth/:path*",
                destination: `${apiUrl}/api/auth/:path*`,
            },
            {
                source: "/api/workspaces/:path*",
                destination: `${apiUrl}/api/workspaces/:path*`,
            },
            {
                source: "/api/workspaces",
                destination: `${apiUrl}/api/workspaces`,
            },
            {
                source: "/api/memory/:path*",
                destination: `${apiUrl}/api/memory/:path*`,
            },
            {
                source: "/api/memory",
                destination: `${apiUrl}/api/memory`,
            },
        ];
    },
};

export default nextConfig;
