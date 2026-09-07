"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import type { FirestoreProduct } from "@/lib/firestore-products";
import type { ProductCustomization } from "@/context/CartContext";

interface ProductDetailModalProps {
  product: FirestoreProduct;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: FirestoreProduct, customization: ProductCustomization, qty: number) => void;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const SIZES = [
  { id: "small", label: "Small", price: 0 },
  { id: "medium", label: "Medium", price: 3000 },
  { id: "large", label: "Large", price: 6000 },
] as const;

const BEANS = [
  { id: "light", label: "Light Roast", desc: "Rasa asam fruity, body ringan" },
  { id: "medium", label: "Medium Roast", desc: "Balance, caramel, nutty" },
  { id: "dark", label: "Dark Roast", desc: "Rasa pahit strong, smoky" },
] as const;

const ICE_LEVELS = [
  { id: "normal", label: "Normal" },
  { id: "less", label: "Less Ice" },
  { id: "no", label: "No Ice" },
] as const;

const SUGAR_LEVELS = [
  { id: "normal", label: "Normal" },
  { id: "less", label: "Less Sugar" },
  { id: "no", label: "No Sugar" },
] as const;

const ADDITIONALS = [
  { id: "extra_shot", label: "Extra Shot", price: 5000 },
  { id: "vanilla_syrup", label: "Vanilla Syrup", price: 3000 },
  { id: "caramel_syrup", label: "Caramel Syrup", price: 3000 },
  { id: "hazelnut_syrup", label: "Hazelnut Syrup", price: 3000 },
  { id: "cream", label: "Extra Cream", price: 3000 },
  { id: "whipped_cream", label: "Whipped Cream", price: 3000 },
] as const;

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [beans, setBeans] = useState<"light" | "medium" | "dark">("medium");
  const [ice, setIce] = useState<"normal" | "less" | "no">("normal");
  const [sugar, setSugar] = useState<"normal" | "less" | "no">("normal");
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setSize("medium");
      setBeans("medium");
      setIce("normal");
      setSugar("normal");
      setSelectedAdditionals([]);
      setNotes("");
      setJustAdded(false);
    }
  }, [isOpen, product.id]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizePrice = SIZES.find((s) => s.id === size)?.price || 0;
  const additionalPrice = selectedAdditionals.reduce((total, id) => {
    const item = ADDITIONALS.find((a) => a.id === id);
    return total + (item?.price || 0);
  }, 0);
  const totalPrice = (product.price + sizePrice + additionalPrice) * qty;

  function toggleAdditional(id: string) {
    setSelectedAdditionals((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleAddToCart() {
    const customization: ProductCustomization = {
      size,
      beans,
      ice,
      sugar,
      additional: selectedAdditionals,
      notes: notes || undefined,
    };
    onAddToCart(product, customization, qty);
    setJustAdded(true);
    setTimeout(() => {
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface shadow-2xl">
        {/* Header with Image */}
        <div className="relative h-48 overflow-hidden rounded-t-3xl bg-paper-dim dark:bg-espresso-light">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl">{product.icon}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Product Info */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">{product.name}</h2>
              <p className="mt-1 text-sm text-foreground/60">{product.description}</p>
            </div>
            <span className="text-xl font-bold">{formatRupiah(product.price)}</span>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium">Ukuran</h3>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`flex flex-1 flex-col items-center rounded-xl border-2 py-3 transition-all ${
                    size === s.id
                      ? "border-rust bg-rust/5 text-rust"
                      : "border-border-soft hover:border-rust/50"
                  }`}
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="mt-1 text-xs opacity-60">
                    {s.price === 0 ? "Base" : `+${formatRupiah(s.price)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Beans Selection */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium">Jenis Biji</h3>
            <div className="space-y-2">
              {BEANS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBeans(b.id)}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                    beans === b.id
                      ? "border-rust bg-rust/5"
                      : "border-border-soft hover:border-rust/50"
                  }`}
                >
                  <div className="text-left">
                    <span className={`text-sm font-medium ${beans === b.id ? "text-rust" : ""}`}>
                      {b.label}
                    </span>
                    <p className="text-xs text-foreground/50">{b.desc}</p>
                  </div>
                  {beans === b.id && (
                    <Check className="h-5 w-5 text-rust" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ice & Sugar */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Es</h3>
              <div className="flex rounded-xl border border-border-soft">
                {ICE_LEVELS.map((i, idx) => (
                  <button
                    key={i.id}
                    onClick={() => setIce(i.id)}
                    className={`flex-1 py-2 text-xs font-medium transition-all first:rounded-l-xl last:rounded-r-xl ${
                      ice === i.id
                        ? "bg-rust text-paper"
                        : "hover:bg-rust/10"
                    }`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Gula</h3>
              <div className="flex rounded-xl border border-border-soft">
                {SUGAR_LEVELS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSugar(s.id)}
                    className={`flex-1 py-2 text-xs font-medium transition-all first:rounded-l-xl last:rounded-r-xl ${
                      sugar === s.id
                        ? "bg-rust text-paper"
                        : "hover:bg-rust/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium">Tambahan</h3>
            <div className="grid grid-cols-2 gap-2">
              {ADDITIONALS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleAdditional(a.id)}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-sm transition-all ${
                    selectedAdditionals.includes(a.id)
                      ? "border-rust bg-rust/5 text-rust"
                      : "border-border-soft hover:border-rust/50"
                  }`}
                >
                  <span>{a.label}</span>
                  <span className="text-xs opacity-60">+{formatRupiah(a.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium">Catatan</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: extra hot, kurang pahit..."
              className="w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-sm placeholder:text-foreground/30 focus:border-rust focus:outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-3 rounded-full border border-border-soft bg-background px-2 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-rust/10 disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-data font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-rust/10"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={justAdded}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-medium text-paper transition-all ${
                justAdded
                  ? "bg-sage"
                  : "bg-rust hover:bg-rust/90"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-5 w-5" />
                  Ditambahkan!
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Masukkan Keranjang
                </>
              )}
            </button>
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-amber/10 px-4 py-3">
            <span className="text-sm text-foreground/70">Total</span>
            <span className="font-display text-xl font-bold text-rust">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
