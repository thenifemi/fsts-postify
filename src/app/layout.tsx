import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './components/theme-provider';
import { auth } from '@/server/auth/auth';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Label } from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { LogOutIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { AUTH_ROUTES } from './api/route_paths';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Postify',
  description: 'Postify is a social media platform for sharing posts',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn(montserrat.className)}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          {session?.user && (
            <div className='top-0 right-0 p-4 w-full border-b flex items-center justify-between'>
              <Image
                src='/postify.png'
                alt='Postify'
                width={32}
                height={32}
                className='w-8 h-8'
              />

              <div className='flex items-center gap-4'>
                <Avatar>
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className='flex flex-col'>
                  <Label className='text-xs font-semibold'>
                    {session.user.name}
                  </Label>
                  <Label className='text-xs text-muted-foreground'>
                    {session.user.email}
                  </Label>
                </div>

                <Button
                  variant='outline'
                  size='icon'
                  asChild
                >
                  <Link href={AUTH_ROUTES.LOGOUT}>
                    <LogOutIcon className='size-4' />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
