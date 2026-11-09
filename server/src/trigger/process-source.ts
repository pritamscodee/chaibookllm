import { task } from "@trigger.dev/sdk";

import { findChunksBySourceId } from "../repository/source-chunk.repository.js";
import { findSourceById } from "../repository/source.repository.js";
import {
    chunkSourceContent,
    embedAndIndexSource,
    extractSourceContent,
    markSourceFailed,
    markSourceProcessing,
} from "../services/source-processing.services.js";

export const processSource = task({
    id: "process-source",
    retry: { maxAttempts: 3 },
    run: async (payload: { sourceId: string; workspaceId: string }) => {
        const { sourceId } = payload;

        await markSourceProcessing(sourceId);

        try {
            const extracted = await extractSourceContent(sourceId);

            await chunkSourceContent(sourceId, extracted.text, extracted.pages);

            const source = await findSourceById(sourceId);
            if (!source) {
                throw new Error("Source not found");
            }

            const chunks = await findChunksBySourceId(sourceId);
            await embedAndIndexSource(source, chunks);

            return { sourceId, status: "READY", chunkCount: chunks.length };
        } catch (error) {
            const source = await findSourceById(sourceId);
            if (source) {
                await markSourceFailed(sourceId, error, source.metadata);
            }
            throw error;
        }
    },
});
