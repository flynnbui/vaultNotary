import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== AUTH0 ENVIRONMENT VARIABLES DEBUG ===');
  console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
  console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
  console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? '***SECRET_SET***' : 'undefined');
  console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL);
  console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? '***SECRET_SET***' : 'undefined');
  console.log('AUTH0_SCOPE:', process.env.AUTH0_SCOPE);
  console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
  console.log('AUTH0_SESSION_ROLLING_DURATION:', process.env.AUTH0_SESSION_ROLLING_DURATION);
  console.log('AUTH0_SESSION_ABSOLUTE_DURATION:', process.env.AUTH0_SESSION_ABSOLUTE_DURATION);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Calculate callback URL
  const callbackUrl = `${process.env.AUTH0_BASE_URL}/auth/callback`;
  console.log('CALLBACK_URL (calculated):', callbackUrl);
  
  // Test Auth0Client creation
  try {
    const { Auth0Client } = require('@auth0/nextjs-auth0/server');
    console.log('✅ Auth0Client imported successfully');
    
    const client = new Auth0Client({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      appBaseUrl: process.env.AUTH0_BASE_URL,
      secret: process.env.AUTH0_SECRET,
      authorizationParameters: {
        scope: process.env.AUTH0_SCOPE,
        audience: process.env.AUTH0_AUDIENCE,
      },
    });
    console.log('✅ Auth0Client created successfully');
    
  } catch (error: any) {
    console.log('❌ Error with Auth0Client:');
    console.log('Error message:', error?.message || 'Unknown error');
    console.log('Error type:', error?.constructor?.name || 'Unknown');
    if (error?.stack) {
      console.log('Error stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
  }
  
  console.log('=== END DEBUG ===');

  return NextResponse.json({
    message: 'Debug info logged to container console. Check docker-compose logs vaultnotary-frontend',
    timestamp: new Date().toISOString(),
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      baseUrl: process.env.AUTH0_BASE_URL,
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE,
      callbackUrl: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
    },
  });
}