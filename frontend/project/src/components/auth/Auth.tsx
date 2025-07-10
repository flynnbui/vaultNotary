'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { LoginButton } from './LoginButton';
import { UserProfile } from './UserProfile';

export function Auth() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="animate-pulse h-8 w-20 bg-gray-200 rounded" />;
  }

  return (
    <div className="flex items-center space-x-2">
      {user ? <UserProfile /> : <LoginButton />}
    </div>
  );
}