'use client';

import { AUTH_ROUTES } from './api/route_paths';
import { Button } from './components/ui/button';
import { LogOutIcon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from './context/session-provider';
import { authError } from './utils/error-handler';

export function UserHeaderActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetchSession } = useSession();

  useEffect(() => {
    // Check for error parameter in URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'logout_failed') {
      authError("Couldn't sign you out. Please try again.", {
        title: 'Sign Out Failed',
        action: {
          label: 'Try Again',
          onClick: () => router.push(AUTH_ROUTES.LOGOUT),
        },
      });
      setIsLoading(false);
    }
  }, [searchParams, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(false);

    try {
      // Navigate to logout endpoint
      router.push(AUTH_ROUTES.LOGOUT);

      // After a delay, refetch the session to update the UI
      // This is a fallback in case the redirect doesn't work as expected
      setTimeout(() => {
        refetchSession();
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      authError('Failed to sign out properly. Please try again.');
      setIsLoading(false);
    }
  };

  // No need for error button, we use toast notifications now

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={handleLogout}
      disabled={isLoading}
      aria-label='Log out'
      className='cursor-pointer'
    >
      {isLoading ? (
        <Loader2 className='size-4 animate-spin' />
      ) : (
        <LogOutIcon className='size-4' />
      )}
    </Button>
  );
}
