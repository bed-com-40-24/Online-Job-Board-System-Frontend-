import './globals.css';
import { StoreProvider } from '@/lib/store';

export const metadata = {
  title: 'Online Job Board',
  description: 'Manage job applications, employer verification, and job posting reviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
