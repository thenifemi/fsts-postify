'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';
import { AUTH_ROUTES, PAGE_ROUTES } from '@/app/api/route_paths';
import { GithubIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/app/context/session-provider';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, refetchSession } = useSession();

  // No need for redirect here, the SessionProvider handles redirects

  useEffect(() => {
    // Check for error parameter in URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(true);
      setIsLoading(false);
      // Clear error after 3 seconds
      const timer = setTimeout(() => {
        setError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(false);

    try {
      // Navigate to GitHub login
      router.push(AUTH_ROUTES.LOGIN);

      setTimeout(() => {
        refetchSession();
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md space-y-2'>
      <CardHeader>
        <CardTitle>Postify</CardTitle>
        <CardDescription>Continue to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-6'>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className='cursor-pointer'
          >
            {isLoading || status === 'loading' ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {status === 'loading'
                  ? 'Checking your session...'
                  : 'Connecting to GitHub...'}
              </>
            ) : (
              <>
                <GithubIcon className='w-4 h-4 mr-2' />
                Continue with Github
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
