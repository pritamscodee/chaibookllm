import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
    project: "proj_xymhqzrllybmixxjasda",
    dirs: ["./src/trigger"],
    maxDuration: 600,
    retries: {
        enabledInDev: true,
    },
    build: {
        extensions: [prismaExtension({ mode: "modern" })],
    },
});
