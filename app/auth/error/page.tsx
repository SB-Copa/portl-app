import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Verification Failed',
    description: 'The verification link is invalid or has expired.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error occurred during OAuth sign in. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred in OAuth callback. Please try again.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create OAuth account. The email might already be in use.',
  },
  EmailCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create email account. Please try again.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error in callback URL. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description:
      'An account with this email already exists with a different provider. Please sign in with your original provider.',
  },
  EmailSignin: {
    title: 'Email Sign In',
    description: 'Check your email for the sign in link.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'Sign in failed. Check your credentials.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'Please sign in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication. Please try again.',
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error || 'Default';
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">{errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
