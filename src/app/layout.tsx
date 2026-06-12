import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { gujaratiFontClassName, notoSansGujarati } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "DP Cricket Tournament — Cricketer Management",
  description: "Professional cricket player registration management system",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:6060"),
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/icons/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu" dir="ltr" suppressHydrationWarning>
      <body
        className={`${gujaratiFontClassName} ${notoSansGujarati.className} font-sans gu-text antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
