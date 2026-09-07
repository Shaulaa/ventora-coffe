"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/dummy-products";
import type { FirestoreProduct } from "@/lib/firestore-products";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// Generate unique ID untuk cart item
function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Opsi kustomisasi produk
export type ProductCustomization = {
  size?: "small" | "medium" | "large";
  beans?: "light" | "medium" | "dark";
  ice?: "normal" | "less" | "no";
  sugar?: "normal" | "less" | "no";
  additional?: string[];
  notes?: string;
};

export type CartItem = {
  id: string; // Unique ID untuk cart item (bukan productId)
  productId: string;
  name: string;
  price: number;
  icon?: string;
  qty: number;
  customization?: ProductCustomization;
};

// Status pesanan:
// - menunggu_pembayaran: Sudah checkout, menunggu transfer/approval
// - sedang_diproses: Sudah lunas/approved, sedang dibuat
// - siap: Pesanan sudah siap untuk diambil/diantar
// - selesai: Pesanan sudah diambil/diantar
// - dibatalkan: Pesanan dibatalkan user atau admin
export type OrderStatus =
  | "menunggu_pembayaran"
  | "sedang_diproses"
  | "siap"
  | "selesai"
  | "dibatalkan";

export type FirestoreOrder = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  lastPaymentMethod?: string;
  notes?: string;
  orderId?: string;
  createdAt: Date;
  expiresAt?: Date;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: "diproses" | "siap" | "selesai";
  createdAt: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product | FirestoreProduct, customization?: ProductCustomization, qty?: number) => void;
  removeItem: (itemId: string) => void; // Gunakan id unik cart item
  updateQty: (itemId: string, qty: number) => void; // Gunakan id unik cart item
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  orders: Order[];
  firestoreOrders: FirestoreOrder[];
  loadOrders: () => Promise<void>;
  isLoading: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "ventora_cart";
const ORDERS_KEY = "ventora_orders";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<FirestoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load cart and orders from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedOrders = localStorage.getItem(ORDERS_KEY);
      if (savedCart) {
        const parsedItems: CartItem[] = JSON.parse(savedCart);
        // Migrasi: tambahkan id untuk item lama yang belum punya id
        const migratedItems = parsedItems.map((item) => ({
          ...item,
          id: item.id || generateCartItemId(),
        }));
        setItems(migratedItems);
      }
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {
      // localStorage gak tersedia atau data korup, biarin kosong
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Persist orders to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  // Real-time listener untuk orders dari Firestore
  useEffect(() => {
    if (!user) {
      setFirestoreOrders([]);
      return;
    }

    // Subscribe real-time. Sengaja TANPA orderBy biar gak butuh composite
    // index Firestore (kombinasi where + orderBy butuh index yang belum
    // tentu dibuat). Sorting dilakukan di JS di bawah.
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
              createdAt = data.createdAt.toDate();
            } else if (typeof data.createdAt === "string") {
              createdAt = new Date(data.createdAt);
            }
          }
          // Parse expiresAt
          let expiresAt: Date | undefined;
          if (data.expiresAt) {
            if (typeof data.expiresAt.toDate === "function") {
              expiresAt = data.expiresAt.toDate();
            } else if (typeof data.expiresAt === "string") {
              expiresAt = new Date(data.expiresAt);
            }
          }
          // Spread dulu, baru timpa id dengan document ID asli Firestore.
          return {
            ...data,
            id: doc.id,
            createdAt,
            expiresAt,
          };
        }) as FirestoreOrder[];
        // Catatan: order dengan status "dibatalkan" SENGAJA tetap ditampilkan
        // di sisi client (bukan disembunyiin), biar user tau pesanannya batal.

        // Sort terbaru dulu di sisi client
        loadedOrders.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        setFirestoreOrders(loadedOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error real-time orders:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Helper untuk cek apakah dua customization sama
  function isSameCustomization(a?: ProductCustomization, b?: ProductCustomization): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      a.size === b.size &&
      a.beans === b.beans &&
      a.ice === b.ice &&
      a.sugar === b.sugar &&
      JSON.stringify(a.additional?.sort()) === JSON.stringify(b.additional?.sort()) &&
      a.notes === b.notes
    );
  }

  function addItem(product: Product | FirestoreProduct, customization?: ProductCustomization, qty: number = 1) {
    setItems((prev) => {
      // Cek apakah ada item dengan productId dan customization yang sama
      const existingIndex = prev.findIndex((i) =>
        i.productId === product.id && isSameCustomization(i.customization, customization)
      );

      if (existingIndex !== -1) {
        // Item sudah ada dengan customization yang sama, update qty
        return prev.map((i, idx) =>
          idx === existingIndex ? { ...i, qty: i.qty + qty } : i
        );
      }

      // Item baru, tambahkan dengan qty yang diminta
      return [
        ...prev,
        {
          id: generateCartItemId(),
          productId: product.id,
          name: product.name,
          price: product.price,
          icon: product.icon,
          qty,
          customization,
        },
      ];
    });
    // Trigger animation event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ventora:addToCart", {
        detail: { productId: product.id }
      }));
    }
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function updateQty(itemId: string, qty: number) {
    if (qty <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  async function loadOrders() {
    // Only load orders if user is available
    if (!user) {
      setFirestoreOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      // Simple query without orderBy - sort in JavaScript instead
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const loadedOrders = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Handle both Timestamp (Firestore) and string ISO (localStorage fallback)
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
              // Firestore Timestamp
              createdAt = data.createdAt.toDate();
            } else if (typeof data.createdAt === "string") {
              // ISO string from localStorage
              createdAt = new Date(data.createdAt);
            }
          }
          return {
            id: doc.id,
            ...data,
            createdAt,
          };
        }) as FirestoreOrder[];

      setFirestoreOrders(loadedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        orders,
        firestoreOrders,
        loadOrders,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
