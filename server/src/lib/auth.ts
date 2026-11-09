import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

// CLIENT_URL may be a comma-separated list (e.g. prod + preview domains).
const trustedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

export const auth = betterAuth({
    // The client proxies /api/auth/* to this server (Next.js rewrites), so in
    // production this must be the client's public URL, e.g. https://app.example.com
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
