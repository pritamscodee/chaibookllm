import { ArtifactDetail } from "@/features/learn";

type ArtifactPageProps = {
    params: Promise<{ id: string; artifactId: string }>;
};

export default async function ArtifactPage({ params }: ArtifactPageProps) {
    const { id, artifactId } = await params;
    return <ArtifactDetail workspaceId={id} artifactId={artifactId} />;
}
