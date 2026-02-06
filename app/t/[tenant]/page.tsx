import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: subdomain } = await params;
  const user = await getCurrentUser();
  const tenant = await getCurrentTenant(subdomain);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {user ? (
          <Link href={`/dashboard/${subdomain}`}>
            <Button variant="outline">Dashboard</Button>
          </Link>
        ) : (
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-9xl mb-6">{subdomain}</div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to {tenant.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {tenant.subdomain} organizer portal
          </p>

          {user && (
            <div className="mt-12">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle>Become an Event Organizer</CardTitle>
                  <CardDescription>
                    Create and manage events on {subdomain}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Apply to become an organizer and start hosting amazing events. 
                    The application takes just a few minutes to complete.
                  </p>
                  <Link href={`/dashboard/${subdomain}`}>
                    <Button>Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {!user && (
            <div className="mt-12">
              <Link href="/auth/signin">
                <Button size="lg">Sign In to Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
