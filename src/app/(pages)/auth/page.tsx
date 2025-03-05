import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { auth } from '@/server/auth/auth';
import { redirect } from 'next/navigation';

export default async function AuthPage({}) {
  const session = await auth();

  if (session?.user) {
    redirect('/posts');
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Card className='w-full max-w-md p-4'>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type='email' placeholder='Email' />
          <Input type='password' placeholder='Password' />
          <Button>Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
