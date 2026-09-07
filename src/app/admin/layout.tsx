"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  CalendarCheck,
  Tag,
  Star,
  Users,
  LogOut,
  Menu,
  X,
  Coffee,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pesanan", icon: ClipboardList },
  { href: "/admin/reservations", label: "Reservasi", icon: CalendarCheck },
  { href: "/admin/products", label: "Menu", icon: ShoppingBag },
  { href: "/admin/promos", label: "Promo", icon: Tag },
  { href: "/admin/reviews", label: "Ulasan", icon: Star },
  { href: "/admin/users", label: "User", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Coffee className="mx-auto h-12 w-12 animate-pulse text-rust" />
          <p className="mt-4 text-foreground/60">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border-soft bg-background px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-display text-lg">Ventora Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 hover:bg-border-soft"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border-soft bg-surface transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border-soft px-6 lg:h-20">
          <span className="text-3xl">☕</span>
          <div>
            <p className="font-display text-xl">Ventora</p>
            <p className="text-xs text-rust">Admin Panel</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-rust text-white"
                    : "text-foreground/70 hover:bg-border-soft"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-border-soft p-4">
          <div className="mb-4 rounded-xl bg-paper-dim p-3 dark:bg-espresso-light">
            <p className="text-xs text-foreground/60">Logged in as</p>
            <p className="truncate text-sm font-medium">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rust hover:bg-rust/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="h-full p-6">{children}</div>
      </main>
    </div>
  );
}
