'use server';

import { auth } from './auth';
import { Session } from 'next-auth';

/**
 * Server action to fetch the current session
 * This allows us to call auth() from the server context where headers are available
 */
export async function getSession(): Promise<Session | null> {
  return auth();
}