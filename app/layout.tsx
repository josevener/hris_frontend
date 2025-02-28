import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BFD Corp.",
  description: "BFD Corp. Human Resource Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}