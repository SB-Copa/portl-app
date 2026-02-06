'use server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get all organizer applications with tenant and owner details
 */
export async function getAllApplicationsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // TODO: Add admin role check when roles are implemented
    // if (user.role !== 'ADMIN') {
    //   return { error: 'Unauthorized: Admin access required' };
    // }

    const applications = await prisma.organizerApplication.findMany({
      include: {
        tenant: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { data: applications };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return { error: 'Failed to fetch applications' };
  }
}

/**
 * Get a single application by ID with full details including notes
 */
export async function getApplicationByIdAction(applicationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    let application = await prisma.organizerApplication.findUnique({
      where: { id: applicationId },
      include: {
        tenant: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      return { error: 'Application not found' };
    }

    // Set reviewStartedAt when admin first views a SUBMITTED application
    if (application.status === 'SUBMITTED' && !application.reviewStartedAt) {
      application = await prisma.organizerApplication.update({
        where: { id: applicationId },
        data: {
          reviewStartedAt: new Date(),
        },
        include: {
          tenant: {
            include: {
              owner: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          notes: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    return { data: application };
  } catch (error) {
    console.error('Error fetching application:', error);
    return { error: 'Failed to fetch application' };
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED',
  reviewNotes?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If approving or rejecting, add review metadata
    if (status === 'APPROVED' || status === 'REJECTED') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = user.id;
      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }
    }

    const application = await prisma.organizerApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    // If approved, activate the tenant
    if (status === 'APPROVED') {
      await prisma.tenant.update({
        where: { id: application.tenantId },
        data: { status: 'ACTIVE' },
      });
    }

    // If rejected, set tenant to inactive
    if (status === 'REJECTED') {
      await prisma.tenant.update({
        where: { id: application.tenantId },
        data: { status: 'INACTIVE' },
      });
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/applications');
    return { data: application };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { error: 'Failed to update application status' };
  }
}

/**
 * Approve an application
 */
export async function approveApplicationAction(
  applicationId: string,
  reviewNotes?: string
) {
  return updateApplicationStatusAction(applicationId, 'APPROVED', reviewNotes);
}

/**
 * Reject an application
 */
export async function rejectApplicationAction(
  applicationId: string,
  reviewNotes?: string
) {
  return updateApplicationStatusAction(applicationId, 'REJECTED', reviewNotes);
}

/**
 * Delete an application (and its tenant)
 */
export async function deleteApplicationAction(applicationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const application = await prisma.organizerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { error: 'Application not found' };
    }

    // Delete tenant (cascade will delete application)
    await prisma.tenant.delete({
      where: { id: application.tenantId },
    });

    revalidatePath('/admin/applications');
    return { success: true };
  } catch (error) {
    console.error('Error deleting application:', error);
    return { error: 'Failed to delete application' };
  }
}

/**
 * Add a note to an application
 */
export async function addApplicationNoteAction(
  applicationId: string,
  note: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!note || note.trim().length === 0) {
      return { error: 'Note cannot be empty' };
    }

    const applicationNote = await prisma.applicationNote.create({
      data: {
        applicationId,
        userId: user.id,
        note: note.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/applications');
    return { data: applicationNote };
  } catch (error) {
    console.error('Error adding note:', error);
    return { error: 'Failed to add note' };
  }
}

/**
 * Update an application note
 */
export async function updateApplicationNoteAction(
  noteId: string,
  note: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!note || note.trim().length === 0) {
      return { error: 'Note cannot be empty' };
    }

    // Verify note belongs to user or user is admin
    const existingNote = await prisma.applicationNote.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return { error: 'Note not found' };
    }

    if (existingNote.userId !== user.id) {
      // TODO: Check if user is admin when roles are implemented
      // if (user.role !== 'ADMIN') {
      //   return { error: 'Unauthorized' };
      // }
    }

    const updatedNote = await prisma.applicationNote.update({
      where: { id: noteId },
      data: {
        note: note.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        application: {
          select: {
            id: true,
          },
        },
      },
    });

    revalidatePath(`/admin/applications/${updatedNote.applicationId}`);
    revalidatePath('/admin/applications');
    return { data: updatedNote };
  } catch (error) {
    console.error('Error updating note:', error);
    return { error: 'Failed to update note' };
  }
}

/**
 * Delete an application note
 */
export async function deleteApplicationNoteAction(noteId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify note belongs to user or user is admin
    const existingNote = await prisma.applicationNote.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return { error: 'Note not found' };
    }

    if (existingNote.userId !== user.id) {
      // TODO: Check if user is admin when roles are implemented
      // if (user.role !== 'ADMIN') {
      //   return { error: 'Unauthorized' };
      // }
    }

    const applicationId = existingNote.applicationId;

    await prisma.applicationNote.delete({
      where: { id: noteId },
    });

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath('/admin/applications');
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { error: 'Failed to delete note' };
  }
}
