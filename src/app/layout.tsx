import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './components/theme-provider';
import { cn } from '@/lib/utils';
import { SessionProvider } from './context/session-provider';
import { Header } from './components/header';
import { Toaster } from './components/ui/toaster';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Postify',
  description: 'Postify is a social media platform for sharing posts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn(montserrat.className)}>
        <SessionProvider>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
            <Header />
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
