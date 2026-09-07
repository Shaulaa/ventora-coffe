import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export type Category = "Signature" | "Klasik" | "Non-Kopi" | "Makanan" | "Camilan";

export type FirestoreProduct = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  icon?: string;
  imageUrl?: string;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const productsCollection = collection(db, "products");

/**
 * Ambil semua produk dari Firestore
 */
export async function getProducts(): Promise<FirestoreProduct[]> {
  try {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as FirestoreProduct[];
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

/**
 * Ambil produk berdasarkan kategori
 */
export async function getProductsByCategory(
  category: Category
): Promise<FirestoreProduct[]> {
  try {
    const q = query(productsCollection, where("category", "==", category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as FirestoreProduct[];
  } catch (error) {
    console.error(`Error getting products by category ${category}:`, error);
    return [];
  }
}

/**
 * Ambil produk dengan rating tertinggi (untuk rekomendasi)
 */
export async function getRecommendedProducts(
  count = 3
): Promise<FirestoreProduct[]> {
  try {
    const q = query(
      productsCollection,
      orderBy("ratingAverage", "desc"),
      orderBy("ratingCount", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      }))
      .slice(0, count) as FirestoreProduct[];
  } catch (error) {
    console.error("Error getting recommended products:", error);
    return [];
  }
}

/**
 * Ambil satu produk berdasarkan ID
 */
export async function getProductById(id: string): Promise<FirestoreProduct | null> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as FirestoreProduct;
    }
    return null;
  } catch (error) {
    console.error(`Error getting product ${id}:`, error);
    return null;
  }
}

/**
 * Tambah produk baru (untuk admin)
 */
export async function createProduct(data: Omit<FirestoreProduct, "id" | "createdAt" | "updatedAt" | "ratingAverage" | "ratingCount">): Promise<string | null> {
  try {
    const timestamp = serverTimestamp();
    const docRef = await addDoc(productsCollection, {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      ratingAverage: 0,
      ratingCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
}

/**
 * Update produk (untuk admin)
 */
export async function updateProduct(
  id: string,
  data: Partial<Omit<FirestoreProduct, "id" | "createdAt">>
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

/**
 * Hapus produk (untuk admin)
 */
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

/**
 * Update rating produk setelah review baru
 */
export async function updateProductRating(
  productId: string,
  newRating: number
): Promise<boolean> {
  try {
    const product = await getProductById(productId);
    if (!product) return false;

    const { ratingAverage, ratingCount } = product;
    const newAverage = ((ratingAverage * ratingCount) + newRating) / (ratingCount + 1);

    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, {
      ratingAverage: newAverage,
      ratingCount: ratingCount + 1,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating rating for ${productId}:`, error);
    return false;
  }
}
