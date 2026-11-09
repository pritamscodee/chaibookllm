import type { Metadata, Viewport } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/shared/components/providers/theme-provider";
import QueryProvider from "@/shared/components/providers/query-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const description =
  "Chat with your PDFs, websites and YouTube videos with cited answers, then turn them into flashcards, quizzes and mind maps.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Chaibook — Chat with your notes",
    template: "%s · Chaibook",
  },
  description,
  applicationName: "Chaibook",
  openGraph: {
    type: "website",
    siteName: "Chaibook",
    title: "Chaibook — Chat with your notes",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaibook — Chat with your notes",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1e26" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", poppins.variable, robotoMono.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
