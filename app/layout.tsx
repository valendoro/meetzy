import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Meetzy — La web que entiende.",
    template: "%s | Meetzy",
  },
  description:
    "Meetzy observa lo que cada visitante hace en tu sitio y responde con precisión antes de que tenga que preguntar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://meetzy.ai"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#7c6cff",
              colorBackground: "#0b0a0f",
              colorInputBackground: "#16151f",
              colorInputText: "#f3f1ec",
              colorText: "#f3f1ec",
              colorTextSecondary: "rgba(243,241,236,0.5)",
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
