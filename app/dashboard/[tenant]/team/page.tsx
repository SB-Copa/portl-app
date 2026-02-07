import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TeamSection } from '@/components/dashboard/team/team-section';
import type { TenantMemberRole } from '@/prisma/generated/prisma/client';

async function getTeamData(userId: string, subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: { application: true },
  });

  if (!tenant) return null;

  const membership = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId, tenantId: tenant.id },
    },
  });

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    return null;
  }

  const members = await prisma.tenantMember.findMany({
    where: { tenantId: tenant.id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });

  const invitations = await prisma.tenantInvitation.findMany({
    where: {
      tenantId: tenant.id,
      status: 'PENDING',
    },
    include: {
      inviter: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    tenant,
    members,
    invitations,
    currentUserRole: membership.role as TenantMemberRole,
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const user = await getCurrentUser();
  const { tenant: subdomain } = await params;

  if (!user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/${subdomain}/team`);
  }

  const data = await getTeamData(user.id, subdomain);

  if (!data) {
    redirect(`/dashboard/${subdomain}`);
  }

  const isApproved = data.tenant.application?.status === 'APPROVED';

  if (!isApproved) {
    redirect(`/dashboard/${subdomain}`);
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team members and invitations for {data.tenant.name}.
        </p>
      </div>

      <TeamSection
        members={data.members}
        invitations={data.invitations}
        currentUserRole={data.currentUserRole}
        subdomain={subdomain}
      />
    </div>
  );
}
