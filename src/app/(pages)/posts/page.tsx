'use client';

import { useSession } from '@/app/context/session-provider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PAGE_ROUTES } from '@/app/api/route_paths';

export default function PostsPage({}) {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className='p-4 flex justify-center items-center min-h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-base font-semibold text-muted-foreground'>
            Posts
          </h1>
        </div>
      </div>
    );
  }

  return null;
}
