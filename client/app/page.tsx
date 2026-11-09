import type { Metadata } from "next";

import { LandingPage } from "@/features/landing";

export const metadata: Metadata = {
  title: { absolute: "Chaibook — Chat with your notes" },
  description:
    "Chat with your PDFs, websites and YouTube videos with cited answers, then turn them into flashcards, quizzes and mind maps.",
};

export default function Home() {
  return <LandingPage />;
}
