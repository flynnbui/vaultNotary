import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/src/components/ui/sonner';
import { ThemeProvider } from '@/src/components/providers/ThemeProvider';
import { Auth0Provider } from '@auth0/nextjs-auth0';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NotaryFile - Hệ thống quản lý hồ sơ công chứng',
  description: 'Giải pháp toàn diện cho việc quản lý hồ sơ và khách hàng tại văn phòng công chứng',
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}