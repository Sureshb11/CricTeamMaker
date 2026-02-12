import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import BackgroundImages from "@/components/BackgroundImages";

export const metadata: Metadata = {
  title: "DVS Official",
  description: "Official website for DVS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BackgroundImages />
        <Navbar />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
