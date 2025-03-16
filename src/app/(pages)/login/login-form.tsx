'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';
import { AUTH_ROUTES } from '@/app/api/route_paths';
import { GithubIcon, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/app/context/session-provider';
import { authError } from '@/app/utils/error-handler';

function LoginFormContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, refetchSession } = useSession();

  useEffect(() => {
    // Check for error parameter in URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      authError('Login attempt failed. Please try again.', {
        title: 'Authentication Failed',
        action: {
          label: 'Try Again',
          onClick: () => router.push(AUTH_ROUTES.LOGIN),
        },
      });
      setIsLoading(false);
    }
  }, [searchParams, router]);
  
  const handleLogin = async () => {
    // Prevent multiple clicks
    if (isLoading) return;

    setIsLoading(true);
    setError(false);

    try {
      // Navigate to GitHub login
      router.push(AUTH_ROUTES.LOGIN);
    } catch (error) {
      authError('Unable to connect to GitHub authentication service');
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

// Skeleton component to show while suspended
function LoginFormSkeleton() {
  return (
    <Card className='w-full max-w-md space-y-2'>
      <CardHeader>
        <CardTitle>Postify</CardTitle>
        <CardDescription>Continue to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-6'>
          <Button disabled className='cursor-wait'>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            Loading...
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent />
    </Suspense>
  );
}
