import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideFlow — Distributed Ride-Hailing Platform",
  description: "High-performance, event-driven ride-hailing frontend built with Next.js, MapLibre, Go, gRPC, Kafka & Redis.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚗</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-obsidian-950 text-slate-100 font-sans select-none overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
