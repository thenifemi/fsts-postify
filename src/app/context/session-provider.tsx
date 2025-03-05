'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PAGE_ROUTES } from '../api/route_paths';
import { Session } from 'next-auth';
import { getSession } from '@/server/auth/actions';

type SessionContextType = {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refetchSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  status: 'loading',
  refetchSession: async () => {},
});

export const useSession = () => useContext(SessionContext);

// Define route arrays with literal types
const protectedRoutes = ['/posts'] as const;
const guestRoutes = ['/login'] as const;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');
  const router = useRouter();
  const pathname = usePathname();

  const fetchSession = async () => {
    try {
      setStatus('loading');

      // Use the server action to get the session
      const newSession = await getSession();

      setSession(newSession);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');

      // Handle auth-based redirects centrally
      handleAuthRedirects(newSession);
    } catch (error) {
      console.error('Error fetching session:', error);
      setStatus('unauthenticated');
    }
  };

  const handleAuthRedirects = (session: Session | null) => {
    const publicRoutes = ['/'] as const;

    if (session) {
      if (guestRoutes.includes(pathname as '/login')) {
        router.push(PAGE_ROUTES.POSTS);
      }
    } else {
      if (protectedRoutes.includes(pathname as '/posts')) {
        router.push(PAGE_ROUTES.LOGIN);
      }
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  return (
    <SessionContext.Provider
      value={{ session, status, refetchSession: fetchSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}
