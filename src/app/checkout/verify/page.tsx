import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orders } from "@/db/schema";
import { markOrderPaid, releaseOrderReservation, verifyPaystackTransaction } from "@/lib/payments/paystack";
import { CheckoutVerificationCleanup } from "@/components/storefront/checkout-verification-cleanup";

export const dynamic = "force-dynamic";

export default async function CheckoutVerificationPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  let paid = false;
  let orderId: string | null = null;
  let storeSlug: string | null = null;
  let accountOrder = false;
  let message = "We could not confirm this payment yet. If you completed checkout, allow a moment and refresh this page.";

  if (reference && /^[A-Za-z0-9.=\-]{8,100}$/.test(reference)) {
    try {
      const verified = await verifyPaystackTransaction(reference);
      paid = await markOrderPaid(reference, verified);
      const [order] = await db.select({ id: orders.id, paymentStatus: orders.paymentStatus, customerId: orders.customerId, businessSlug: businesses.slug })
        .from(orders).innerJoin(businesses, eq(orders.businessId, businesses.id))
        .where(eq(orders.paymentReference, reference)).limit(1);
      orderId = order?.id ?? null;
      storeSlug = order?.businessSlug ?? null;
      accountOrder = Boolean(order?.customerId);
      if (paid) message = "Your payment has been verified. Your order is confirmed.";
      else if (verified.status === "failed" && order?.paymentStatus === "pending") {
        if (order) await releaseOrderReservation(order.id, "failed");
        message = "The payment was not successful. Your reserved items have been released; you can return to the store and try again.";
      }
    } catch (error) {
      console.error("Checkout verification failed", error);
    }
  }

  return <main className="auth-page"><CheckoutVerificationCleanup storeSlug={paid ? storeSlug : null}/><section className="auth-card checkout-result">
    <span className="eyebrow">VENDORA CHECKOUT</span>
    <div className={`checkout-result-mark ${paid ? "is-success" : "is-pending"}`}>{paid ? "✓" : "…"}</div>
    <h1>{paid ? "Payment confirmed" : "Payment not confirmed"}</h1>
    <p>{message}</p>
    {orderId && <small>Order reference: {orderId.slice(0, 8).toUpperCase()}</small>}
    {reference && <small>Payment reference: {reference}</small>}
    <div className="checkout-result-actions">{accountOrder ? <Link className="button button-primary" href="/account/orders">View my orders</Link> : storeSlug ? <Link className="button button-primary" href={`/store/${storeSlug}`}>Return to the store</Link> : null}<Link className="button button-secondary" href="/">Back to Vendora</Link></div>
    <small>Never share your payment reference or account password with anyone.</small>
  </section></main>;
}
