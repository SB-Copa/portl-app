import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt } from 'lucide-react'
import Link from 'next/link'
import { getMyOrdersAction } from '@/app/actions/orders'
import { OrdersList } from '@/components/account'

export default async function OrdersPage() {
    noStore()
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/signin?callbackUrl=/account/orders')
    }

    const result = await getMyOrdersAction()
    const orders = 'data' in result ? result.data : []

    return (
        <div className="container mx-auto px-6 py-8 max-w-5xl space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <p className="text-muted-foreground mt-1">
                    View your past purchases and receipts
                </p>
            </div>

            {orders.length === 0 ? (
                /* Empty State */
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Receipt className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg mb-2">No order history</CardTitle>
                        <CardDescription className="max-w-sm mb-6">
                            You haven&apos;t made any purchases yet. Start by browsing our exciting events!
                        </CardDescription>
                        <Button asChild>
                            <Link href="/#events-section">
                                Browse Events
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <OrdersList orders={orders} />
            )}
        </div>
    )
}
