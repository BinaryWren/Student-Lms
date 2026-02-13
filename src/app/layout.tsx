import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google"; // proper rich fonts
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter", // We can use this if we want a separate body font
  subsets: ["latin"],
  display: "swap",
});

// We can stick to Outfit for a consistent modern look, or mix.
// In globals.css I set --font-sans to --font-outfit.

export const metadata: Metadata = {
  title: "LMS Platform",
  description: "Next Gen Multi-Institute LMS",
};

import { AuthProvider } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          outfit.variable,
          inter.variable,
          "font-sans antialiased bg-background text-foreground"
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
