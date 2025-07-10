'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Shield, User, Mail, Calendar, Check, X } from 'lucide-react';
import { ProtectedRoute } from '@/src/components/auth';
import { useEffect, useState } from 'react';

export default function AuthTestPage() {
  const { user, isLoading } = useUser();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          setTokenInfo(data);
        } else {
          setTokenError('Failed to fetch token');
        }
      } catch (error) {
        setTokenError('Error fetching token');
      }
    };

    if (user) {
      fetchToken();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Auth0 Integration Test
            </h1>
            <p className="text-gray-600">
              This page is protected and requires authentication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4" />
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Name:</span>
                      <span>{user.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span>{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Last Updated:</span>
                      <span>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email Verified:</span>
                      {user.email_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No user data available</p>
                )}
              </CardContent>
            </Card>

            {/* Token Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Token
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokenError ? (
                  <div className="text-red-600 text-sm">
                    Error: {tokenError}
                  </div>
                ) : tokenInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Token Retrieved:</span>
                      <Badge className="bg-green-100 text-green-800">Success</Badge>
                    </div>
                    <div className="break-all text-sm bg-gray-100 p-3 rounded">
                      <span className="font-medium">Token:</span>
                      <br />
                      <span className="text-gray-600">
                        {tokenInfo.accessToken ? `${tokenInfo.accessToken.substring(0, 50)}...` : 'No token'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Loading token information...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* API Test */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>API Integration Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Test API calls with Auth0 authentication:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/userinfo');
                        console.log('User info:', await response.json());
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                  >
                    Test User Info
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/token');
                        console.log('Token:', await response.json());
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                  >
                    Test Token
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/api/auth/logout';
                    }}
                  >
                    Test Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}