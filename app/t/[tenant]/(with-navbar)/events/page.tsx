import { notFound } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { getPublicEventsForTenant } from '@/app/actions/public-events'
import { PublicEventsList } from '@/components/public/events/public-events-list'

type EventsPageProps = {
    params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: EventsPageProps) {
    const { tenant: subdomain } = await params
    const tenant = await getCurrentTenant(subdomain)

    if (!tenant) {
        return {
            title: 'Events Not Found',
        }
    }

    return {
        title: `Events | ${tenant.name}`,
        description: `Browse upcoming events from ${tenant.name}`,
    }
}

export default async function EventsPage({ params }: EventsPageProps) {
    const { tenant: subdomain } = await params
    const tenant = await getCurrentTenant(subdomain)

    if (!tenant) {
        notFound()
    }

    const result = await getPublicEventsForTenant(subdomain)

    if (result.error) {
        notFound()
    }

    const events = result.data ?? []

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Upcoming Events
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Discover events from {tenant.name}
                    </p>
                </div>

                <PublicEventsList
                    events={events}
                    tenantSubdomain={subdomain}
                    tenantName={tenant.name}
                />
            </div>
        </div>
    )
}
