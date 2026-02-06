'use server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function getTenantAction(subdomain: string) {
  try {
    if (!subdomain) {
      return { error: 'Subdomain required' };
    }

    // Get tenant (no longer auto-creates since registration is required)
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    return { data: tenant };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return { error: 'Failed to fetch tenant' };
  }
}

export async function getApplicationAction(tenantId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!tenantId) {
      return { error: 'Tenant ID required' };
    }

    // Verify user owns the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    if (tenant.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Get or create application
    let application = await prisma.organizerApplication.findUnique({
      where: {
        tenantId: tenantId,
      },
    });

    if (!application) {
      application = await prisma.organizerApplication.create({
        data: {
          tenantId: tenantId,
          status: 'NOT_STARTED',
          currentStep: 1,
        },
      });
    }

    return { data: application };
  } catch (error) {
    console.error('Error fetching organizer application:', error);
    return { error: 'Failed to fetch application' };
  }
}

export async function registerOrganizerAction(data: {
  name: string;
  subdomain: string;
  businessEmail: string;
  businessPhone: string;
  contactEmail?: string;
  contactPhone?: string;
  sameAsBusinessContact: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!data.name || !data.subdomain || !data.businessEmail || !data.businessPhone) {
      return { error: 'All required fields are missing' };
    }

    // Validate contact info if different from business
    if (!data.sameAsBusinessContact) {
      if (!data.contactEmail || !data.contactPhone) {
        return { error: 'Contact email and phone are required when different from business contact' };
      }
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(data.subdomain)) {
      return { error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
    }

    // Check if subdomain is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingTenant) {
      return { error: 'This subdomain is already taken. Please choose another one.' };
    }

    // Create tenant and application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          subdomain: data.subdomain,
          name: data.name,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          contactEmail: data.sameAsBusinessContact ? data.businessEmail : data.contactEmail,
          contactPhone: data.sameAsBusinessContact ? data.businessPhone : data.contactPhone,
          sameAsBusinessContact: data.sameAsBusinessContact,
          status: 'INACTIVE',
          ownerId: user.id,
        },
      });

      const application = await tx.organizerApplication.create({
        data: {
          tenantId: tenant.id,
          status: 'NOT_STARTED',
          currentStep: 1,
        },
      });

      return { tenant, application };
    });

    return { data: { subdomain: result.tenant.subdomain } };
  } catch (error) {
    console.error('Error registering organizer:', error);
    return { error: 'Failed to register organizer. Please try again.' };
  }
}

export async function saveApplicationAction(
  tenantId: string,
  step: number,
  data: any,
  shouldExit: boolean = false
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    if (!tenantId) {
      return { error: 'Tenant ID required' };
    }

    // Verify user owns the tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { owner: true },
    });

    if (!tenant) {
      return { error: 'Tenant not found' };
    }

    if (tenant.ownerId !== user.id) {
      return { error: 'Unauthorized' };
    }

    // Get existing application or create new one
    let application = await prisma.organizerApplication.findUnique({
      where: {
        tenantId: tenantId,
      },
    });

    if (!application) {
      application = await prisma.organizerApplication.create({
        data: {
          tenantId: tenantId,
          status: 'IN_PROGRESS',
          currentStep: step,
        },
      });
    }

    // Check if application can be edited
    if (application.reviewStartedAt) {
      return { error: 'Application is under review and cannot be edited' };
    }

    // Update application based on step
    const updateData: any = {
      status: shouldExit ? 'IN_PROGRESS' : application.status,
      updatedAt: new Date(),
    };

    if (step === 1) {
      // Event Portfolio (4 parts)
      updateData.pastEvents = data.pastEvents;
      updateData.venuesWorkedWith = data.venues;
      updateData.artistsTalent = data.artistsTalent;
      updateData.references = data.references;
      if (!shouldExit) {
        updateData.currentStep = 2;
      }
    } else if (step === 2) {
      // Identity Verification
      updateData.governmentIdUrl = data.governmentIdUrl;
      updateData.selfieWithIdUrl = data.selfieWithIdUrl;
      updateData.businessIdUrl = data.businessIdUrl;
      if (!shouldExit) {
        updateData.currentStep = 3;
      }
    } else if (step === 3) {
      // Agreements
      updateData.tosAccepted = data.tosAccepted;
      updateData.organizerAgreementAccepted = data.organizerAgreementAccepted;
      updateData.privacyPolicyAccepted = data.privacyPolicyAccepted;
      updateData.communityGuidelinesAccepted = data.communityGuidelinesAccepted;
      if (!shouldExit) {
        updateData.currentStep = 4;
      }
    } else if (step === 4) {
      // Review & Submit
      updateData.status = 'SUBMITTED';
      updateData.submittedAt = new Date();
    }

    const updatedApplication = await prisma.organizerApplication.update({
      where: {
        id: application.id,
      },
      data: updateData,
    });

    return { data: updatedApplication };
  } catch (error) {
    console.error('Error updating organizer application:', error);
    return { error: 'Failed to update application' };
  }
}
