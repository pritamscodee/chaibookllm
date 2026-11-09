import { task } from "@trigger.dev/sdk";

import { processArtifactById } from "../services/artifact.services.js";

export const generateArtifact = task({
    id: "generate-artifact",
    retry: { maxAttempts: 2 },
    run: async (payload: { artifactId: string; workspaceId: string }) => {
        const { artifactId } = payload;

        await processArtifactById(artifactId);

        return { artifactId, status: "READY" };
    },
});
