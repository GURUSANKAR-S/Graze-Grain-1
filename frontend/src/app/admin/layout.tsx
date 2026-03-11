"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const AdminLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-[var(--muted)]">Loading...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-[var(--muted)]">Redirecting to login...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_15%_-10%,#ffdcb9_0%,transparent_35%),linear-gradient(180deg,#fff8ee_0%,#f5efe6_100%)]">
      <aside className="m-4 flex w-72 flex-col rounded-3xl border border-amber-900/10 bg-[#3f1f11] p-4 text-amber-50 shadow-[0_24px_45px_-30px_rgba(0,0,0,0.75)]">
        <div className="border-b border-amber-200/20 px-3 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Dashboard</p>
          <p className="mt-2 text-3xl font-semibold">Admin</p>
        </div>
        <nav className="mt-4 flex-grow space-y-1 text-sm font-semibold">
          <Link href="/admin" className="block rounded-xl px-3 py-2 transition hover:bg-amber-100/15">
            Overview
          </Link>
          <Link href="/admin/categories" className="block rounded-xl px-3 py-2 transition hover:bg-amber-100/15">
            Categories
          </Link>
          <Link href="/admin/menu-items" className="block rounded-xl px-3 py-2 transition hover:bg-amber-100/15">
            Menu Items
          </Link>
          <Link href="/admin/reservations" className="block rounded-xl px-3 py-2 transition hover:bg-amber-100/15">
            Reservations
          </Link>
        </nav>
        <div className="mt-2 border-t border-amber-200/20 pt-4">
          <p className="mb-3 truncate px-1 text-xs text-amber-100/80">{user.email}</p>
          <button
            onClick={logout}
            className="w-full rounded-xl bg-[#8f3a2a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#752f22]"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-grow p-4 md:p-8">{children}</main>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
