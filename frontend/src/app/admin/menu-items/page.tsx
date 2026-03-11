"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { ApiSuccess, Category, MenuItem } from "@/types/api";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

type FormState = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  image: File | null;
};

const defaultForm: FormState = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_available: true,
  is_featured: false,
  image: null,
};

export default function MenuItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const limit = 12;

  const imagePreview = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image],
  );

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem("accessToken") || "";
    const response = await apiFetch<ApiSuccess<Category[]>>(
      "/categories/admin",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    setCategories(response.data);
  }, []);

  const fetchItems = useCallback(async (nextPage = page) => {
    const token = localStorage.getItem("accessToken") || "";
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(limit),
      sort_by: "created_at",
      order: "desc",
    });
    if (categoryFilter) params.set("category_id", categoryFilter);
    if (availabilityFilter) params.set("is_available", availabilityFilter);
    if (search.trim()) params.set("search", search.trim());

    const response = await apiFetch<ApiSuccess<MenuItem[]>>(
      `/menu-items/admin?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    setItems(response.data);
    setTotalPages(response.meta?.totalPages || 1);
  }, [availabilityFilter, categoryFilter, page, search]);

  useEffect(() => {
    fetchCategories().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed"),
    );
  }, [fetchCategories]);

  useEffect(() => {
    setLoading(true);
    fetchItems(page)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [fetchItems, page]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken") || "";
      const body = new FormData();
      body.set("name", form.name);
      body.set("description", form.description);
      body.set("price", form.price);
      body.set("category_id", form.category_id);
      body.set("is_available", String(form.is_available));
      body.set("is_featured", String(form.is_featured));
      if (form.image) body.set("image", form.image);

      const path = editingId ? `/menu-items/${editingId}` : "/menu-items";
      const method = editingId ? "PATCH" : "POST";
      await apiFetch<ApiSuccess<MenuItem>>(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      setForm(defaultForm);
      setEditingId(null);
      await fetchItems(1);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    const token = localStorage.getItem("accessToken") || "";
    await apiFetch<ApiSuccess<MenuItem>>(
      `/menu-items/${item.id}/availability`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: !item.is_available }),
      },
    );
    await fetchItems(page);
  }

  async function softDelete(itemId: number) {
    const token = localStorage.getItem("accessToken") || "";
    await apiFetch<ApiSuccess<MenuItem>>(`/menu-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchItems(page);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category_id: String(item.category_id),
      is_available: item.is_available,
      is_featured: item.is_featured,
      image: null,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu Item Management</h1>

      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-xl font-semibold">
          {editingId ? "Edit Item" : "Add Item"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="rounded border px-3 py-2"
            required
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Price"
            type="number"
            step="0.01"
            min="0.01"
            className="rounded border px-3 py-2"
            required
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded border px-3 py-2"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              setForm({
                ...form,
                image: e.target.files?.[0] || null,
              })
            }
            className="rounded border px-3 py-2"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="rounded border px-3 py-2 md:col-span-2"
            rows={3}
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) =>
                setForm({ ...form, is_available: e.target.checked })
              }
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm({ ...form, is_featured: e.target.checked })
              }
            />
            Featured
          </label>
        </div>
        {imagePreview && (
          <div className="mt-4">
            <p className="mb-2 text-sm">Image preview</p>
            <Image
              src={imagePreview}
              alt="Selected preview"
              width={160}
              height={110}
              unoptimized
              className="rounded border object-cover"
            />
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
              }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or description"
          className="rounded border px-3 py-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => {
            setAvailabilityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {loading ? (
        <p>Loading menu items...</p>
      ) : items.length === 0 ? (
        <p className="rounded border bg-white p-6 text-gray-600">
          No menu items.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={resolveImageUrl(item.image_url)}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.category?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3">{inr.format(item.price)}</td>
                  <td className="px-4 py-3">
                    {item.is_available ? "Available" : "Unavailable"}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleAvailability(item)}
                      role="switch"
                      aria-checked={item.is_available}
                      aria-label={`Toggle availability for ${item.name}`}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${
                        item.is_available
                          ? "border-emerald-500 bg-emerald-500/80"
                          : "border-stone-300 bg-stone-300/80"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          item.is_available ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => softDelete(item.id)}
                      className="rounded border px-2 py-1 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setPage(idx + 1)}
              className={`rounded px-3 py-1 ${idx + 1 === page ? "bg-black text-white" : "bg-gray-200"}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
