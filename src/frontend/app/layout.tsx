import type React from "react";
import "../styles/globals.css"; // <-- Add this line at the very top
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrthoVision - Fracture Classification and Localization",
  description:
    "AI-powered X-ray analysis tool for fracture detection and classification. Educational tool developed for medical imaging research.",
  keywords: [
    "orthopedics",
    "fracture detection",
    "X-ray analysis",
    "medical imaging",
    "AI diagnosis",
    "bone fracture",
    "radiology",
  ],
  authors: [{ name: "Hallares, Togonon." }],
  robots: "index, follow",
  openGraph: {
    title: "OrthoVision - AI-Powered Fracture Detection",
    description:
      "Advanced X-ray analysis for fracture classification and localization using artificial intelligence.",
    type: "website",
    locale: "en_US",
    siteName: "OrthoVision",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="OrthoVision" />
        <meta name="apple-mobile-web-app-title" content="OrthoVision" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
