'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/src/components/ui/button';
import { LogIn } from 'lucide-react';

export function LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (user) {
    return null;
  }

  return (
    <Button asChild>
      <a href="/api/auth/login">
        <LogIn className="mr-2 h-4 w-4" />
        Đăng nhập
      </a>
    </Button>
  );
}