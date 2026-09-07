import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { getDocs, collection, query, orderBy, getDoc, doc } from "firebase/firestore";
import { RatingDisplay } from "@/components/Rating";

type AdminReview = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  productName: string;
};

async function getReviews(): Promise<AdminReview[]> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return [];

  try {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const reviews = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const productRef = doc(db, "products", data.productId);
        const productSnap = await getDoc(productRef);

        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          productName: productSnap.data()?.name || "Produk tidak ditemukan",
        } as AdminReview;
      })
    );
    return reviews;
  } catch (error) {
    console.error("Error getting reviews:", error);
    return [];
  }
}

export default async function AdminReviews() {
  const reviews = await getReviews();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Ulasan Pelanggan</h2>
        <p className="mt-2 text-foreground/70">
          Lihat semua review produk dari pelanggan.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface p-12 text-center">
            <p className="text-foreground/60">Belum ada ulasan.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-border-soft bg-surface p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg">{review.productName}</h3>
                    <span className="rounded-full bg-espresso/10 px-3 py-1 text-xs text-foreground/70 dark:bg-espresso/20 dark:text-foreground/60">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "short",
                      }).format(new Date(review.createdAt))}
                    </span>
                  </div>
                  <div className="mt-2">
                    <RatingDisplay rating={review.rating} />
                  </div>
                  <p className="mt-3 text-foreground/80">&ldquo;{review.comment}&rdquo;</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber/10 text-amber flex items-center justify-center dark:bg-amber/20">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
