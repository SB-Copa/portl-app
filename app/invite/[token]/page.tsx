import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getInvitationByTokenAction } from '@/app/actions/invitations';
import { InviteAcceptCard } from './invite-accept-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/invite/${token}`);
  }

  const result = await getInvitationByTokenAction(token);

  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <InviteAcceptCard
        token={token}
        invitation={result.data!}
        userEmail={user.email!}
      />
    </div>
  );
}
