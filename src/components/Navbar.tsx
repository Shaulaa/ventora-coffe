"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "next-themes";
import { Sun, Moon, User, LogOut, ShoppingBag, Menu, X, ChevronLeft, ArrowLeft } from "lucide-react";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/reservasi", label: "Reservasi" },
  { href: "/pesanan", label: "Pesanan" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [themeAnimating, setThemeAnimating] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync theme state
  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  // Listen for add to cart event to trigger animation
  useEffect(() => {
    function handleAddToCart() {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    window.addEventListener("ventora:addToCart", handleAddToCart);
    return () => window.removeEventListener("ventora:addToCart", handleAddToCart);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when clicking on a link
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error("[Navbar] Sign out failed:", err);
    }
  };

  const handleThemeToggle = () => {
    setThemeAnimating(true);
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
    setTimeout(() => setThemeAnimating(false), 500);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-screen-xl items-center px-4 md:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/img/ventora-logo1.png"
            alt="Ventora Coffee"
            className="h-10 w-auto md:h-12"
          />
        </Link>

        {/* Center: Navigation Links - Desktop Only */}
        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg ${
                isActive(link.href)
                  ? "text-rust bg-rust/10"
                  : "text-foreground/60 hover:text-amber hover:bg-amber/5"
              }`}
            >
              {link.label.toUpperCase()}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-rust" />
              )}
            </Link>
          ))}
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right: Icons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={handleThemeToggle}
            aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 hover:bg-border-soft ${
              themeAnimating ? "scale-90" : ""
            } text-amber`}
          >
            <span
              className={`absolute transition-all duration-300 ${
                isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0"
              }`}
            >
              <Moon className="h-5 w-5" />
            </span>
            <span
              className={`absolute transition-all duration-300 ${
                !isDark
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            >
              <Sun className="h-5 w-5" />
            </span>
          </button>

          {/* Cart Icon */}
          <Link
            href="/keranjang"
            aria-label="Keranjang belanja"
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-border-soft ${
              cartBounce ? "cart-bounce" : ""
            } ${
              totalItems > 0
                ? "text-rust"
                : "text-foreground/60"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-paper">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* User Profile - Desktop Only */}
          <div className="hidden md:block" ref={profileRef}>
            {loading ? (
              <div className="h-10 w-10 rounded-lg bg-foreground/10 animate-pulse" />
            ) : !user ? (
              <Link
                href="/login"
                className="rounded-lg bg-rust px-5 py-2.5 text-sm font-semibold text-paper transition-all hover:bg-rust/90 hover:scale-105"
              >
                MASUK
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Profil"
                  aria-expanded={profileOpen}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-105 ${
                    profileOpen
                      ? "bg-rust text-paper"
                      : "bg-foreground/5 text-foreground/70 hover:bg-rust/20 hover:text-rust"
                  }`}
                >
                  <User className="h-5 w-5" />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-6 top-full mt-2 w-56 rounded-xl border border-border-soft bg-surface py-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-border-soft px-4 pb-3 mb-2">
                      <p className="font-medium truncate">{user.email}</p>
                      <p className="text-xs text-foreground/50 truncate">{user.uid.substring(0, 12)}...</p>
                    </div>

                    <Link
                      href="/pesanan"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-rust/10"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Pesanan Saya</span>
                    </Link>
                    <Link
                      href="/reservasi"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-rust/10"
                    >
                      <User className="h-4 w-4" />
                      <span>Reservasi Saya</span>
                    </Link>

                    <div className="border-t border-border-soft mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rust transition-colors hover:bg-rust/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Toggle - Mobile Only */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5 text-foreground/70 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer - Slide from right */}
      {open && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-border-soft bg-background shadow-2xl animate-in slide-in-from-right duration-300 md:hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border-soft px-4 py-4">
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-border-soft"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <img
                src="/img/ventora-logo1.png"
                alt="Ventora Coffee"
                className="h-6 w-auto"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "text-rust bg-rust/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {isActive(link.href) && (
                    <span className="h-2 w-2 rounded-full bg-rust" />
                  )}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="border-t border-border-soft p-4">
              {!user ? (
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-rust py-3 text-sm font-semibold text-paper transition-all hover:bg-rust/90"
                >
                  MASUK
                </Link>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-lg py-3 text-sm font-medium text-rust transition-all hover:bg-rust/10"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
