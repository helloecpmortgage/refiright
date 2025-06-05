import type { Metadata } from "next";
import { Quicksand } from "next/font/google"; // Using Next/Font for optimization
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { cn } from "@/lib/utils";

// Configure Quicksand font
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand", // CSS variable for Quicksand
  display: "swap",
});

// Assuming Articulat CF needs to be loaded differently (e.g., local font or external CSS)
// For this example, we'll assume it's loaded via CSS or another method
// and apply its class where needed. If available via Google Fonts or similar, import it like Quicksand.

export const metadata: Metadata = {
  title: "RefiRight - ECP Mortgage Calculator", // Updated title
  description: "Refinance mortgage calculator for ECP Loan Officers",
  robots: {
    index: false, // Prevent indexing by search engines
    follow: false, // Prevent following links
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add link to Articulat CF font if hosted elsewhere or define @font-face in globals.css */}
        {/* Example: <link rel="stylesheet" href="path/to/articulat-cf.css" /> */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-primary antialiased",
          quicksand.variable // Apply Quicksand variable to body
        )}
      >
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
