import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/src/components/ui/sonner';
import { ThemeProvider } from '@/src/components/providers/ThemeProvider';
import { QueryProvider } from '@/src/components/providers/QueryProvider';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { Layout } from '@/src/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hệ thống quản lý hồ sơ công chứng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Auth0Provider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Layout>
                {children}
              </Layout>
              <Toaster position="top-right" />
            </ThemeProvider>
          </QueryProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}