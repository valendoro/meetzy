import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider, Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meetzy — La web que entiende.",
    template: "%s | Meetzy",
  },
  description:
    "Meetzy observa lo que cada visitante hace en tu sitio y responde con precisión antes de que tenga que preguntar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://meetzy.ai"),
  openGraph: {
    type: "website",
    siteName: "Meetzy",
    title: "Meetzy — La web que entiende.",
    description:
      "Meetzy observa lo que cada visitante hace en tu sitio y responde con precisión antes de que tenga que preguntar.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://meetzy.ai",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meetzy — La web que entiende.",
    description:
      "Meetzy observa lo que cada visitante hace en tu sitio y responde con precisión antes de que tenga que preguntar.",
    creator: "@meetzyai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#7c6cff",
              colorBackground: "#060608",
              colorInputBackground: "#12121a",
              colorInputText: "#eeeae4",
              colorText: "#eeeae4",
              colorTextSecondary: "rgba(238,234,228,0.65)",
              borderRadius: "12px",
              fontFamily: "DM Sans, sans-serif",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

// Re-export for use in nav components
export { Show, UserButton, SignInButton, SignUpButton };
