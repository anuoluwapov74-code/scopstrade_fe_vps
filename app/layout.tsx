import type { Metadata, Viewport } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tradescops.com"),
  title: {
    default: "TradeScops - Copy Futures, Options & Contracts with Precision",
    template: "%s | TradeScops",
  },
  description:
    "Mirror real-time stock and options trades from top-performing traders. Precision, flexibility, and transparency straight to your fingertips.",
  keywords: [
    "copy trading",
    "futures trading",
    "options trading",
    "stock trading",
    "trade copying",
    "TradeScops",
  ],
  openGraph: {
    // Image is supplied automatically by app/opengraph-image.png (Next.js file
    // convention) — do not duplicate it here, file-based metadata takes
    // priority over this config and would just shadow it.
    type: "website",
    url: "https://tradescops.com",
    siteName: "TradeScops",
    title: "TradeScops - Copy Futures, Options & Contracts with Precision",
    description:
      "Mirror real-time stock and options trades from top-performing traders. Precision, flexibility, and transparency straight to your fingertips.",
  },
  twitter: {
    // Image is supplied automatically by app/twitter-image.png (Next.js file
    // convention) — same reasoning as openGraph above.
    card: "summary_large_image",
    title: "TradeScops - Copy Futures, Options & Contracts with Precision",
    description:
      "Mirror real-time stock and options trades from top-performing traders. Precision, flexibility, and transparency straight to your fingertips.",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#100d4b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>

        {/* LiveChat - Jovo */}

        <Script
          src="//code.jivosite.com/widget/jZikVtEDhl"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
