import { Suspense } from "react";
import { WorkspaceChat } from "@/features/chat";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";

type WorkspacePageProps = {
    params: Promise<{ id: string }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const { id } = await params;
    // Deduped with the layout's fetch via React cache().
    const workspace = await getWorkspaceOrNull(id);

    return (
        <Suspense fallback={null}>
            <WorkspaceChat
                workspaceId={id}
                workspaceTitle={workspace?.title}
                defaultModel={workspace?.defaultModel}
            />
        </Suspense>
    );
}
