import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from '@/components/profile/profile-form';
import { PasswordForm } from '@/components/profile/password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, Key } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const user = await getCurrentUser();
  const { tenant: subdomain } = await params;

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/${subdomain}/profile`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  user.role === 'ADMIN'
                    ? 'destructive'
                    : user.role === 'ORGANIZER'
                      ? 'success'
                      : 'default'
                }
              >
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Become Organizer CTA */}
        {user.role === 'USER' && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Become an Organizer</CardTitle>
              <CardDescription>
                Create and manage events on {subdomain}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Apply to become an organizer and unlock the ability to create events,
                manage ticketing, and connect with attendees.
              </p>
              <Link href={`/${subdomain}/organizer/dashboard`}>
                <Button>
                  Apply Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
              }}
            />
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
