import { notFound, redirect } from 'next/navigation';
import { getOrderForCheckoutAction } from '@/app/actions/checkout';
import { CheckoutSuccess } from '@/components/checkout';
import { getCurrentUser } from '@/lib/auth';

interface CheckoutSuccessPageProps {
  params: Promise<{
    tenant: string;
    orderId: string;
  }>;
}

export default async function CheckoutSuccessPage({ params }: CheckoutSuccessPageProps) {
  const { tenant, orderId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/signin?callbackUrl=/t/${tenant}/checkout/success/${orderId}`);
  }

  const result = await getOrderForCheckoutAction(orderId);

  if ('error' in result) {
    notFound();
  }

  const order = result.data;

  // Verify order is confirmed
  if (order.status !== 'CONFIRMED') {
    redirect(`/t/${tenant}/checkout`);
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <CheckoutSuccess order={order} tenantSubdomain={tenant} />
      </main>
    </div>
  );
}
