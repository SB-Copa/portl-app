import { notFound, redirect } from 'next/navigation';
import { getOrderForCheckoutAction, verifyAndConfirmPaymentAction } from '@/app/actions/checkout';
import { CheckoutSuccess } from '@/components/checkout';
import { getCurrentUser } from '@/lib/auth';
import { mainUrl, tenantUrl } from '@/lib/url';
import { PaymentProcessing } from '@/components/checkout/payment-processing';

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
    redirect(mainUrl(`/auth/signin?callbackUrl=${encodeURIComponent(tenantUrl(tenant, `/checkout/success/${orderId}`))}`));
  }

  const result = await getOrderForCheckoutAction(orderId);

  if ('error' in result) {
    notFound();
  }

  const order = result.data;

  // Order already confirmed - show success
  if (order.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <CheckoutSuccess order={order} tenantSubdomain={tenant} />
        </main>
      </div>
    );
  }

  // Order is pending - try synchronous verification
  if (order.status === 'PENDING' && order.paymentSessionId) {
    const verifyResult = await verifyAndConfirmPaymentAction(orderId);

    if (!('error' in verifyResult) && verifyResult.data.status === 'confirmed') {
      // Re-fetch the order to get updated data with tickets
      const updatedResult = await getOrderForCheckoutAction(orderId);
      if (!('error' in updatedResult)) {
        return (
          <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-12">
              <CheckoutSuccess order={updatedResult.data} tenantSubdomain={tenant} />
            </main>
          </div>
        );
      }
    }

    // Payment still processing - show processing state with auto-refresh
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <PaymentProcessing orderId={orderId} tenantSubdomain={tenant} />
        </main>
      </div>
    );
  }

  // Order is cancelled or other status
  if (order.status === 'CANCELLED') {
    redirect('/checkout');
  }

  // Fallback - redirect to checkout
  redirect('/checkout');
}
