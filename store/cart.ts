import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "@/types/api";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  category: Category;
  image?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  discount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      discount: () => get().subtotal() * 0.0, // 0% placeholder for now
      tax: () => (get().subtotal() - get().discount()) * 0.11, // 11% PPN
      total: () => get().subtotal() - get().discount() + get().tax(),
    }),
    {
      name: "pos-cart-storage",
    }
  )
);
