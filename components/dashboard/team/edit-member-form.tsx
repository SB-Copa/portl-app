'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { updateMemberSchema, type UpdateMemberData } from '@/lib/validations/team';
import { updateTeamMemberAction } from '@/app/actions/tenant-members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { TenantMemberRole } from '@/prisma/generated/prisma/client';

interface EditMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id: string;
    role: TenantMemberRole;
    title: string | null;
    tenantShowInProfile: boolean;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  subdomain: string;
  isOwner: boolean;
}

export function EditMemberForm({ open, onOpenChange, member, subdomain, isOwner }: EditMemberFormProps) {
  const router = useRouter();

  const memberName = member.user.firstName && member.user.lastName
    ? `${member.user.firstName} ${member.user.lastName}`
    : member.user.email;

  const form = useForm<UpdateMemberData>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      role: member.role,
      title: member.title ?? '',
      tenantShowInProfile: member.tenantShowInProfile,
    },
  });

  const onSubmit = async (data: UpdateMemberData) => {
    const result = await updateTeamMemberAction(subdomain, member.id, data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Member updated');
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update {memberName}&apos;s role and details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isOwner && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(value) => form.setValue('role', value as TenantMemberRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Resident DJ, Event Manager"
              value={form.watch('title') ?? ''}
              onChange={(e) => form.setValue('title', e.target.value || null)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visibility">Show on public profile</Label>
              <p className="text-xs text-muted-foreground">Display this member on the tenant&apos;s public page</p>
            </div>
            <Switch
              id="visibility"
              checked={form.watch('tenantShowInProfile')}
              onCheckedChange={(checked) => form.setValue('tenantShowInProfile', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
