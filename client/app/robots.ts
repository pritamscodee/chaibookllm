import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Signed-in areas and API routes have nothing to index.
            disallow: ["/api/", "/dashboard", "/workspace/", "/settings/"],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    };
}
