import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { extractPdfFromBuffer } from "../lib/pdf.js";
import { enqueueSourceProcessing } from "../lib/source-events.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import {
    createSourceRecord,
    deleteSourceRecord,
    findSourceByIdAndWorkspaceId,
    findSourcesByWorkspaceId,
    updateSourceRecord,
    type SourceRecord,
} from "../repository/source.repository.js";
import type { Prisma } from "../generated/prisma/client.js";
import { NotFoundError } from "../types/app-error.js";
import type {
    CreateSourceInput,
    ImportWebSearchInput,
    ImportWebsiteInput,
    ImportYoutubeInput,
    ListSourcesQuery,
} from "../validators/source.validator.js";
import { listChunksForSource } from "./source-processing.services.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";

async function assertWorkspaceAccess(workspaceId: string, userId: string) {
    await getWorkspaceByIdForUser(workspaceId, userId);
}

async function createAndProcessSource(
    data: Parameters<typeof createSourceRecord>[0],
) {
    const source = await createSourceRecord(data); //

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId,
    });

    return source;
}


export async function listSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
) {
    await assertWorkspaceAccess(workspaceId, userId);
    return findSourcesByWorkspaceId(workspaceId, filters);
}

export async function getSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
): Promise<SourceRecord> {
    await assertWorkspaceAccess(workspaceId, userId);

    const source = await findSourceByIdAndWorkspaceId(sourceId, workspaceId);

    if (!source) {
        throw new NotFoundError("Source not found");
    }

    return source;
}

export async function deleteSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    await getSourceForWorkspace(workspaceId, sourceId, userId);
    await deleteSourceRecord(sourceId);
}

export async function bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
) {
    await assertWorkspaceAccess(workspaceId, userId);

    for (const sourceId of sourceIds) {
        await deleteSourceForWorkspace(workspaceId, sourceId, userId);
    }
}

export async function createTextOrMarkdownSource(
    workspaceId: string,
    userId: string,
    input: CreateSourceInput,
) {
    await assertWorkspaceAccess(workspaceId, userId);

    return createAndProcessSource({
        workspaceId,
        type: input.type,
        title: input.title,
        content: input.content,
        status: "PENDING",
    });
}

export async function importWebSearchResultSource(
    workspaceId: string,
    userId: string,
    input: ImportWebSearchInput,
) {
    await assertWorkspaceAccess(workspaceId, userId);

    return createAndProcessSource({
        workspaceId,
        type: "WEBSITE",
        title: input.title,
        content: input.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            importedFrom: input.url,
        },
    });
}

export async function getSourceChunksForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    await getSourceForWorkspace(workspaceId, sourceId, userId);
    return listChunksForSource(sourceId);
}

async function requeueSource(source: SourceRecord) {
    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? { ...(source.metadata as Record<string, unknown>) }
            : {};
    delete metadata.processingError;

    await updateSourceRecord(source.id, {
        status: "PENDING",
        metadata: metadata as Prisma.InputJsonValue,
    });

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId,
    });
}

export async function reprocessSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    const source = await getSourceForWorkspace(workspaceId, sourceId, userId);
    await requeueSource(source);
    return { reprocessed: true };
}

/**
 * Re-queues the given sources, or every FAILED source in the workspace when
 * no ids are provided.
 */
export async function reprocessSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds?: string[],
) {
    await assertWorkspaceAccess(workspaceId, userId);

    const sources = sourceIds?.length
        ? await Promise.all(
              sourceIds.map((sourceId) =>
                  getSourceForWorkspace(workspaceId, sourceId, userId),
              ),
          )
        : await findSourcesByWorkspaceId(workspaceId, { status: "FAILED" });

    for (const source of sources) {
        await requeueSource(source);
    }

    return { reprocessed: sources.length };
}


export async function importWebsiteSource(
    workspaceId: string,
    userId: string,
    input: ImportWebsiteInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const scraped = await scrapeWebsite(input.url);

    return createAndProcessSource({
        workspaceId,
        type: "WEBSITE",
        title: input.title || scraped.title || input.url,
        content: scraped.markdown,
        url: scraped.sourceUrl,
        status: "PENDING",
        metadata: {
            importedFrom: scraped.sourceUrl,
        },
    });
}

export async function uploadPdfSource(
    workspaceId: string,
    userId: string,
    file: Express.Multer.File,
    title?: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const upload = await uploadPdfToCloudinary(
        file.buffer,
        file.originalname,
    );

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
        const extracted = await extractPdfFromBuffer(file.buffer);
        content = extracted.text;
        pageCount = extracted.pageCount;
    } catch {
        // Trigger.dev will retry extraction from Cloudinary if upload-time parse fails.
    }

    return createAndProcessSource({
        workspaceId,
        type: "PDF",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content,
        status: "PENDING",
        metadata: {
            fileUrl: upload.secureUrl,
            fileName: upload.originalFilename,
            fileSize: upload.bytes,
            publicId: upload.publicId,
            resourceType: upload.resourceType,
            pageCount,
        },
    });
}


export async function importYoutubeSource(
    workspaceId: string,
    userId: string,
    input: ImportYoutubeInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const transcript = await fetchYoutubeTranscript(input.url);

    return createAndProcessSource({
        workspaceId,
        type: "YOUTUBE",
        title: input.title || `YouTube: ${transcript.videoId}`,
        content: transcript.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            videoId: transcript.videoId,
        },
    });
}