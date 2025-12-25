export interface Product {
  id: string;
  name: string;
  price: number;
  category: "FOOD" | "DRINK";
  image?: string;
}

export const products: Product[] = [
  { id: "1", name: "Nasi Goreng Special", price: 25000, category: "FOOD" },
  { id: "2", name: "Mie Ayam Bakso", price: 20000, category: "FOOD" },
  { id: "3", name: "Soto Ayam", price: 18000, category: "FOOD" },
  { id: "4", name: "Bakso Sapi", price: 20000, category: "FOOD" },
  { id: "5", name: "Nasi Padang", price: 23000, category: "FOOD" },
  { id: "6", name: "Es Teh Manis", price: 5000, category: "DRINK" },
  { id: "7", name: "Es Jeruk", price: 7000, category: "DRINK" },
  { id: "8", name: "Kopi Susu", price: 12000, category: "DRINK" },
  { id: "9", name: "Air Mineral", price: 4000, category: "DRINK" },
  { id: "10", name: "Jus Alpukat", price: 15000, category: "DRINK" },
  { id: "11", name: "Ayam Geprek", price: 18000, category: "FOOD" },
  { id: "12", name: "Sate Ayam", price: 22000, category: "FOOD" },
];
