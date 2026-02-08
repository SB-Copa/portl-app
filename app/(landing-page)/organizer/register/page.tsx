import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { RegistrationForm } from '@/components/organizer/registration-form';

export default async function OrganizerRegisterPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin?callbackUrl=/organizer/register');
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Become an Organizer</h1>
          <p className="text-gray-600">
            Register your business to start creating and managing events
          </p>
        </div>

        <RegistrationForm />
      </div>
    </div>
  );
}
