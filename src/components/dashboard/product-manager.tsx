"use client";

import { useMemo, useState, useTransition } from "react";
import { archiveProduct, saveProduct, updateProduct } from "@/lib/actions/business";
import { money } from "@/lib/format";
import type { products } from "@/db/schema";
import { Archive, Edit3, PackagePlus, Search, X } from "lucide-react";

type Product = typeof products.$inferSelect;
type Draft = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
};

const blankDraft: Draft = {
  name: "", description: "", price: "", stockQuantity: "0",
  category: "General", imageUrl: "", isActive: true
};

export function ProductManager({
  businessId, currency, initialProducts
}: {
  businessId: string;
  currency: string;
  initialProducts: Product[];
}) {
  const [items, setItems] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) =>
      !term || item.name.toLowerCase().includes(term) ||
      (item.category ?? "").toLowerCase().includes(term)
    );
  }, [items, query]);

  function openCreate() {
    setEditing(null);
    setDraft(blankDraft);
    setMessage("");
    setShowForm(true);
  }

  function openEdit(item: Product) {
    setEditing(item);
    setDraft({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      stockQuantity: String(item.stockQuantity),
      category: item.category,
      imageUrl: item.imageUrl ?? "",
      isActive: item.isActive
    });
    setMessage("");
    setShowForm(true);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const payload = {
        businessId,
        name: draft.name,
        description: draft.description,
        price: draft.price,
        stockQuantity: draft.stockQuantity,
        category: draft.category,
        imageUrl: draft.imageUrl,
        isActive: draft.isActive
      };
      const result = editing
        ? await updateProduct({ ...payload, productId: editing.id })
        : await saveProduct(payload);
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      if (editing) {
        setItems((current) => current.map((item) => item.id === editing.id ? {
          ...item,
          name: draft.name.trim(),
          description: draft.description,
          price: Number(draft.price).toFixed(2),
          stockQuantity: Number(draft.stockQuantity),
          category: draft.category,
          imageUrl: draft.imageUrl || null,
          isActive: draft.isActive
        } : item));
      } else {
        // Refresh the server-rendered product list so the database remains the source of truth.
        window.location.reload();
        return;
      }
      setShowForm(false);
    });
  }

  function archive(item: Product) {
    if (!window.confirm(`Archive “${item.name}”? It will no longer appear in your public store.`)) return;
    startTransition(async () => {
      const result = await archiveProduct({ productId: item.id, businessId });
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, isActive: false } : row));
    });
  }

  return (
    <section className="product-manager" id="products">
      <div className="manager-heading">
        <div>
          <span className="eyebrow">YOUR CATALOGUE</span>
          <h2>Products</h2>
          <p>Keep product information, pricing and stock up to date.</p>
        </div>
        <button className="button button-primary" type="button" onClick={openCreate}>
          <PackagePlus size={16} /> Add product
        </button>
      </div>

      {message && <p className="manager-message" role="alert">{message}</p>}

      {showForm && (
        <form className="product-form" onSubmit={submit}>
          <div className="product-form-heading">
            <h3>{editing ? "Edit product" : "Add a product"}</h3>
            <button type="button" className="icon-button" aria-label="Close form" onClick={() => setShowForm(false)}><X size={18}/></button>
          </div>
          <div className="product-form-grid">
            <label>Product name<input required minLength={1} maxLength={120} value={draft.name} onChange={(e) => setDraft({...draft,name:e.target.value})}/></label>
            <label>Category<input required maxLength={80} value={draft.category} onChange={(e) => setDraft({...draft,category:e.target.value})}/></label>
            <label>Price<input required type="number" min="0" max="9999999999" step="0.01" value={draft.price} onChange={(e) => setDraft({...draft,price:e.target.value})}/></label>
            <label>Stock quantity<input required type="number" min="0" step="1" value={draft.stockQuantity} onChange={(e) => setDraft({...draft,stockQuantity:e.target.value})}/></label>
            <label className="form-wide">Image URL <input type="url" placeholder="https://…" value={draft.imageUrl} onChange={(e) => setDraft({...draft,imageUrl:e.target.value})}/></label>
            <label className="form-wide">Description<textarea rows={3} maxLength={2000} value={draft.description} onChange={(e) => setDraft({...draft,description:e.target.value})}/></label>
          </div>
          <label className="inline-check"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({...draft,isActive:e.target.checked})}/> Visible in public store</label>
          <div className="product-form-actions">
            <button className="button button-quiet" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="button button-primary" disabled={isPending}>{isPending ? "Saving…" : editing ? "Save changes" : "Create product"}</button>
          </div>
        </form>
      )}

      <div className="catalogue-toolbar">
        <label className="catalogue-search"><Search size={16}/><input aria-label="Search products" placeholder="Search products or categories" value={query} onChange={(e) => setQuery(e.target.value)}/></label>
        <span>{visible.length} of {items.length} products</span>
      </div>

      {visible.length ? (
        <div className="catalogue-list">
          {visible.map((item) => (
            <article className={`catalogue-item${!item.isActive ? " is-archived" : ""}`} key={item.id}>
              {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="catalogue-placeholder">V.</div>}
              <div className="catalogue-product-copy">
                <b>{item.name}</b>
                <small>{item.category} · {item.stockQuantity} in stock · {item.isActive ? "Published" : "Archived"}</small>
              </div>
              <strong>{money(item.price,currency)}</strong>
              <div className="catalogue-actions">
                <button type="button" className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => openEdit(item)}><Edit3 size={16}/></button>
                {item.isActive && <button type="button" className="icon-button" aria-label={`Archive ${item.name}`} onClick={() => archive(item)} disabled={isPending}><Archive size={16}/></button>}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="manager-empty">{query ? "No products match that search." : "Your catalogue is ready for its first product. Add one to start building your storefront."}</p>}
    </section>
  );
}
