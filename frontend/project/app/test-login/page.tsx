'use client';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LogIn, Shield } from 'lucide-react';

export default function TestLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Test Auth0 Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Click the button below to test Auth0 Universal Login
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <a href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login with Auth0
              </a>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <a href="/auth-test">
                View Auth Test Page
              </a>
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <a href="/">
                Back to Home
              </a>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            <p>Auth0 Domain: nharong.eu.auth0.com</p>
            <p>Callback: {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/auth/callback</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}