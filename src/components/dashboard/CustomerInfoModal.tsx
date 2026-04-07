"use client";
import { useState, FormEvent } from "react";
import { User, Phone, X, ArrowRight } from "lucide-react";

interface CustomerInfoModalProps {
  onConfirm: (name: string, phone: string) => void;
  onClose: () => void;
}

export default function CustomerInfoModal({ onConfirm, onClose }: CustomerInfoModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConfirm(name.trim(), phone.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-playfair font-bold text-[#023E8A] text-lg">Customer Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">Optional — skip to proceed without</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Customer Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Akua Mensah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
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
              onClick={() => onConfirm("", "")}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0077B6] text-white text-sm font-bold hover:bg-[#023E8A] transition-colors flex items-center justify-center gap-2"
            >
              Confirm <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
