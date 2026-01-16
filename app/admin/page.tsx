import { getCurrentUser } from '@/lib/auth';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not authenticated</h1>
          <p className="mt-2 text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.name || user.email}!</p>
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

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">User Information</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-gray-700">ID</dt>
            <dd className="text-gray-900">{user.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          {user.name && (
            <div>
              <dt className="font-medium text-gray-700">Name</dt>
              <dd className="text-gray-900">{user.name}</dd>
            </div>
          )}
          {user.image && (
            <div>
              <dt className="font-medium text-gray-700">Image</dt>
              <dd className="text-gray-900">
                <img src={user.image} alt="Profile" className="h-16 w-16 rounded-full" />
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
