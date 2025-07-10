'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/src/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Button variant="outline" asChild>
      <a href="/api/auth/logout">
        <LogOut className="mr-2 h-4 w-4" />
        Đăng xuất
      </a>
    </Button>
  );
}