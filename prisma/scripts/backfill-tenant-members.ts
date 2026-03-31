/**
 * Backfill script: Creates TenantMember records for existing tenants
 * and updates users with ORGANIZER role to USER.
 *
 * Run with: npx tsx prisma/scripts/backfill-tenant-members.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@/prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting TenantMember backfill...');

  // 1. Create TenantMember(role: OWNER) for every existing Tenant
  const tenants = await prisma.tenant.findMany({
    select: { id: true, ownerId: true, subdomain: true },
  });

  let created = 0;
  let skipped = 0;

  for (const tenant of tenants) {
    const existing = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: {
          userId: tenant.ownerId,
          tenantId: tenant.id,
        },
      },
    });

    if (existing) {
      console.log(`  Skipping ${tenant.subdomain} — member already exists`);
      skipped++;
      continue;
    }

    await prisma.tenantMember.create({
      data: {
        userId: tenant.ownerId,
        tenantId: tenant.id,
      },
    });
    console.log(`  Created OWNER membership for ${tenant.subdomain}`);
    created++;
  }

  console.log(`\nTenantMember backfill: ${created} created, ${skipped} skipped`);

  // 2. Update users with ORGANIZER role to USER
  // Note: This only works BEFORE the enum removal migration.
  // If the ORGANIZER enum value has already been removed, this step is skipped.
  try {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE users SET role = 'USER' WHERE role = 'ORGANIZER'`
    );
    console.log(`Updated ${updated} users from ORGANIZER to USER`);
  } catch {
    console.log('Skipping ORGANIZER→USER migration (enum value already removed)');
  }

  console.log('\nBackfill complete!');
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
