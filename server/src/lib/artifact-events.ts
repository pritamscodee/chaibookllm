import { tasks } from "@trigger.dev/sdk";

import type { generateArtifact } from "../trigger/generate-artifact.js";

export async function enqueueArtifactGeneration(input: {
    artifactId: string;
    workspaceId: string;
}) {
    await tasks.trigger<typeof generateArtifact>("generate-artifact", input);
}
