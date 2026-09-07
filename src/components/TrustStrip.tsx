import { Star, Coffee, Clock, Leaf } from "lucide-react";

const stats = [
  { icon: Star, value: "4.8", label: "Rata-rata ulasan" },
  { icon: Coffee, value: "12", label: "Menu signature" },
  { icon: Clock, value: "08–22", label: "Buka tiap hari" },
  { icon: Leaf, value: "100%", label: "Biji lokal pilihan" },
];

export default function TrustStrip() {
  return (
    <div className="bg-surface py-8">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row">
          {stats.map(({ icon: Icon, value, label }, index) => (
            <div
              key={label}
              className={`flex flex-1 flex-col px-6 py-4 text-left md:px-8 md:py-6 ${
                index < stats.length - 1 ? "border-b border-border-soft md:border-b-0 md:border-r border-border-soft" : ""
              }`}
            >
              <Icon className="h-5 w-5 text-rust" aria-hidden="true" strokeWidth={1.5} />
              <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-espresso dark:text-paper md:text-4xl">
                {value}
              </p>
              <p className="mt-1 font-data text-[11px] uppercase tracking-[0.15em] text-foreground/50 dark:text-paper/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
