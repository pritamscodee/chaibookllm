import { FileText, Globe, Layers, PlayCircle, Sparkles } from "lucide-react";

const sources = [
    { icon: FileText, label: "Lecture 7 — Thermodynamics.pdf", active: true },
    { icon: PlayCircle, label: "Entropy, explained simply", active: false },
    { icon: Globe, label: "Notes on the Carnot cycle", active: false },
];

function Cite({ n }: { n: number }) {
    return (
        <span className="mx-0.5 inline-flex size-4 translate-y-[-1px] items-center justify-center rounded-sm bg-secondary align-middle font-mono text-[10px] font-medium text-secondary-foreground">
            {n}
        </span>
    );
}

/**
 * A static, decorative mock of the workspace: sources on the left, a cited
 * answer in the middle. Purely illustrative, so it's hidden from assistive tech.
 */
export function ProductPreview() {
    return (
        // Outer radius = inner radius (12px) + padding (8px) + border (1px) = 21px
        <div
            aria-hidden="true"
            className="rounded-[21px] border border-transparent bg-primary/40 p-2 shadow-2xl"
        >
            <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 border-b px-4 py-3">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <span className="size-2.5 rounded-full bg-accent" />
                    <span className="size-2.5 rounded-full bg-secondary" />
                    <span className="ml-3 text-xs text-muted-foreground">
                        Physics 201 · Workspace
                    </span>
                </div>

                <div className="grid md:grid-cols-[13rem_1fr]">
                    {/* Sources */}
                    <div className="hidden flex-col gap-1 border-r p-3 md:flex">
                        <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Sources
                        </p>
                        {sources.map(({ icon: Icon, label, active }) => (
                            <div
                                key={label}
                                className={
                                    active
                                        ? "flex items-center gap-2 rounded-md bg-accent px-2 py-1.5 text-xs font-medium text-accent-foreground"
                                        : "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground"
                                }
                            >
                                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                                <span className="truncate">{label}</span>
                            </div>
                        ))}
                        <p className="mt-4 px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                            Learn
                        </p>
                        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
                            <Layers className="size-3.5 shrink-0" strokeWidth={1.75} />
                            Flashcards · 24 cards
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex flex-col gap-4 p-4 sm:p-6">
                        <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                            Why can&apos;t a heat engine be 100% efficient?
                        </div>

                        <div className="flex gap-3">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                <Sparkles className="size-3.5" strokeWidth={2} />
                            </span>
                            <div className="space-y-2 text-sm leading-relaxed">
                                <p>
                                    Because some heat must always flow to the cold
                                    reservoir. The second law says entropy can&apos;t
                                    decrease overall
                                    <Cite n={1} />, so converting all heat into work
                                    would break it.
                                </p>
                                <p>
                                    The best you can do is the Carnot limit,{" "}
                                    <span className="font-mono text-[13px]">
                                        1 − T<sub>c</sub>/T<sub>h</sub>
                                    </span>
                                    <Cite n={3} />.
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                                        <FileText className="size-3" strokeWidth={1.75} />
                                        Lecture 7, p. 12
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                                        <Globe className="size-3" strokeWidth={1.75} />
                                        Carnot cycle notes
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
