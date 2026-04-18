"use client";
import { useState, FormEvent } from "react";
import { User, Phone, X, ArrowRight, ArrowLeft, CheckCircle, ShoppingCart } from "lucide-react";
import type { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CustomerInfoModalProps {
  onConfirm: (name: string, phone: string) => void;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  branchName: string;
  paymentMethod: string;
}

export default function CustomerInfoModal({ onConfirm, onClose, cart, total, branchName, paymentMethod }: CustomerInfoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const PAY_LABEL: Record<string, string> = { cash: "Cash", momo: "MoMo", card: "Card" };

  function handleStep1(e: FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleSkip() {
    setName("");
    setPhone("");
    setStep(2);
  }

  function handleConfirm() {
    onConfirm(name.trim(), phone.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-playfair font-bold text-[#023E8A] text-lg">
              {step === 1 ? "Customer Details" : "Confirm Sale"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 ? "Step 1 of 2 — optional" : "Step 2 of 2 — review before processing"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ── Step 1: Customer Info ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Customer Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Akua Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="e.g. 0241234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-bold hover:bg-[#023E8A] transition-colors flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* ── Step 2: Sale Summary + Confirm ── */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            {/* Branch + Payment */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-[#023E8A]">{branchName}</span>
              <span className="bg-[#0077B6]/10 text-[#0077B6] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {PAY_LABEL[paymentMethod] ?? paymentMethod}
              </span>
            </div>

            {/* Cart items */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <ShoppingCart size={12} /> Items ({cart.length})
              </div>
              <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#023E8A] shrink-0 ml-2">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#023E8A] text-white">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-base font-bold">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Customer info (if provided) */}
            {(name || phone) && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs space-y-0.5">
                <p className="font-semibold text-[#023E8A]">Customer</p>
                {name && <p className="text-gray-600">{name}</p>}
                {phone && <p className="text-gray-500">{phone}</p>}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-white text-sm font-bold hover:bg-[#b8941e] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} /> Confirm Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
