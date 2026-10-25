import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnlineJobBoard | Job Board",
  description: "Find opportunities across industries or manage your hiring with OnlineJobBoard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
