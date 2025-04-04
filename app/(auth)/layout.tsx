import { ThemeProvider } from "@/components/ui/theme-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BFD",
  description: "BFD Human Resource Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
  );
}