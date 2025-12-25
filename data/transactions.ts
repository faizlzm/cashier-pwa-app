import { addDays, subHours, subMinutes } from "date-fns";

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
  category: "FOOD" | "DRINK";
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number;
  date: Date;
  status: "PAID" | "PENDING";
  paymentMethod: "CASH" | "QRIS";
}

const now = new Date();

export const transactions: Transaction[] = [
  {
    id: "TRX-001",
    items: [
      {
        name: "Nasi Goreng Special",
        quantity: 2,
        price: 25000,
        category: "FOOD",
      },
      { name: "Es Teh Manis", quantity: 2, price: 5000, category: "DRINK" },
    ],
    total: 60000,
    date: subMinutes(now, 15),
    status: "PAID",
    paymentMethod: "CASH",
  },
  {
    id: "TRX-002",
    items: [
      { name: "Mie Ayam Bakso", quantity: 1, price: 20000, category: "FOOD" },
      { name: "Kopi Susu", quantity: 1, price: 12000, category: "DRINK" },
    ],
    total: 32000,
    date: subHours(now, 1),
    status: "PAID",
    paymentMethod: "QRIS",
  },
  {
    id: "TRX-003",
    items: [{ name: "Soto Ayam", quantity: 1, price: 18000, category: "FOOD" }],
    total: 18000,
    date: subHours(now, 2),
    status: "PAID",
    paymentMethod: "CASH",
  },
  {
    id: "TRX-004",
    items: [
      { name: "Nasi Padang", quantity: 2, price: 23000, category: "FOOD" },
      { name: "Es Jeruk", quantity: 2, price: 7000, category: "DRINK" },
    ],
    total: 60000,
    date: subHours(now, 4),
    status: "PAID",
    paymentMethod: "CASH",
  },
  {
    id: "TRX-005",
    items: [
      { name: "Ayam Geprek", quantity: 1, price: 15000, category: "FOOD" },
    ],
    total: 15000,
    date: addDays(now, -1),
    status: "PAID",
    paymentMethod: "CASH",
  },
];
