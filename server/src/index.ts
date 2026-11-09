import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import prisma from "./lib/db.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT ?? 4040);

// CLIENT_URL may be a comma-separated list (e.g. prod + preview domains).
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

const REQUIRED_ENV = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "CLIENT_URL",
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_INDEX",
    "TRIGGER_SECRET_KEY",
];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missingEnv.length) {
    if (isProduction) {
        console.error(`[env] Missing required variables: ${missingEnv.join(", ")}`);
        process.exit(1);
    }
    console.warn(
        `[env] Missing: ${missingEnv.join(", ")} — related API routes will fail.`,
    );
}

const app = express();

// Behind a load balancer / reverse proxy (Render, Railway, Fly, etc.) so that
// req.protocol and secure cookies work correctly.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));

// Chat requests carry the full message history, so allow larger bodies.
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
    res.json({ name: "chaibookllm-server", status: "ok" });
});

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok", db: "ok" });
    } catch {
        res.status(503).json({ status: "degraded", db: "unreachable" });
    }
});

registerRoutes(app);

app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV ?? "development"})`);
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
        try {
            await prisma.$disconnect();
        } finally {
            process.exit(0);
        }
    });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException");
});
