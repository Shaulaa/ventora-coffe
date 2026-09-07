import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import type { Product } from "./dummy-products";
import type { FirestoreOrder } from "@/context/CartContext";
import type { Reservation } from "./firestore-reservations";
import type { Promo } from "./firestore-promos";

// ==========================================
// PRODUCTS ADMIN
// ==========================================

export async function getProductsAdmin(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export async function createProduct(data: Omit<Product, "id">): Promise<string | null> {
  try {
    const timestamp = serverTimestamp();
    const docRef = await addDoc(collection(db, "products"), {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<boolean> {
  try {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
}

// ==========================================
// ORDERS ADMIN
// ==========================================

export async function getAllOrders(): Promise<FirestoreOrder[]> {
  try {
    const snapshot = await getDocs(collection(db, "orders"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as FirestoreOrder[];
  } catch (error) {
    console.error("Error getting all orders:", error);
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: FirestoreOrder["status"]
): Promise<boolean> {
  try {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    return false;
  }
}

// ==========================================
// RESERVATIONS ADMIN
// ==========================================

export async function getAllReservations(): Promise<Reservation[]> {
  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Reservation[];
  } catch (error) {
    console.error("Error getting all reservations:", error);
    return [];
  }
}

export async function updateReservationStatus(
  id: string,
  status: Reservation["status"]
): Promise<boolean> {
  try {
    const docRef = doc(db, "reservations", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating reservation ${id}:`, error);
    return false;
  }
}

// ==========================================
// PROMOS ADMIN
// ==========================================

export async function getAllPromosAdmin(): Promise<Promo[]> {
  try {
    const snapshot = await getDocs(collection(db, "promos"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Promo[];
  } catch (error) {
    console.error("Error getting all promos:", error);
    return [];
  }
}

export async function createPromo(data: Omit<Promo, "id" | "createdAt">): Promise<string | null> {
  try {
    const timestamp = serverTimestamp();
    const docRef = await addDoc(collection(db, "promos"), {
      ...data,
      createdAt: timestamp,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating promo:", error);
    return null;
  }
}

export async function updatePromo(
  id: string,
  data: Partial<Promo>
): Promise<boolean> {
  try {
    const docRef = doc(db, "promos", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating promo ${id}:`, error);
    return false;
  }
}

export async function deletePromo(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "promos", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting promo ${id}:`, error);
    return false;
  }
}

// ==========================================
// REVIEWS ADMIN
// ==========================================

type ReviewData = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
};

export async function getAllReviews(): Promise<ReviewData[]> {
  try {
    const snapshot = await getDocs(collection(db, "reviews"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ReviewData[];
  } catch (error) {
    console.error("Error getting all reviews:", error);
    return [];
  }
}

// ==========================================
// USERS ADMIN
// ==========================================

type UserData = {
  id: string;
  email: string;
  role: "admin" | "customer";
  createdAt?: Date;
  updatedAt?: Date;
};

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserData[];
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "customer"
): Promise<boolean> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      role,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating user role ${userId}:`, error);
    return false;
  }
}
