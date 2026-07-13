"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/dummy-products";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  icon: string;
  qty: number;
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
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  orders: Order[];
  checkout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "ventora_cart";
const ORDERS_KEY = "ventora_orders";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedOrders = localStorage.getItem(ORDERS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {
      // localStorage gak tersedia atau data korup, biarin kosong
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  function addItem(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          icon: product.icon,
          qty: 1,
        },
      ];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  function checkout() {
    if (items.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items,
      total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
      status: "diproses",
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
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
        checkout,
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
