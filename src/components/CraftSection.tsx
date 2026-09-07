import { Sprout, Flame, HandHeart } from "lucide-react";

const crafts = [
  {
    icon: Sprout,
    title: "Biji lokal pilihan",
    body: "Kami kurasi biji dari petani Indonesia, disangrai dalam batch kecil biar karakternya kejaga.",
  },
  {
    icon: Flame,
    title: "Diseduh dengan sengaja",
    body: "Setiap cangkir ditakar rasio, suhu, dan waktunya. Bukan cepat, tapi konsisten.",
  },
  {
    icon: HandHeart,
    title: "Ruang buat semua",
    body: "Tempat yang tenang buat kerja, ngobrol, atau rehat, tanpa buru-buru diminta pergi.",
  },
];

export default function CraftSection() {
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">Tentang Ventora</p>
          <h2 className="mt-3 max-w-md font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Dari biji sampai cangkir, kami ambil waktu.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-foreground/70">
            Ventora bukan sekadar tempat beli kopi. Kami percaya kopi yang baik
            lahir dari proses yang sabar, dan disajikan di ruang yang bikin orang
            betah. Setiap detail, dari sangrai sampai musik, kami pilih.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {crafts.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="flex gap-5 rounded-2xl border border-border-soft bg-surface p-6"
            >
              <div className="flex flex-col items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-dim text-sage dark:bg-espresso">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-data text-xs text-foreground/40">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 leading-7 text-foreground/65">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
