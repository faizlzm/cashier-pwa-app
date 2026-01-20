import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class names dengan dukungan Tailwind merge
 * @param inputs - Class names yang akan digabungkan
 * @returns String class names yang sudah digabungkan
 * @example
 * cn("px-4", "py-2", isActive && "bg-primary")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Menghasilkan inisial dari nama produk atau user
 * @param name - Nama yang akan diambil inisialnya
 * @returns String inisial (maksimal 2 karakter, uppercase)
 * @example
 * getInitials("Nasi Goreng") // "NG"
 * getInitials("Kopi") // "KO"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Menghasilkan warna konsisten berdasarkan nama produk
 * Warna dihitung dari hash nama sehingga produk yang sama selalu mendapat warna yang sama
 * @param name - Nama produk
 * @returns Object dengan properti bg (background color) dan text (text color) dalam format HSL
 * @example
 * const colors = getProductColor("Nasi Goreng");
 * // { bg: "hsl(150, 70%, 90%)", text: "hsl(150, 80%, 30%)" }
 */
export function getProductColor(name: string): { bg: string; text: string } {
  const hue =
    Math.abs(name.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % 360;
  return {
    bg: `hsl(${hue}, 70%, 90%)`,
    text: `hsl(${hue}, 80%, 30%)`,
  };
}

/**
 * Format angka ke format mata uang Rupiah Indonesia
 * @param amount - Jumlah yang akan diformat
 * @param showPrefix - Tampilkan prefix "Rp" (default: true)
 * @returns String format mata uang
 * @example
 * formatCurrency(15000) // "Rp 15.000"
 * formatCurrency(15000, false) // "15.000"
 */
export function formatCurrency(amount: number, showPrefix = true): string {
  const formatted = amount.toLocaleString("id-ID");
  return showPrefix ? `Rp ${formatted}` : formatted;
}
