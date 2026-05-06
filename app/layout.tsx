import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
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
    "Meetzy observa lo que cada visitante hace en tu sitio, infiere lo que está pensando, y responde con precisión antes de que tenga que preguntar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://meetzy.ai"),
  openGraph: {
    title: "Meetzy — Tu web observa. Entiende. Responde.",
    description:
      "La primera web del mundo que entiende a cada visitante en tiempo real.",
    type: "website",
  },
};

import CustomCursor from "@/components/landing/CustomCursor";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body style={{ backgroundColor: "#07070a", color: "#eceae5", fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
