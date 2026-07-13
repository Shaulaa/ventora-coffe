"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pola standar next-themes: baru render state tema setelah mount di client,
    // biar gak mismatch sama hasil server render (yang belum tau tema aktif).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16 rounded-full bg-border-soft/40" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      aria-pressed={isDark}
      className="relative flex h-9 w-16 items-center rounded-full border border-border-soft bg-surface px-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-amber text-xs transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
