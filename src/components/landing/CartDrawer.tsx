"use client";
import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2, Send } from "lucide-react";
import { getCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import SupabaseImage from "@/components/shared/SupabaseImage";

interface CartDrawerProps {
  whatsappPhone?: string;
  branchId?: string;
  branchName?: string;
  storageKey?: string;
}

function toWhatsAppNumber(phone: string): string {
  const clean = phone.replace(/\s+/g, "");
  if (clean.startsWith("+")) return clean.slice(1);
  if (clean.startsWith("0")) return "233" + clean.slice(1);
  return clean;
}

export default function CartDrawer({
  whatsappPhone = "0594299293",
  branchId,
  branchName,
  storageKey = "main",
}: CartDrawerProps) {
  const useStore = getCartStore(storageKey);
  const items = useStore((s) => s.items);
  const removeItem = useStore((s) => s.removeItem);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const clearCart = useStore((s) => s.clearCart);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  function buildWhatsAppMessage(): string {
    const separator = "------------------------------";
    const branchLine = branchName ? `Branch        : ${branchName}` : null;
    const itemLines = items.map(
      (i) => `${i.name}\n   Qty: ${i.quantity}   Subtotal: ${formatCurrency(i.price * i.quantity)}`
    );
    const lines = [
      "NEW ORDER - Daddy SoSo Closet",
      separator,
      ...(branchLine ? [branchLine] : []),
      `Customer Name : ${form.name}`,
      `Phone Number  : ${form.phone}`,
      `Location      : ${form.location}`,
      separator,
      "ITEMS ORDERED:",
      "",
      ...itemLines,
      "",
      separator,
      `TOTAL         : ${formatCurrency(total)}`,
      separator,
    ];
    return encodeURIComponent(lines.join("\n"));
  }

  async function handleSendOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.location.trim()) {
      setError("Please fill in all fields before sending.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError("");
    setSubmitting(true);

    // Deduct branch inventory if branchId is provided
    if (branchId) {
      try {
        await fetch("/api/branch-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branchId,
            items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          }),
        });
      } catch {
        // Non-fatal — order still goes to WhatsApp even if deduction fails
      }
    }

    const number = toWhatsAppNumber(whatsappPhone);
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
    clearCart();
    setForm({ name: "", phone: "", location: "" });
    setSubmitting(false);
    setOpen(false);
  }

  return (
    <>
      {/* Floating cart button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#2C1A0E] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#8B5E3C] transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart size={22} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C4954A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-[#2C1A0E]">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={18} />
            <div>
              <span className="font-playfair font-bold text-lg">Your Cart</span>
              {branchName && (
                <p className="text-white/60 text-xs leading-none mt-0.5">{branchName}</p>
              )}
            </div>
            {count > 0 && (
              <span className="bg-[#C4954A] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            title="Close cart"
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-stone-400">
              <ShoppingCart size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs mt-1">Browse products and add items to get started.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  {item.image_url ? (
                    <SupabaseImage
                      src={item.image_url}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart size={20} className="text-stone-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2C1A0E] leading-snug truncate">{item.name}</p>
                  <p className="text-xs text-[#8B5E3C] font-medium mt-0.5">{formatCurrency(item.price)}</p>
                  {item.max_quantity !== undefined && (
                    <p className="text-xs text-stone-400 mt-0.5">{item.max_quantity} in stock</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      title="Decrease quantity"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      title="Increase quantity"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.max_quantity !== undefined && item.quantity >= item.max_quantity}
                      className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#2C1A0E]">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    title="Remove item"
                    onClick={() => removeItem(item.product_id)}
                    className="mt-1 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-5 py-4 space-y-4 bg-[#FAF8F5]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-600">Total</span>
              <span className="text-xl font-bold text-[#2C1A0E]">{formatCurrency(total)}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Your Details</p>
              {[
                { key: "name", label: "Full Name", placeholder: "e.g. Akua Mensah", type: "text" },
                { key: "phone", label: "Phone Number", placeholder: "e.g. 0201234567", type: "tel" },
                { key: "location", label: "Location / Address", placeholder: "e.g. Koforidua, Eastern Region", type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#C4954A] focus:outline-none bg-white"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleSendOrder}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Sending..." : "Send Order via WhatsApp"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
