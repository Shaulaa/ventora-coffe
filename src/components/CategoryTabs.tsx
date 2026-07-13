"use client";

import { categories } from "@/lib/dummy-products";

type Category = (typeof categories)[number];

export default function CategoryTabs({
  active,
  onChange,
}: {
  active: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-rust bg-rust text-paper"
                : "border-border-soft bg-surface text-foreground/70 hover:border-amber"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
