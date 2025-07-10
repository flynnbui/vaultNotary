'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Shield, LogIn } from 'lucide-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Đang xác thực...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Yêu cầu đăng nhập
            </CardTitle>
            <CardDescription>
              Bạn cần đăng nhập để truy cập trang này
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/api/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Đăng nhập
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}