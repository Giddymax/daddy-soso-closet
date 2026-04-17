"use client";
import { useState, memo, useCallback } from "react";
import { ShoppingBag, AlertCircle, ShoppingCart, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product, Category } from "@/types";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { getCartStore } from "@/store/cartStore";

export interface BranchConfig {
  branchId: string;
  storageKey: string;
  branchName?: string;
}

type ProductWithMeta = Product & { category?: Category; inventory_quantity?: number };

interface ProductGalleryProps {
  products: ProductWithMeta[];
  categories: Category[];
  branchConfig?: BranchConfig;
}

const ProductCard = memo(function ProductCard({
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

  const handleAddToCart = useCallback(() => {
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
    <div className="card group overflow-hidden border border-stone-100 hover:border-[#C4954A]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative h-56 w-full bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden">
        {product.image_url ? (
          <SupabaseImage
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={40} className="text-[#8B5E3C]/25" />
          </div>
        )}
        {maxQty !== undefined && maxQty <= 3 && maxQty > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Only {maxQty} left
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-[#A67C5B] font-medium uppercase tracking-wide">
          {product.category?.name ?? "Uncategorized"}
        </span>
        <h4 className="font-semibold text-[#2C1A0E] mt-1 mb-1 text-sm leading-snug">
          {product.name}
        </h4>
        {product.description && (
          <p className="text-stone-400 text-xs mb-2 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-[#8B5E3C]">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={atMax}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            atMax
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : added
              ? "bg-green-500 text-white"
              : "bg-[#2C1A0E] hover:bg-[#8B5E3C] text-white"
          }`}
        >
          {atMax ? (
            "Max in cart"
          ) : added ? (
            <><Check size={15} /> Added</>
          ) : (
            <><ShoppingCart size={15} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
});

export default function ProductGallery({ products, categories, branchConfig }: ProductGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const storageKey = branchConfig?.storageKey ?? "main";

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category?.slug === activeCategory);

  return (
    <section id="products" className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#8B5E3C] font-semibold text-sm uppercase tracking-widest mb-2">
            Our Collection
          </p>
          <h2 className="section-title">Featured Products</h2>
          <div className="w-16 h-1 bg-[#C4954A] mx-auto mt-3 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-[#2C1A0E] text-white"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? "bg-[#2C1A0E] text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No products available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} storageKey={storageKey} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
