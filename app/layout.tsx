import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "../components/footer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Binance NarrAI",
  description: "AI crypto intelligence workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {children}
          </main>

          {/* GLOBAL FOOTER */}
          <Footer />

        </div>
      </body>
    </html>
  );
}