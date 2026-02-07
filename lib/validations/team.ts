import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']),
  title: z.string().max(100).optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'MEMBER']).optional(),
  title: z.string().max(100).nullable().optional(),
  tenantShowInProfile: z.boolean().optional(),
});

export type InviteMemberData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberData = z.infer<typeof updateMemberSchema>;
