import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import "dotenv/config";

const { GA_PUBLIC_MEASUREMENT_ID } = process.env;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCC AI Assistant | Midwestern Career College Virtual Guida",
  description:
    "Get instant answers about Midwestern Career College programs, admissions, financial aid, and career training. Our AI-powered chat assistant helps students explore healthcare, technology, and business courses available at MCC",
  keywords:
    "Midwestern Career College, Midwestern College, MCC Chicago, Midwestern Chicago, business programs, healthcare programs, career training, AI chat assistant, college admissions, financial aid, medical programs, technical courses, business education, student resources",
  openGraph: {
    title: "MCC AI Assistant | Midwestern Career College Virtual Guide",
    description:
      "Get instant asnwers about Midwestern Career College programs, admissions, and career training. Available 24/7 to help you explore your educational journey.",
    type: "website",
    locale: "en_US",
    siteName: "Midwestern Career College",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCC AI Assistant | Midwestern Career College Virtual Guide",
    description:
      "Get instant asnwers about Midwestern Career College programs, admissions, and career training. Available 24/7 to help you explore your educational journey.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/* <GoogleAnalytics /> */}
      <GoogleAnalytics gaId={GA_PUBLIC_MEASUREMENT_ID as string} />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
