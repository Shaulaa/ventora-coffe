const platforms = [
  { name: "GoFood", color: "#00AA13" },
  { name: "GrabFood", color: "#00B14F" },
  { name: "ShopeeFood", color: "#EE4D2D" },
];

export default function DeliveryBadges() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-center">
      <p className="eyebrow">Gak sempat mampir?</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
        Pesan online lewat
      </h3>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {platforms.map((p) => (
          <span
            key={p.name}
            className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-5 py-2.5 text-sm font-medium"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
              aria-hidden="true"
            />
            {p.name}
          </span>
        ))}
      </div>
    </section>
  );
}
