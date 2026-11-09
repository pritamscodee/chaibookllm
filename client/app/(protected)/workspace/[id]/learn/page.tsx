import { LearnHub } from "@/features/learn";

type LearnPageProps = {
    params: Promise<{ id: string }>;
};

export default async function LearnPage({ params }: LearnPageProps) {
    const { id } = await params;
    return <LearnHub workspaceId={id} />;
}
