export type Product = {
  id: string;
  name: string;
  category: "Signature" | "Klasik" | "Non-Kopi" | "Camilan";
  price: number;
  rating: number;
  description: string;
  icon: string;
};

export const categories = ["Semua", "Signature", "Klasik", "Non-Kopi", "Camilan"] as const;

export const products: Product[] = [
  {
    id: "p1",
    name: "Aroma Gula Aren",
    category: "Signature",
    price: 25000,
    rating: 4.8,
    description: "Espresso, susu segar, gula aren rumahan.",
    icon: "☕",
  },
  {
    id: "p2",
    name: "Kopi Susu Klasik",
    category: "Klasik",
    price: 20000,
    rating: 4.6,
    description: "Racikan sederhana yang selalu jadi favorit.",
    icon: "🥛",
  },
  {
    id: "p3",
    name: "Americano Dingin",
    category: "Klasik",
    price: 18000,
    rating: 4.5,
    description: "Espresso double shot, air dingin, tanpa gula.",
    icon: "🧊",
  },
  {
    id: "p4",
    name: "Matcha Latte",
    category: "Non-Kopi",
    price: 23000,
    rating: 4.7,
    description: "Matcha grade ceremonial, susu creamy.",
    icon: "🍵",
  },
  {
    id: "p5",
    name: "Croissant Almond",
    category: "Camilan",
    price: 22000,
    rating: 4.9,
    description: "Dipanggang tiap pagi, isian almond cream.",
    icon: "🥐",
  },
  {
    id: "p6",
    name: "Kopi Tubruk Aroma",
    category: "Signature",
    price: 17000,
    rating: 4.4,
    description: "Cara seduh tradisional, kopi robusta pilihan.",
    icon: "🫘",
  },
];

export function getRecommended(count = 3): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, count);
}
