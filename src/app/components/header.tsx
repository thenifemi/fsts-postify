'use client';

import { useSession } from '../context/session-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from '@radix-ui/react-label';
import Image from 'next/image';
import { UserHeaderActions } from '../user-header-actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PAGE_ROUTES } from '@/app/api/route_paths';

export function Header() {
  const { session, status } = useSession();

  if (status === 'unauthenticated') {
    return null;
  }

  // Show header with user info if authenticated
  if (session?.user) {
    if (status === 'loading') {
      return (
        <div className='top-0 right-0 p-4 w-full border-b flex items-center justify-center'>
          <Loader2 className='size-4 animate-spin' />
        </div>
      );
    }

    if (status === 'authenticated') {
      return (
        <div className='fixed bg-background z-50 top-0 right-0 p-4 w-full border-b flex items-center justify-between'>
          <Link href={PAGE_ROUTES.HOME}>
            <Image
              src='/postify.png'
              alt='Postify'
              width={32}
              height={32}
              className='w-8 h-8'
            />
          </Link>

          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback>
                {session.user.name?.charAt(0) || '?'}
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

            <UserHeaderActions />
          </div>
        </div>
      );
    }
  }

  // Fallback (should never reach here, but just in case)
  return null;
}
