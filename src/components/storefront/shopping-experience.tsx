"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { money } from "@/lib/format";

type StoreProduct = {
  id: string; name: string; description: string | null; price: string;
  stockQuantity: number; imageUrl: string | null; category: string;
};
type CartLine = { productId: string; quantity: number };
type Props = { slug: string; currency: string; products: StoreProduct[]; initialCustomerEmail?: string; initialCustomerName?: string };

export function ShoppingExperience({ slug, currency, products, initialCustomerEmail = "", initialCustomerName = "" }: Props) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checkoutAttempt = useRef<string | null>(null);
  const storageKey = `vendora-cart:${slug}`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed.filter((line): line is CartLine =>
          typeof line?.productId === "string" && Number.isInteger(line?.quantity) && line.quantity > 0));
      }
    } catch { /* Storage may be unavailable; the cart still works for this session. */ }
    setReady(true);
  }, [storageKey]);

  useEffect(() => { if (ready) { try { window.localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Keep the in-memory cart usable when storage is full or blocked. */ } } }, [cart, ready, storageKey]);

  const availableProducts = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const lines = cart.flatMap((line) => {
    const product = availableProducts.get(line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0);

  function add(productId: string) {
    checkoutAttempt.current = null;
    setCart((current) => {
      const product = availableProducts.get(productId);
      if (!product || product.stockQuantity < 1) return current;
      const existing = current.find((line) => line.productId === productId);
      if (existing) return current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(product.stockQuantity, line.quantity + 1) } : line);
      return [...current, { productId, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function changeQuantity(productId: string, quantity: number) {
    checkoutAttempt.current = null;
    const product = availableProducts.get(productId);
    if (!product) return;
    setCart((current) => quantity < 1 ? current.filter((line) => line.productId !== productId) : current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(product.stockQuantity, quantity) } : line));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!lines.length) { setError("Your cart is empty."); return; }
    setBusy(true);
    try {
      const idempotencyKey = checkoutAttempt.current ?? window.crypto.randomUUID();
      checkoutAttempt.current = idempotencyKey;
      const response = await fetch(`/api/store/${encodeURIComponent(slug)}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerEmail, idempotencyKey, items: lines.map(({ productId, quantity }) => ({ productId, quantity })) })
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409 || response.status === 502) checkoutAttempt.current = null;
        throw new Error(result.error || "We couldn't submit your order. Please try again.");
      }
      if (!result.authorizationUrl || typeof result.authorizationUrl !== "string") throw new Error(result.message || "The payment page could not be opened. Please try again.");
      window.location.assign(result.authorizationUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <>
    <div className="store-toolbar"><p>Thoughtfully selected. Ready to discover.</p><button className="store-cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${itemCount} items`}><span>Shopping bag</span><b>{itemCount}</b></button></div>
    <div className="store-grid">{products.map((product) => <article className="store-product" key={product.id}>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy"/> : <div className="product-placeholder">V.</div>}<div className="store-product-copy"><span className="store-product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description || "A considered addition to your collection."}</p><div className="store-product-bottom"><b>{money(product.price, currency)}</b><button type="button" onClick={() => add(product.id)} disabled={product.stockQuantity < 1}>{product.stockQuantity > 0 ? "Add to bag" : "Out of stock"}</button></div></div></article>)}</div>
    {cartOpen && <div className="store-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="store-drawer" role="dialog" aria-modal="true" aria-labelledby="store-cart-title"><header><div><span className="store-drawer-kicker">YOUR SELECTION</span><h2 id="store-cart-title">Shopping bag <small>({itemCount})</small></h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Close shopping bag">×</button></header>
      {!lines.length ? <div className="store-cart-empty"><span>◇</span><h3>Your bag is waiting</h3><p>Explore the collection and add something you love.</p><button type="button" onClick={() => setCartOpen(false)}>Continue browsing</button></div> : <><div className="store-cart-lines">{lines.map(({ product, quantity }) => <div className="store-cart-line" key={product.id}>{product.imageUrl ? <img src={product.imageUrl} alt=""/> : <div className="product-placeholder">V.</div>}<div className="store-cart-line-info"><b>{product.name}</b><span>{money(product.price, currency)}</span><div className="store-quantity"><button type="button" onClick={() => changeQuantity(product.id, quantity - 1)} aria-label={`Remove one ${product.name}`}>−</button><span>{quantity}</span><button type="button" onClick={() => changeQuantity(product.id, quantity + 1)} disabled={quantity >= product.stockQuantity} aria-label={`Add one ${product.name}`}>+</button></div></div><button className="store-remove" type="button" onClick={() => changeQuantity(product.id, 0)}>Remove</button></div>)}</div><div className="store-cart-summary"><div><span>Subtotal</span><b>{money(total, currency)}</b></div><small>Prices are in {currency}. Shipping details and any applicable fees are confirmed by the merchant.</small>{currency === "NGN" ? <button type="button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continue to checkout</button> : <><p className="store-payment-notice">Paystack checkout is currently available for NGN stores only. This store is configured for {currency}.</p><button type="button" disabled>Checkout unavailable</button></>}</div></>}
    </aside></div>}
    {checkoutOpen && <div className="store-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setCheckoutOpen(false); }}><section className="store-checkout" role="dialog" aria-modal="true" aria-labelledby="store-checkout-title"><header><div><span className="store-drawer-kicker">ALMOST THERE</span><h2 id="store-checkout-title">Your details</h2></div><button type="button" onClick={() => setCheckoutOpen(false)} disabled={busy} aria-label="Close checkout">×</button></header><div className="store-checkout-total"><span>Order subtotal</span><b>{money(total, currency)}</b></div><form onSubmit={submitOrder}><label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={customerName} onChange={(event) => { checkoutAttempt.current = null; setCustomerName(event.target.value); }} placeholder="Your name"/></label><label>Email address<input required type="email" maxLength={200} autoComplete="email" value={customerEmail} onChange={(event) => { checkoutAttempt.current = null; setCustomerEmail(event.target.value); }} placeholder="you@example.com"/></label>{error && <p className="store-form-error" role="alert">{error}</p>}<p className="store-payment-notice">Secure checkout powered by Paystack. Your order total is calculated again on our server and payment is confirmed before the order is marked paid.</p><button type="submit" disabled={busy}>{busy ? "Connecting to Paystack…" : "Continue to secure payment"}</button></form></section></div>}
  </>;
}
