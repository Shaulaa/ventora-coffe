import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export type Promo = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

const promosCollection = collection(db, "promos");

/**
 * Ambil semua promo aktif
 */
export async function getActivePromos(): Promise<Promo[]> {
  try {
    const now = new Date();
    const q = query(
      promosCollection,
      where("isActive", "==", true),
      where("startDate", "<=", now),
      where("endDate", ">=", now),
      orderBy("startDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Promo[];
  } catch (error) {
    console.error("Error getting active promos:", error);
    return [];
  }
}

/**
 * Ambil semua promo (untuk admin)
 */
export async function getAllPromos(): Promise<Promo[]> {
  try {
    const q = query(
      promosCollection,
      orderBy("startDate", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Promo[];
  } catch (error) {
    console.error("Error getting all promos:", error);
    return [];
  }
}

/**
 * Ambil promo berdasarkan ID
 */
export async function getPromoById(id: string): Promise<Promo | null> {
  try {
    const snapshot = await getDocs(query(promosCollection, where("__name__", "==", id)));
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Promo;
  } catch (error) {
    console.error(`Error getting promo ${id}:`, error);
    return null;
  }
}
