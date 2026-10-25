import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobBoard | Employer Applications",
  description:
    "Manage job applications, review applicants, and shortlist candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
  title: "OnlineJobBoard | Job Board",
  description: "Find opportunities across industries or manage your hiring with OnlineJobBoard.",
import './globals.css';
import { StoreProvider } from '@/lib/store';

export const metadata = {
  title: 'Online Job Board',
  description: 'Manage job applications, employer verification, and job posting reviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
