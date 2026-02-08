'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserPlus, Mail, Trash2, Clock } from 'lucide-react';
import { removeTeamMemberAction, revokeInvitationAction } from '@/app/actions/tenant-members';
import { InviteMemberForm } from './invite-member-form';
import { EditMemberForm } from './edit-member-form';
import { toast } from 'sonner';
import type { TenantMemberRole } from '@/prisma/generated/prisma/client';
import { formatDistanceToNow } from 'date-fns';

const roleColors: Record<string, string> = {
  OWNER: 'bg-amber-500/20 text-amber-400',
  ADMIN: 'bg-purple-500/20 text-purple-400',
  MANAGER: 'bg-blue-500/20 text-blue-400',
  MEMBER: 'bg-muted text-muted-foreground',
};

interface Member {
  id: string;
  role: TenantMemberRole;
  title: string | null;
  userShowInProfile: boolean;
  tenantShowInProfile: boolean;
  createdAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: TenantMemberRole;
  title: string | null;
  expiresAt: Date;
  createdAt: Date;
  inviter: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface TeamSectionProps {
  members: Member[];
  invitations: Invitation[];
  currentUserRole: TenantMemberRole;
  subdomain: string;
}

export function TeamSection({ members, invitations, currentUserRole, subdomain }: TeamSectionProps) {
  const router = useRouter();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const isOwner = currentUserRole === 'OWNER';

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;

    const result = await removeTeamMemberAction(subdomain, memberId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Member removed');
      router.refresh();
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    const result = await revokeInvitationAction(subdomain, invitationId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invitation revoked');
      router.refresh();
    }
  };

  const formatName = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    return email;
  };

  return (
    <div className="space-y-6">
      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>{members.length} team member{members.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const name = formatName(member.user.firstName, member.user.lastName, member.user.email);
              const canManage = member.role !== 'OWNER' && (isOwner || (currentUserRole === 'ADMIN' && member.role !== 'ADMIN'));

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.title && (
                      <span className="text-xs text-muted-foreground">{member.title}</span>
                    )}
                    <Badge className={roleColors[member.role]}>{member.role}</Badge>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingMember(member)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id, name)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Pending Invitations
            </CardTitle>
            <CardDescription>{invitations.length} pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {invitation.title && (
                      <span className="text-xs text-muted-foreground">{invitation.title}</span>
                    )}
                    <Badge className={roleColors[invitation.role]}>{invitation.role}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteMemberForm
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        subdomain={subdomain}
      />

      {/* Edit Dialog */}
      {editingMember && (
        <EditMemberForm
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
          member={editingMember}
          subdomain={subdomain}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
