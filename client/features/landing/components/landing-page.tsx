import Link from "next/link";
import {
    ArrowRight,
    BookOpenCheck,
    Brain,
    FileText,
    Globe,
    MessageSquareQuote,
    PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { ChaibookLogo } from "@/shared/components/chaibook-logo";
import { ProductPreview } from "./product-preview";

const pressScale = "transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]";

const features = [
    {
        icon: FileText,
        title: "Bring any source",
        body: "Upload PDFs, paste a website or drop in a YouTube link. Chaibook reads them so you don't have to reread them.",
        tags: [
            { icon: FileText, label: "PDF" },
            { icon: Globe, label: "Website" },
            { icon: PlayCircle, label: "YouTube" },
        ],
        tint: "bg-primary text-primary-foreground",
    },
    {
        icon: MessageSquareQuote,
        title: "Answers you can check",
        body: "Every reply cites the passage it came from. Hover a citation to see the exact text, right there in the chat.",
        tags: [],
        tint: "bg-secondary text-secondary-foreground",
    },
    {
        icon: BookOpenCheck,
        title: "Revision, generated",
        body: "Turn a workspace into study material in one click, built only from your own sources.",
        tags: [
            { label: "Summary" },
            { label: "Key takeaways" },
            { label: "Flashcards" },
            { label: "Quiz" },
            { label: "Mind map" },
            { label: "Report" },
        ],
        tint: "bg-accent text-accent-foreground",
    },
    {
        icon: Brain,
        title: "It remembers you",
        body: "Tell Chaibook how you like to learn once. Your preferences carry across every conversation.",
        tags: [],
        tint: "bg-chart-4 text-primary-foreground",
    },
] as const;

const steps = [
    {
        title: "Create a workspace",
        body: "One per course, project or rabbit hole.",
    },
    {
        title: "Add your sources",
        body: "Lecture slides, articles, recorded talks. Mix them freely.",
    },
    {
        title: "Ask, then revise",
        body: "Chat until it clicks, then generate flashcards and a quiz to make it stick.",
    },
];

function SignInButton({
    children,
    size = "lg",
    className,
}: {
    children: React.ReactNode;
    size?: "default" | "lg";
    className?: string;
}) {
    return (
        <Button
            nativeButton={false}
            size={size}
            className={cn(pressScale, className)}
            render={<Link href={authRoutes.login} />}
        >
            {children}
        </Button>
    );
}

export function LandingPage() {
    return (
        <div className="relative flex min-h-svh flex-col overflow-x-clip">
            {/* Soft brand wash behind the hero */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(45%_45%_at_15%_15%,var(--primary),transparent),radial-gradient(40%_40%_at_85%_10%,var(--secondary),transparent),radial-gradient(35%_35%_at_55%_45%,var(--accent),transparent)] opacity-40 dark:opacity-20"
            />

            <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-md">
                <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/" aria-label="Chaibook home">
                        <ChaibookLogo />
                    </Link>
                    <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
                        <a href="#features" className="transition-colors duration-150 hover:text-foreground">
                            Features
                        </a>
                        <a href="#how-it-works" className="transition-colors duration-150 hover:text-foreground">
                            How it works
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <SignInButton size="default">Sign in</SignInButton>
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="landing-enter inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground shadow-sm">
                            <span className="size-1.5 rounded-full bg-chart-4" />
                            Your notes, steeped into understanding
                        </p>
                        <h1 className="landing-enter mt-6 font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-6xl [animation-delay:100ms]">
                            Chat with your notes.
                            <br />
                            <span className="bg-primary px-2 box-decoration-clone text-primary-foreground rounded-lg">Walk away</span> knowing them.
                        </h1>
                        <p className="landing-enter mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg [animation-delay:200ms]">
                            Drop in PDFs, websites and YouTube videos. Chaibook answers with
                            citations to the exact passage, then turns it all into flashcards,
                            quizzes and mind maps for revision.
                        </p>
                        <div className="landing-enter mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:300ms]">
                            <SignInButton className="h-11 px-6 text-base">
                                Get started
                                <ArrowRight data-icon="inline-end" strokeWidth={2} />
                            </SignInButton>
                            <Button
                                nativeButton={false}
                                variant="ghost"
                                size="lg"
                                className={cn(pressScale, "h-11 px-6 text-base")}
                                render={<a href="#how-it-works" />}
                            >
                                See how it works
                            </Button>
                        </div>
                    </div>

                    <div className="landing-enter mx-auto mt-16 max-w-5xl [animation-delay:400ms]">
                        <ProductPreview />
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="scroll-mt-20 border-t bg-card">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <div className="max-w-2xl">
                            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                From a pile of sources to a plan for the exam
                            </h2>
                            <p className="mt-4 text-muted-foreground text-pretty">
                                Everything stays grounded in what you uploaded, so you study the
                                material in front of you, not whatever the internet says.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2">
                            {features.map(({ icon: Icon, title, body, tags, tint }) => (
                                <article
                                    key={title}
                                    className={cn("flex flex-col rounded-2xl p-6 shadow-md sm:p-8", tint)}
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-background/60">
                                        <Icon className="size-5" strokeWidth={1.75} />
                                    </span>
                                    <h3 className="mt-5 font-heading text-lg font-semibold">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed opacity-75 text-pretty">
                                        {body}
                                    </p>
                                    {tags.length > 0 && (
                                        <ul className="mt-5 flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <li
                                                    key={tag.label}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1 text-xs font-medium"
                                                >
                                                    {"icon" in tag && (
                                                        <tag.icon className="size-3.5" strokeWidth={1.75} />
                                                    )}
                                                    {tag.label}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="scroll-mt-20 border-t">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
                        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                            Three steps, one cup of chai
                        </h2>
                        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
                            {steps.map((step, i) => (
                                <li key={step.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                                    <span
                                        className={cn(
                                            "inline-flex size-9 items-center justify-center rounded-full font-mono text-sm font-medium tabular-nums",
                                            ["bg-primary text-primary-foreground", "bg-secondary text-secondary-foreground", "bg-accent text-accent-foreground"][i],
                                        )}
                                    >
                                        {i + 1}
                                    </span>
                                    <h3 className="mt-3 font-heading text-lg font-semibold">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                                        {step.body}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Closing CTA */}
                <section className="px-6 pb-20 sm:pb-28">
                    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl bg-secondary px-6 py-16 text-center text-secondary-foreground shadow-lg sm:py-20">
                        <h2 className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            Put the kettle on. Your study session is ready.
                        </h2>
                        <p className="max-w-md opacity-75 text-pretty">
                            Sign in with Google and start your first workspace in under a minute.
                        </p>
                        <SignInButton className="h-11 bg-foreground px-6 text-base text-background hover:bg-foreground/85">
                            Start studying
                            <ArrowRight data-icon="inline-end" strokeWidth={2} />
                        </SignInButton>
                    </div>
                </section>
            </main>

            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
                    <ChaibookLogo />
                    <p>© {new Date().getFullYear()} Chaibook. Learn from what you already have.</p>
                </div>
            </footer>
        </div>
    );
}
