"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function ReviewForm({
  productId,
  productName,
  onSubmitted,
}: {
  productId: string;
  productName: string;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      setError("Mohon beri rating terlebih dahulu");
      return;
    }

    if (comment.trim().length < 5) {
      setError("Komentar terlalu pendek (min 5 karakter)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userId: "TODO: current user ID",
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setRating(0);
      setComment("");

      if (onSubmitted) {
        onSubmitted();
      }

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Gagal mengirim review. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-6 text-center dark:bg-sage/10 dark:border-sage/20">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white dark:bg-sage/50">
          <Send className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl text-sage dark:text-sage/90">
          Terima Kasih!
        </h3>
        <p className="mt-2 text-foreground/70">
          Review Anda telah berhasil dikirim.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-lg">Beri Ulasan</h3>
        <p className="text-sm text-foreground/60">
          Bagikan pengalaman Anda tentang {productName}
        </p>
      </div>

      <div className="space-y-3">
        <label className="font-body text-sm font-medium">Rating:</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rust/50 rounded-full"
              aria-label={`Beri ${star} bintang`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= rating
                    ? "fill-amber text-amber"
                    : "text-foreground/30 dark:text-foreground/50"
                }`}
              />
            </button>
          ))}
        </div>
        {error?.includes("rating") && (
          <p className="text-xs text-rust">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="font-body text-sm font-medium">
          Komentar:
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda..."
          rows={4}
          className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 font-body text-sm focus:border-rust/50 focus:outline-none focus:ring-1 focus:ring-rust/20 dark:border-border-soft/50 dark:bg-espresso"
        />
        <p className="text-xs text-foreground/50">
          {comment.length}/1000 karakter
        </p>
        {error?.includes("komentar") && (
          <p className="text-xs text-rust">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rust px-6 py-3 font-medium text-white transition-colors hover:bg-rust/90 disabled:opacity-50 dark:bg-rust dark:hover:bg-rust/90"
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Kirim Review
          </>
        )}
      </button>

      {error && !error.includes("rating") && !error.includes("komentar") && (
        <div className="rounded-xl bg-rust/10 p-4 text-rust dark:bg-rust/20 dark:border dark:border-rust/20">
          {error}
        </div>
      )}
    </form>
  );
}
