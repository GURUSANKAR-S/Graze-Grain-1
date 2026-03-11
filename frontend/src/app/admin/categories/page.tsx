"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ApiSuccess, Category } from "@/types/api";

type CategoryForm = {
  name: string;
  displayOrder: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>({ name: "", displayOrder: 1 });

  async function fetchCategories() {
    const token = localStorage.getItem("accessToken") || "";
    const response = await apiFetch<ApiSuccess<Category[]>>("/categories/admin", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    setCategories(response.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  async function submitCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("accessToken") || "";
      const path = editingId ? `/categories/${editingId}` : "/categories";
      const method = editingId ? "PATCH" : "POST";
      await apiFetch<ApiSuccess<Category>>(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          display_order: form.displayOrder,
        }),
      });

      setEditingId(null);
      setForm({ name: "", displayOrder: 1 });
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  }

  async function toggleCategory(category: Category) {
    const token = localStorage.getItem("accessToken") || "";
    await apiFetch<ApiSuccess<Category>>(`/categories/${category.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_active: !category.is_active,
      }),
    });
    await fetchCategories();
  }

  async function deactivateCategory(categoryId: number) {
    const token = localStorage.getItem("accessToken") || "";
    await apiFetch<ApiSuccess<Category>>(`/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchCategories();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      displayOrder: category.display_order,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">Category Management</h1>

      <form onSubmit={submitCategory} className="glass-surface rounded-3xl p-5">
        <h2 className="mb-4 text-2xl font-semibold">
          {editingId ? "Edit Category" : "Create Category"}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Category name"
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <input
            type="number"
            min={1}
            value={form.displayOrder}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                displayOrder: Number(e.target.value),
              }))
            }
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2.5 font-semibold text-white transition hover:bg-[var(--brand-strong)]">
              {editingId ? "Update" : "Add Category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", displayOrder: 1 });
                }}
                className="rounded-xl border border-amber-900/20 px-4 py-2.5 font-semibold transition hover:bg-amber-100/70"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </form>

      {loading ? (
        <p className="text-[var(--muted)]">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="rounded-2xl border border-amber-900/15 bg-white/85 p-6 text-[var(--muted)]">
          No categories yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white/85">
          <table className="min-w-full">
            <thead className="bg-amber-100/60 text-left text-sm">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-amber-900/10">
                  <td className="px-4 py-3 font-semibold">{category.name}</td>
                  <td className="px-4 py-3">{category.display_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${category.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="rounded-lg border border-amber-900/20 px-3 py-1.5 text-sm font-semibold transition hover:bg-amber-100/70"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="rounded-lg border border-amber-900/20 px-3 py-1.5 text-sm font-semibold transition hover:bg-amber-100/70"
                      >
                        Toggle Active
                      </button>
                      <button
                        onClick={() => deactivateCategory(category.id)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
