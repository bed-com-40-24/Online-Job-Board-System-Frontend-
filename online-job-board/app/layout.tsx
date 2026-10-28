import type { Metadata } from "next";
import "./globals.css";
import BackButton from "./components/BackButton";
import SidebarToggle from "./components/SidebarToggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Online Job Board",
  description: "Find jobs and manage job vacancies online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex w-full">
          <aside className="sidebar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                OJ
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>OnlineJobBoard</div>
            </div>

            {/* Minimal nav placeholders to mirror screenshot spacing */}
            <nav style={{ marginTop: 28 }}>
              <Link href="/" className="sidebar-link" aria-current="page">Dashboard</Link>
              <Link href="/employer/vacancies" className="sidebar-link">My vacancies</Link>
              <Link href="/employer/vacancies/new" className="sidebar-link">Create vacancy</Link>
            </nav>
            {/* Sidebar toggle button (edge floating) */}
            <SidebarToggle />
          </aside>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <header className="topbar px-4 relative">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BackButton />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="site-title">OnlineJobBoard</div>
                </div>
              </div>
            </header>

            <main className="app-main p-6">{children}</main>
          </div>
        </div>

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