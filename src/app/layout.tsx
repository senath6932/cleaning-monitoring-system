import type { Metadata } from "next";
import AuthProvider from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cleaning Monitoring System",
  description: "University cleaning monitoring system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
