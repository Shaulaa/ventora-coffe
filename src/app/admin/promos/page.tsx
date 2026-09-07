import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getAllPromos } from "@/lib/firestore-promos";

export default async function AdminPromos() {
  const promos = await getAllPromos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">Manajemen Promo</h2>
        <Link
          href="/admin/promos/new"
          className="inline-flex items-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-medium text-white hover:bg-rust/90 dark:bg-rust dark:hover:bg-rust/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Promo
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {promos.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border-soft p-12 text-center">
            <p className="text-foreground/60">Belum ada promo.</p>
          </div>
        ) : (
          promos.map((promo) => (
            <div
              key={promo.id}
              className="overflow-hidden rounded-2xl border border-border-soft bg-surface"
            >
              <div className="h-32 bg-paper-dim dark:bg-espresso-light">
                {promo.imageUrl ? (
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🎉
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg">{promo.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                  {promo.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      promo.isActive
                        ? "bg-sage/10 text-sage"
                        : "bg-gray/10 text-gray/60"
                    }`}
                  >
                    {promo.isActive ? "Aktif" : "Tidak Aktif"}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/promos/${promo.id}/edit`}
                      className="rounded-lg p-2 text-foreground/60 hover:bg-sage hover:text-white dark:hover:bg-sage"
                      aria-label="Edit promo"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      className="rounded-lg p-2 text-foreground/60 hover:bg-rust hover:text-white dark:hover:bg-rust"
                      aria-label="Hapus promo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
