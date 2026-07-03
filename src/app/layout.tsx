import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ExamNexa — Premium Government Exam Preparation Platform",
    template: "%s | ExamNexa",
  },
  description:
    "India's most advanced CBT platform for SSC, Railway, Banking, UPSC, State PSC, Defence and all government competitive exams. Practice with 10,000+ questions, real exam interface, and AI-powered analytics.",
  keywords: [
    "SSC CGL",
    "SSC CHSL",
    "RRB NTPC",
    "Bank PO",
    "IBPS",
    "UPSC",
    "government exam",
    "CBT",
    "online test",
    "mock test",
    "competitive exam",
    "ExamNexa",
  ],
  authors: [{ name: "ExamNexa" }],
  creator: "ExamNexa",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://examnexa.com",
    title: "ExamNexa — Premium Government Exam Preparation Platform",
    description:
      "India's most advanced CBT platform for all government competitive exams.",
    siteName: "ExamNexa",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExamNexa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamNexa — Premium Government Exam Preparation Platform",
    description:
      "India's most advanced CBT platform for all government competitive exams.",
    images: ["/og/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1a237e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ExamNexa" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
