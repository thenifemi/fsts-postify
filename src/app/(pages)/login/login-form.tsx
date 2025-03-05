import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';
import { AUTH_ROUTES } from '@/app/api/route_paths';
import { GithubIcon } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  return (
    <Card className='w-full max-w-md space-y-2'>
      <CardHeader>
        <CardTitle>Postify</CardTitle>
        <CardDescription>Continue to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-6'>
          <Button asChild className='cursor-pointer'>
            <Link href={AUTH_ROUTES.LOGIN}>
              <GithubIcon className='w-4 h-4 mr-2' />
              Continue with Github
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
