import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    // Shares the cached fetch with the layout below.
    const workspace = await getWorkspaceOrNull(id);
    return { title: workspace?.title ?? "Workspace" };
}

// The shell (sidebar, header, source list) lives in the layout so it stays
// mounted while switching between Chat / Learn / Sources / Settings. Only the
// page segment re-renders on navigation.
export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    await requireAuth();
    const { id } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>;
}
