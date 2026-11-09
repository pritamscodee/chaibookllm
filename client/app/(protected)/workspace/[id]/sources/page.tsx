import { SourceLibrary } from "@/features/sources";

type WorkspaceSourcesPageProps = {
    params: Promise<{ id: string }>;
};

export default async function WorkspaceSourcesPage({
    params,
}: WorkspaceSourcesPageProps) {
    const { id } = await params;
    return <SourceLibrary workspaceId={id} />;
}
