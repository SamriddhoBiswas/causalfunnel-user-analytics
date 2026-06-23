import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "CausalFunnel Analytics Demo",
  description: "A demo page for testing user interaction analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
