import { Star, Coffee, Clock, Leaf } from "lucide-react";

const stats = [
  { icon: Star, value: "4.8", label: "Rata-rata ulasan" },
  { icon: Coffee, value: "12", label: "Menu signature" },
  { icon: Clock, value: "08–22", label: "Buka tiap hari" },
  { icon: Leaf, value: "100%", label: "Biji lokal pilihan" },
];

export default function TrustStrip() {
  return (
    <section className="border-b border-border-soft">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-6 md:grid-cols-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 px-4 py-8 text-center md:items-start md:text-left"
          >
            <Icon className="h-5 w-5 text-sage" aria-hidden="true" />
            <p className="mt-1 font-serif text-3xl font-semibold tracking-tight">
              {value}
            </p>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-foreground/55">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
