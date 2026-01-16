'use server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getTenantAction(subdomain: string) {
  try {
    if (!subdomain) {
      return { error: 'Subdomain required' };
    }

    // Get or create tenant
    let tenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          subdomain,
          name: subdomain,
        },
      });
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

    // Get or create application
    let application = await prisma.organizerApplication.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenantId,
        },
      },
    });

    if (!application) {
      application = await prisma.organizerApplication.create({
        data: {
          userId: user.id,
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

    // Get existing application or create new one
    let application = await prisma.organizerApplication.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenantId,
        },
      },
    });

    if (!application) {
      application = await prisma.organizerApplication.create({
        data: {
          userId: user.id,
          tenantId: tenantId,
          status: 'IN_PROGRESS',
          currentStep: step,
        },
      });
    }

    // Update application based on step
    const updateData: any = {
      status: shouldExit ? 'IN_PROGRESS' : application.status,
      updatedAt: new Date(),
    };

    if (step === 1) {
      updateData.organizerType = data.organizerType;
      updateData.organizerDescription = data.organizerDescription;
      if (!shouldExit) {
        updateData.currentStep = 2;
      }
    } else if (step === 2) {
      updateData.eventPortfolio = data;
      if (!shouldExit) {
        updateData.currentStep = 3;
      }
    } else if (step === 3) {
      updateData.complianceAcknowledged = true;
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
