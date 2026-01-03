"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";
import type {
  Product,
  ProductFilters,
  CreateTransactionRequest,
  Transaction,
  Category,
} from "@/types/api";

// Database schema
interface CashierDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: {
      "by-category": Category;
      "by-name": string;
    };
  };
  pendingTransactions: {
    key: string;
    value: {
      id: string;
      data: CreateTransactionRequest;
      createdAt: string;
      status: "pending" | "syncing" | "failed";
      retryCount: number;
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: string | number;
      updatedAt: string;
    };
  };
}

const DB_NAME = "cashier-pwa-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<CashierDB> | null = null;

// Initialize database
async function getDB(): Promise<IDBPDatabase<CashierDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CashierDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", {
          keyPath: "id",
        });
        productStore.createIndex("by-category", "category");
        productStore.createIndex("by-name", "name");
      }

      // Pending transactions store
      if (!db.objectStoreNames.contains("pendingTransactions")) {
        db.createObjectStore("pendingTransactions", {
          keyPath: "id",
        });
      }

      // Metadata store (for cache timestamps, etc.)
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", {
          keyPath: "key",
        });
      }
    },
  });

  return dbInstance;
}

// ==================== PRODUCTS ====================

/**
 * Cache products to IndexedDB
 */
export async function cacheProducts(products: Product[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("products", "readwrite");

  // Clear existing products and add new ones
  await tx.objectStore("products").clear();

  for (const product of products) {
    await tx.objectStore("products").put(product);
  }

  await tx.done;

  // Update cache timestamp
  await setMetadata("products_cached_at", Date.now());
}

/**
 * Get cached products with optional filtering
 */
export async function getCachedProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  const db = await getDB();
  let products: Product[];

  if (filters?.category) {
    products = await db.getAllFromIndex(
      "products",
      "by-category",
      filters.category
    );
  } else {
    products = await db.getAll("products");
  }

  // Apply additional filters
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.isActive !== undefined) {
    products = products.filter((p) => p.isActive === filters.isActive);
  }

  return products;
}

/**
 * Check if products cache is valid (less than 24 hours old)
 */
export async function isProductsCacheValid(
  maxAgeMs: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  const cachedAt = await getMetadata<number>("products_cached_at");
  if (!cachedAt) return false;
  return Date.now() - cachedAt < maxAgeMs;
}

// ==================== TRANSACTIONS ====================

/**
 * Generate a local transaction code for offline transactions
 */
function generateLocalTransactionCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRX-${dateStr}-LOCAL-${random}`;
}

/**
 * Queue a transaction for later sync
 */
export async function queueTransaction(
  data: CreateTransactionRequest
): Promise<Transaction> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const pendingTx = {
    id,
    data,
    createdAt: now,
    status: "pending" as const,
    retryCount: 0,
  };

  await db.put("pendingTransactions", pendingTx);

  // Return a local transaction object for UI
  const localTransaction: Transaction = {
    id,
    transactionCode: generateLocalTransactionCode(),
    userId: "local",
    subtotal: data.subtotal,
    tax: data.tax,
    discount: data.discount || 0,
    total: data.total,
    status: "PENDING",
    paymentMethod: data.paymentMethod,
    createdAt: now,
    items: data.items.map((item, index) => ({
      id: `local-item-${index}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
    })),
  };

  return localTransaction;
}

/**
 * Get all pending transactions
 */
export async function getPendingTransactions(): Promise<
  Array<{
    id: string;
    data: CreateTransactionRequest;
    createdAt: string;
    status: "pending" | "syncing" | "failed";
    retryCount: number;
  }>
> {
  const db = await getDB();
  return db.getAll("pendingTransactions");
}

/**
 * Get count of pending transactions
 */
export async function getPendingTransactionCount(): Promise<number> {
  const db = await getDB();
  return db.count("pendingTransactions");
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  id: string,
  status: "pending" | "syncing" | "failed",
  incrementRetry = false
): Promise<void> {
  const db = await getDB();
  const tx = await db.get("pendingTransactions", id);
  if (tx) {
    tx.status = status;
    if (incrementRetry) {
      tx.retryCount += 1;
    }
    await db.put("pendingTransactions", tx);
  }
}

/**
 * Remove a synced transaction from the queue
 */
export async function removeTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("pendingTransactions", id);
}

/**
 * Clear all synced/failed transactions
 */
export async function clearSyncedTransactions(): Promise<void> {
  const db = await getDB();
  const all = await db.getAll("pendingTransactions");
  const tx = db.transaction("pendingTransactions", "readwrite");

  for (const item of all) {
    if (item.status !== "pending") {
      await tx.objectStore("pendingTransactions").delete(item.id);
    }
  }

  await tx.done;
}

// ==================== METADATA ====================

async function setMetadata(key: string, value: string | number): Promise<void> {
  const db = await getDB();
  await db.put("metadata", {
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
}

async function getMetadata<T extends string | number>(
  key: string
): Promise<T | null> {
  const db = await getDB();
  const item = await db.get("metadata", key);
  return item ? (item.value as T) : null;
}

// ==================== UTILITIES ====================

/**
 * Clear all offline data (for logout, etc.)
 */
export async function clearAllOfflineData(): Promise<void> {
  const db = await getDB();
  await db.clear("products");
  await db.clear("pendingTransactions");
  await db.clear("metadata");
}

/**
 * Get offline storage stats
 */
export async function getOfflineStats(): Promise<{
  productCount: number;
  pendingTransactionCount: number;
  cacheAge: number | null;
}> {
  const db = await getDB();
  const productCount = await db.count("products");
  const pendingTransactionCount = await db.count("pendingTransactions");
  const cachedAt = await getMetadata<number>("products_cached_at");

  return {
    productCount,
    pendingTransactionCount,
    cacheAge: cachedAt ? Date.now() - cachedAt : null,
  };
}
