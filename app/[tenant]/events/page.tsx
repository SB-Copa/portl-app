import React from 'react'

type EventsPageProps = {
    params: Promise<{ tenant: string }>;
}
export default async function EventsPage({ params }: EventsPageProps) {
    const { tenant } = await params;

    return (
        <div>EventsPage</div>
    )
}
