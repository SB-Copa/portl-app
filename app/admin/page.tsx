import { getCurrentUser } from '@/lib/auth';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Users, Calendar, Settings } from 'lucide-react';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not authenticated</h1>
          <p className="mt-2">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2">Welcome back, {user.name || user.email}!</p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>

      {/* Quick Stats/Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/applications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Review organizer applications
              </p>
            </CardContent>
          </Card>
        </Link>

          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-xs text-muted-foreground">
                User management
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-xs text-muted-foreground">
                Event management
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-xs text-muted-foreground">
                System settings
              </p>
            </CardContent>
          </Card>
        </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div>
              <dt className="font-medium">Email</dt>
              <dd>{user.email}</dd>
            </div>
            {user.name && (
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{user.name}</dd>
              </div>
            )}
            {user.image && (
              <div>
                <dt className="font-medium">Image</dt>
                <dd>
                  <Image src={user.image} alt="Profile" width={64} height={64} className="rounded-full" />
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
