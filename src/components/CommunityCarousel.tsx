const stories = [
  { initial: "R", name: "Rani", role: "Pekerja remote", note: "Ngopi tiap pagi sebelum kerja, deket dari kosan dan selalu konsisten rasanya." },
  { initial: "A", name: "Adit", role: "Mahasiswa", note: "Tempat nugas favorit. Wifi kenceng, colokan banyak, dan gak diusir walau lama." },
  { initial: "S", name: "Sari", role: "Pelanggan tetap", note: "Kopi susu gula arennya juara, manisnya pas, gak bikin enek." },
  { initial: "B", name: "Budi", role: "WFH enthusiast", note: "Sering pesan online pas WFH, dateng masih anget dan rapi." },
];

export default function CommunityCarousel() {
  return (
    <section className="border-y border-border-soft bg-paper-dim py-16 dark:bg-espresso-light">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center eyebrow">Kata mereka</p>
        <h3 className="mt-2 text-center font-serif text-2xl font-semibold tracking-tight md:text-3xl">
          Cerita dari pelanggan Ventora
        </h3>

        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {stories.map((s) => (
            <figure
              key={s.name}
              className="w-72 shrink-0 snap-start rounded-2xl border border-border-soft bg-surface p-6"
            >
              <blockquote className="font-serif text-lg leading-relaxed tracking-tight text-foreground/85">
                &ldquo;{s.note}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border-soft pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rust font-data text-sm text-paper">
                  {s.initial}
                </span>
                <span>
                  <span className="block text-sm font-medium">{s.name}</span>
                  <span className="block font-data text-[11px] uppercase tracking-[0.16em] text-foreground/50">
                    {s.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
