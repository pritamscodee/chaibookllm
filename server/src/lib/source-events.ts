import { tasks } from "@trigger.dev/sdk";

import type { processSource } from "../trigger/process-source.js";

export async function enqueueSourceProcessing(input: {
    sourceId: string;
    workspaceId: string;
}) {
    await tasks.trigger<typeof processSource>("process-source", input);
}
