"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const MAX_RATING = 5;

export function RatingDisplay({
  rating,
  count,
  size = "md",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(MAX_RATING)].map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`h-${size === "sm" ? 3.5 : size === "md" ? 5 : 6} w-${
              size === "sm" ? 3.5 : size === "md" ? 5 : 6
            } ${
              filled
                ? "fill-amber text-amber"
                : "text-foreground/30 dark:text-foreground/50"
            }`}
          />
        );
      })}
      {count !== undefined && (
        <span className="ml-1 text-xs text-foreground/60">({count})</span>
      )}
    </div>
  );
}

export function RatingStars({
  rating,
  maxRating = MAX_RATING,
}: {
  rating: number;
  maxRating?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`h-3 w-3 ${
              filled
                ? "fill-amber text-amber"
                : "text-foreground/30 dark:text-foreground/50"
            }`}
          />
        );
      })}
    </div>
  );
}

export function RatingBar({
  rating,
  total,
  color = "bg-amber",
}: {
  rating: number;
  total: number;
  color?: string;
}) {
  const percentage = total > 0 ? (rating / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-4 font-data text-xs">{rating}</span>
      <div className="h-2 flex-1 rounded-full bg-foreground/10 dark:bg-foreground/20">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right font-data text-xs text-foreground/60">
        {total}
      </span>
    </div>
  );
}

export function RatingForm({
  onSubmit,
  label = "Beri rating:",
}: {
  onSubmit: (rating: number) => void;
  label?: string;
}) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  function handleRating(rating: number) {
    setSelectedRating(rating);
    onSubmit(rating);
  }

  return (
    <div className="space-y-3">
      <span className="font-body text-sm text-foreground/70">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleRating(rating)}
            onMouseEnter={() => setHoverRating(rating)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rust/50 rounded-full"
            aria-label={`Beri ${rating} bintang`}
          >
            <Star
              className={`h-8 w-8 ${
                rating <= (hoverRating || selectedRating)
                  ? "fill-amber text-amber"
                  : "text-foreground/30 dark:text-foreground/50"
              }`}
            />
          </button>
        ))}
      </div>
      {selectedRating > 0 && (
        <p className="text-xs text-rust">
          Terima kasih! Rating Anda telah dicatat.
        </p>
      )}
    </div>
  );
}
