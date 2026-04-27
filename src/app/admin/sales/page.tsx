"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Loader2, CheckCircle, Scissors } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import type { CartItem, Product, Branch } from "@/types";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import CustomerInfoModal from "@/components/dashboard/CustomerInfoModal";

const SALON_SERVICES_BASE = [
  { id: "salon-relaxing",   name: "Hair Relaxing",           priceKey: "salon_service_relax_price",     defaultPrice: 80,  duration: "2–3 hrs" },
  { id: "salon-braiding",   name: "Hair Braiding",           priceKey: "salon_service_braiding_price",  defaultPrice: 120, duration: "3–5 hrs" },
  { id: "salon-weaving",    name: "Hair Weaving",            priceKey: "salon_service_weaving_price",   defaultPrice: 150, duration: "2–4 hrs" },
  { id: "salon-styling",    name: "Hair Styling",            priceKey: "salon_service_styling_price",   defaultPrice: 60,  duration: "1–2 hrs" },
  { id: "salon-treatment",  name: "Treatment & Conditioning",priceKey: "salon_service_treatment_price", defaultPrice: 50,  duration: "1 hr"   },
  { id: "salon-dreadlocks", name: "Dreadlocks",              priceKey: "salon_service_dreads_price",    defaultPrice: 100, duration: "2–4 hrs" },
];

export default function AdminSalesPage() {
  const { staff } = useAuthStore();
  const supabase = createBrowserClient();
  const [phone, setPhone] = useState("0594299293");
  const [salonPrices, setSalonPrices] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"products" | "salon">("products");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [products, setProducts] = useState<(Product & { inventory_quantity: number })[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "card">("cash");
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<null | {
    receiptNumber: string; items: CartItem[]; total: number; payment: string;
    customerName: string; customerPhone: string;
  }>(null);

  useEffect(() => {
    supabase.from("branches").select("*").order("name").then(({ data }) => {
      setBranches(data ?? []);
      if (data?.length) setSelectedBranch(data[0]);
      setLoadingBranches(false);
    });
    const priceKeys = SALON_SERVICES_BASE.map((s) => s.priceKey);
    supabase.from("site_settings").select("key, value")
      .in("key", ["phone_number", ...priceKeys])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((r) => { map[r.key] = r.value; });
        if (map.phone_number) setPhone(map.phone_number);
        const prices: Record<string, number> = {};
        SALON_SERVICES_BASE.forEach((s) => {
          const v = parseFloat(map[s.priceKey]);
          if (!isNaN(v)) prices[s.id] = v;
        });
        setSalonPrices(prices);
      });
  }, [supabase]);

  const loadProducts = useCallback(async () => {
    if (!selectedBranch) return;
    setLoadingProducts(true);
    const { data } = await supabase
      .from("inventory")
      .select("quantity, product:products(*, category:categories(name, slug))")
      .eq("branch_id", selectedBranch.id)
      .gt("quantity", 0);
    setProducts(
      (data ?? []).map((inv) => ({
        ...(inv.product as unknown as Product),
        inventory_quantity: inv.quantity,
      }))
    );
    setLoadingProducts(false);
  }, [selectedBranch, supabase]);

  useEffect(() => {
    setCart([]);
    setSearch("");
    loadProducts();
  }, [loadProducts]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const salonProducts = products.filter((p) => (p as any).category?.slug === "salon-products");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boutiqueProducts = products.filter((p) => (p as any).category?.slug !== "salon-products");
  const filtered = boutiqueProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSalonBranch = selectedBranch?.type === "boutique_salon";
  const salonServices = SALON_SERVICES_BASE.map((s) => ({ ...s, price: salonPrices[s.id] ?? s.defaultPrice }));

  function addSalonToCart(svc: { id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === svc.id);
      if (existing) return prev.map((i) => i.product_id === svc.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: svc.id, name: svc.name, price: svc.price, quantity: 1, max_quantity: 999 }];
    });
  }

  function addToCart(product: Product & { inventory_quantity: number }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.inventory_quantity) return prev;
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id, name: product.name,
        price: product.price, quantity: 1,
        max_quantity: product.inventory_quantity,
        image_url: product.image_url,
      }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product_id !== id) return i;
        const q = Math.max(1, Math.min(i.quantity + delta, i.max_quantity));
        return { ...i, quantity: q };
      })
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== id));
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function requestSale() {
    if (!cart.length || !staff || !selectedBranch) return;
    setShowCustomerModal(true);
  }

  async function completeSale(customerName: string, customerPhone: string) {
    if (!cart.length || !staff || !selectedBranch) return;
    setShowCustomerModal(false);
    setSubmitting(true);
    try {
      const { data: receiptData } = await supabase.rpc("generate_receipt_number", {
        branch_name: selectedBranch.name,
      });
      const receiptNumber = receiptData as string;

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          branch_id: selectedBranch.id, staff_id: staff.id,
          total_amount: total, payment_method: paymentMethod,
          receipt_number: receiptNumber,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const productItems = cart.filter((i) => !i.product_id.startsWith("salon-"));
      if (productItems.length) {
        const { error: itemsError } = await supabase.from("sale_items").insert(
          productItems.map((i) => ({
            sale_id: sale.id, product_id: i.product_id,
            quantity: i.quantity, unit_price: i.price,
          }))
        );
        if (itemsError) throw itemsError;
      }

      const salonItems = cart.filter((i) => i.product_id.startsWith("salon-"));
      if (salonItems.length) {
        await supabase.from("salon_sale_items").insert(
          salonItems.map((i) => ({
            sale_id: sale.id,
            service_name: i.name,
            quantity: i.quantity,
            unit_price: i.price,
          }))
        );
      }

      fetch("/api/notify-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: selectedBranch.display_name, receiptNumber,
          items: cart.filter((i) => !i.product_id.startsWith("salon-")).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          salonItems: cart.filter((i) => i.product_id.startsWith("salon-")).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total, staffName: staff.full_name, paymentMethod,
          customerName, customerPhone,
        }),
      }).catch(() => {});

      setCompletedSale({ receiptNumber, items: [...cart], total, payment: paymentMethod, customerName, customerPhone });
      setCart([]);
    } catch (err) {
      console.error(err);
      alert("Sale failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingBranches) {
    return <div className="skeleton h-12 rounded-xl w-48" />;
  }

  return (
    <div className="space-y-4">
      {/* Branch selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Make a Sale</h1>
        </div>
        <div className="flex gap-2 ml-auto">
          {branches.map((b) => (
            <button
              type="button"
              key={b.id}
              onClick={() => setSelectedBranch(b)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedBranch?.id === b.id
                  ? "bg-[#0077B6] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#0077B6]"
              }`}
            >
              {b.display_name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product / Salon List */}
        <div className="lg:col-span-2 space-y-4">
          {isSalonBranch && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              <button type="button" onClick={() => setTab("products")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "products" ? "bg-white text-[#023E8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                Products
              </button>
              <button type="button" onClick={() => setTab("salon")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "salon" ? "bg-white text-[#023E8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Scissors size={14} /> Abaam Salon
              </button>
            </div>
          )}

          {tab === "products" && (
            <>
              <input type="text" placeholder="Search products…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none" />
              {loadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-12">No products in stock for this branch.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {filtered.map((p) => (
                    <button type="button" key={p.id} onClick={() => addToCart(p)}
                      className="card overflow-hidden text-left hover:border-[#D4AF37] border border-transparent transition-all hover:-translate-y-0.5">
                      <div className="relative w-full h-28 bg-gray-100">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="font-semibold text-xs text-[#023E8A] leading-snug mb-1 line-clamp-2">{p.name}</p>
                        <p className="text-[#0077B6] font-bold text-sm">{formatCurrency(p.price)}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{p.inventory_quantity} in stock</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "salon" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Services</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {salonServices.map((s) => (
                    <button type="button" key={s.id} onClick={() => addSalonToCart(s)}
                      className="card p-4 text-left hover:border-[#D4AF37] border border-transparent transition-all hover:-translate-y-0.5 group">
                      <div className="w-8 h-8 bg-[#0077B6]/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/20 transition-colors">
                        <Scissors size={15} className="text-[#0077B6]" />
                      </div>
                      <p className="font-semibold text-xs text-[#023E8A] leading-snug mb-1">{s.name}</p>
                      <p className="text-[#0077B6] font-bold text-sm">{formatCurrency(s.price)}</p>
                      <p className="text-gray-400 text-xs mt-1">{s.duration}</p>
                    </button>
                  ))}
                </div>
              </div>

              {salonProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Salon Products</p>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {salonProducts.map((p) => (
                      <button type="button" key={p.id} onClick={() => addToCart(p)}
                        className="card overflow-hidden text-left hover:border-[#D4AF37] border border-transparent transition-all hover:-translate-y-0.5">
                        <div className="relative w-full h-24 bg-gray-100">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="font-semibold text-xs text-[#023E8A] leading-snug mb-1 line-clamp-2">{p.name}</p>
                          <p className="text-[#0077B6] font-bold text-sm">{formatCurrency(p.price)}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{p.inventory_quantity} in stock</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="card p-5 flex flex-col gap-4 h-fit sticky top-6">
          <h2 className="font-semibold text-[#023E8A] flex items-center gap-2">
            <ShoppingCart size={18} /> Cart ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Add items from the left</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-[#0077B6]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" title="Decrease quantity" onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0077B6] hover:text-white transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button type="button" title="Increase quantity" onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#0077B6] hover:text-white transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <button type="button" title="Remove item" onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment Method</label>
            <div className="flex gap-2">
              {(["cash", "momo", "card"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${paymentMethod === m ? "bg-[#0077B6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {m === "momo" ? "MoMo" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-[#023E8A]">{formatCurrency(total)}</span>
            </div>
            <button
              type="button"
              onClick={requestSale}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-[#0077B6] text-white py-3 rounded-xl font-bold hover:bg-[#023E8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                : <><CheckCircle size={16} /> Complete Sale</>}
            </button>
          </div>
        </div>
      </div>

      {showCustomerModal && (
        <CustomerInfoModal
          onConfirm={completeSale}
          onClose={() => setShowCustomerModal(false)}
          cart={cart}
          total={total}
          branchName={selectedBranch?.display_name ?? ""}
          paymentMethod={paymentMethod}
        />
      )}

      {completedSale && (
        <ReceiptModal
          receiptNumber={completedSale.receiptNumber}
          items={completedSale.items}
          total={completedSale.total}
          paymentMethod={completedSale.payment}
          staffName={staff?.full_name ?? ""}
          branchName={selectedBranch?.display_name ?? ""}
          branchLocation={selectedBranch?.location ?? ""}
          phone={phone}
          customerName={completedSale.customerName}
          customerPhone={completedSale.customerPhone}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
}
