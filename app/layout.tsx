import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { ClerkProvider, Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
      <body style={{ backgroundColor: "#07070a", color: "#eceae5", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: "#0e0e12",
              colorInputBackground: "#111118",
              colorInputText: "#eceae5",
              colorText: "#eceae5",
              colorTextSecondary: "rgba(236,234,229,0.5)",
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
