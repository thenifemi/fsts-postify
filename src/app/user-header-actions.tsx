"use client";

import { AUTH_ROUTES } from "./api/route_paths";
import { Button } from "./components/ui/button";
import { LogOutIcon, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "./context/session-provider";

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
      setError(true);
      setIsLoading(false);
      // Clear error after 3 seconds
      const timer = setTimeout(() => {
        setError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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
      setError(true);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setError(false)}
        aria-label="Logout failed"
        title="Logout failed, try again"
      >
        <AlertTriangle className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Log out"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOutIcon className="size-4" />
      )}
    </Button>
  );
}