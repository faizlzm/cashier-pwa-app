/**
 * @fileoverview Zustand store untuk manajemen keranjang belanja (cart)
 * Store ini menggunakan persist middleware untuk menyimpan data ke localStorage
 * @module store/cart
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "@/types/api";

/**
 * Representasi produk dalam keranjang
 * Berisi informasi dasar produk yang ditambahkan ke cart
 */
export interface CartProduct {
  /** ID unik produk */
  id: string;
  /** Nama produk */
  name: string;
  /** Harga per unit dalam Rupiah */
  price: number;
  /** Kategori produk (FOOD/DRINK) */
  category: Category;
  /** URL gambar produk (opsional) */
  image?: string;
}

/**
 * Item dalam keranjang belanja
 * Extends CartProduct dengan informasi jumlah
 */
export interface CartItem extends CartProduct {
  /** Jumlah item dalam keranjang */
  quantity: number;
}

/**
 * Interface untuk Cart Store
 * Berisi state dan actions untuk manipulasi keranjang
 */
interface CartState {
  /** Tarif pajak dalam persen (default 11) */
  taxRate: number;
  /** Mengatur tarif pajak */
  setTaxRate: (rate: number) => void;
  /** Daftar item dalam keranjang */
  items: CartItem[];
  /** Menambahkan produk ke keranjang (increment jika sudah ada) */
  addItem: (product: CartProduct) => void;
  /** Menghapus produk dari keranjang */
  removeItem: (productId: string) => void;
  /** Mengubah jumlah item (hapus jika quantity <= 0) */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Mengosongkan seluruh keranjang */
  clearCart: () => void;
  /** Menghitung subtotal (sebelum pajak dan diskon) */
  subtotal: () => number;
  /** Menghitung pajak (berdasarkan taxRate) */
  tax: () => number;
  /** Menghitung diskon (saat ini 0%) */
  discount: () => number;
  /** Menghitung total akhir (subtotal - diskon + pajak) */
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      taxRate: 11, // Default 11% if not set
      setTaxRate: (rate) => set({ taxRate: rate }),
      items: [],
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
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
            item.id === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      discount: () => get().subtotal() * 0.0, // 0% placeholder for now
      tax: () => (get().subtotal() - get().discount()) * (get().taxRate / 100),
      total: () => get().subtotal() - get().discount() + get().tax(),
    }),
    {
      name: "pos-cart-storage",
    },
  ),
);
