"use client";
import { useState, memo } from "react";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product, Category } from "@/types";
import SupabaseImage from "@/components/shared/SupabaseImage";

interface ProductGalleryProps {
  products: (Product & { category?: Category })[];
  categories: Category[];
}

const ProductCard = memo(function ProductCard({
  product,
}: {
  product: Product & { category?: Category };
}) {
  return (
    <div className="card group overflow-hidden border border-stone-100 hover:border-[#C4954A]/40 transition-all duration-300 hover:-translate-y-1">
      {/* Image container — fixed height, overflow hidden */}
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
      </div>

      <div className="p-4">
        <span className="text-xs text-[#A67C5B] font-medium uppercase tracking-wide">
          {product.category?.name ?? "Uncategorized"}
        </span>
        <h4 className="font-semibold text-[#2C1A0E] mt-1 mb-1 text-sm leading-snug">
          {product.name}
        </h4>
        {product.description && (
          <p className="text-stone-400 text-xs mb-2 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#8B5E3C]">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] text-stone-400 italic">No discount</span>
        </div>
      </div>
    </div>
  );
});

export default function ProductGallery({ products, categories }: ProductGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");

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

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No products available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
