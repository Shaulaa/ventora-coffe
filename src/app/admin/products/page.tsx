import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { FirestoreProduct } from "@/lib/firestore-products";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

async function getProducts(): Promise<FirestoreProduct[]> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return [];

  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as FirestoreProduct;
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export default async function AdminProducts() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">Manajemen Produk</h2>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-medium text-white hover:bg-rust/90 dark:bg-rust dark:hover:bg-rust/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-espresso/5 text-foreground/70 dark:bg-espresso-light/50">
            <tr>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 font-medium">Harga</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/60">
                  Belum ada produk. Klik {`"Tambah Produk"`} untuk mulai.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-espresso/5 dark:hover:bg-espresso-light/5">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-amber/10 px-3 py-1 text-xs text-amber dark:bg-amber/20">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-data">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    {product.ratingAverage.toFixed(1)} ({product.ratingCount})
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg p-2 text-foreground/60 hover:bg-sage hover:text-white dark:hover:bg-sage"
                        aria-label="Edit produk"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        className="rounded-lg p-2 text-foreground/60 hover:bg-rust hover:text-white dark:hover:bg-rust"
                        aria-label="Hapus produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
