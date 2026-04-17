"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VisitorCartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  max_quantity?: number;
  image_url?: string;
}

interface CartState {
  items: VisitorCartItem[];
  addItem: (item: Omit<VisitorCartItem, "quantity">) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  clearCart: () => void;
}

type CartStore = ReturnType<typeof buildStore>;
const registry = new Map<string, CartStore>();

function buildStore(key: string) {
  return create<CartState>()(
    persist(
      (set) => ({
        items: [],
        addItem: (item) =>
          set((state) => {
            const max = item.max_quantity ?? 20;
            const existing = state.items.find((i) => i.product_id === item.product_id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product_id === item.product_id
                    ? { ...i, quantity: Math.min(i.quantity + 1, max) }
                    : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          }),
        removeItem: (product_id) =>
          set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) })),
        updateQuantity: (product_id, quantity) =>
          set((state) => ({
            items:
              quantity <= 0
                ? state.items.filter((i) => i.product_id !== product_id)
                : state.items.map((i) => {
                    if (i.product_id !== product_id) return i;
                    return { ...i, quantity: Math.min(quantity, i.max_quantity ?? 20) };
                  }),
          })),
        clearCart: () => set({ items: [] }),
      }),
      { name: `dsc-cart-${key}` }
    )
  );
}

export function getCartStore(key = "main"): CartStore {
  if (!registry.has(key)) registry.set(key, buildStore(key));
  return registry.get(key)!;
}

// Default export kept for the main page cart
export const useCartStore = getCartStore("main");
