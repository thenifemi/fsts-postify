'use client';

import { useSession } from '../context/session-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from '@radix-ui/react-label';
import Image from 'next/image';
import { UserHeaderActions } from '../user-header-actions';
import { Button } from './ui/button';
import Link from 'next/link';
import { PAGE_ROUTES } from '../api/route_paths';
import { GithubIcon, Loader2 } from 'lucide-react';

export function Header() {
  const { session, status } = useSession();

  // Show nothing while loading the session initially
  if (status === 'loading') {
    return (
      <div className='top-0 right-0 p-4 w-full border-b flex items-center justify-center'>
        <Loader2 className='size-4 animate-spin' />
      </div>
    );
  }

  // Show header with user info if authenticated
  if (status === 'authenticated' && session?.user) {
    return (
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
              {session.user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col'>
            <Label className='text-xs font-semibold'>{session.user.name}</Label>
            <Label className='text-xs text-muted-foreground'>
              {session.user.email}
            </Label>
          </div>

          <UserHeaderActions />
        </div>
      </div>
    );
  }

  // Show login button if not authenticated
  return (
    <div className='top-0 right-0 p-4 w-full border-b flex items-center justify-between'>
      <Image
        src='/postify.png'
        alt='Postify'
        width={32}
        height={32}
        className='w-8 h-8'
      />

      <Button asChild variant='outline' size='sm'>
        <Link href={PAGE_ROUTES.LOGIN}>
          <GithubIcon className='w-4 h-4 mr-2' />
          Continue with GitHub
        </Link>
      </Button>
    </div>
  );
}
