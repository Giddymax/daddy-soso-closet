"use client";
import { useState, memo, useCallback } from "react";
import { ShoppingCart, Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product, Category } from "@/types";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { getCartStore } from "@/store/cartStore";

type ProductWithMeta = Product & { category?: Category; inventory_quantity?: number };

const SalonProductCard = memo(function SalonProductCard({
  product,
  storageKey,
}: {
  product: ProductWithMeta;
  storageKey: string;
}) {
  const addItem = getCartStore(storageKey)((s) => s.addItem);
  const cartQty = getCartStore(storageKey)(
    (s) => s.items.find((i) => i.product_id === product.id)?.quantity ?? 0
  );
  const [added, setAdded] = useState(false);

  const maxQty = product.inventory_quantity;
  const atMax = maxQty !== undefined && cartQty >= maxQty;

  const handleAdd = useCallback(() => {
    if (atMax) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      max_quantity: maxQty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, product, maxQty, atMax]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#8B5E3C]/10 hover:border-[#C4954A]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col">
      <div className="relative h-48 w-full bg-gradient-to-br from-[#FAF8F5] to-[#F0EBE3] overflow-hidden">
        {product.image_url ? (
          <SupabaseImage
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles size={36} className="text-[#C4954A]/30" />
          </div>
        )}
        {maxQty !== undefined && maxQty <= 3 && maxQty > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Only {maxQty} left
          </span>
        )}
        {maxQty === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-stone-200 text-stone-500 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#C4954A] font-semibold uppercase tracking-wide mb-1">
          Salon Product
        </p>
        <h4 className="font-semibold text-[#2C1A0E] text-sm leading-snug mb-1">{product.name}</h4>
        {product.description && (
          <p className="text-stone-400 text-xs mb-2 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-[#8B5E3C] mb-3">{formatCurrency(product.price)}</p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={atMax || maxQty === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              atMax || maxQty === 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : "bg-[#2C1A0E] hover:bg-[#8B5E3C] text-white"
            }`}
          >
            {atMax || maxQty === 0 ? (
              maxQty === 0 ? "Out of Stock" : "Max in cart"
            ) : added ? (
              <><Check size={15} /> Added</>
            ) : (
              <><ShoppingCart size={15} /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function SalonProductGrid({
  products,
  storageKey = "abaam",
  hideHeading = false,
}: {
  products: ProductWithMeta[];
  storageKey?: string;
  hideHeading?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <div className={hideHeading ? "" : "mt-12"}>
      {!hideHeading && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 bg-[#C4954A] rounded-full" />
            <h3 className="font-playfair text-xl font-bold text-[#2C1A0E]">Salon Products</h3>
            <div className="flex-1 h-px bg-[#C4954A]/20" />
          </div>
          <p className="text-stone-500 text-sm mb-6">
            Premium hair care and beauty products available at our salon — add them to your cart for pickup.
          </p>
        </>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <SalonProductCard key={p.id} product={p} storageKey={storageKey} />
        ))}
      </div>
    </div>
  );
}
