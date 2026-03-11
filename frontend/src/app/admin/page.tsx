"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { ApiSuccess, Category, MenuItem } from "@/types/api";

interface Stats {
  totalItems: number;
  activeCategories: number;
  featuredItems: number;
}

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken") || "";
        const [categories, items] = await Promise.all([
          apiFetch<ApiSuccess<Category[]>>("/categories/admin", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          apiFetch<ApiSuccess<MenuItem[]>>("/menu-items/admin?limit=50&page=1", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
        ]);

        setStats({
          totalItems: items.meta?.total || items.data.length,
          activeCategories: categories.data.filter((c) => c.is_active).length,
          featuredItems: items.data.filter((i) => i.is_featured).length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Control Room</p>
        <h1 className="mt-2 text-4xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Welcome, {user?.email}</p>
      </div>
      <div className="glass-surface rounded-3xl p-8">
        <h2 className="mb-5 text-3xl font-semibold">Quick Stats</h2>
        {loading ? (
          <p className="text-[var(--muted)]">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-900/10 bg-gradient-to-br from-amber-50 to-amber-100/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Total Menu Items</h3>
              <p className="mt-2 text-4xl font-bold text-[var(--brand-strong)]">{stats?.totalItems || 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-900/10 bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800/80">Active Categories</h3>
              <p className="mt-2 text-4xl font-bold text-emerald-900">{stats?.activeCategories || 0}</p>
            </div>
            <div className="rounded-2xl border border-amber-900/10 bg-gradient-to-br from-rose-50 to-rose-100/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-800/80">Featured Items</h3>
              <p className="mt-2 text-4xl font-bold text-rose-900">{stats?.featuredItems || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
