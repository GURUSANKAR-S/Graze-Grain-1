"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { ApiSuccess, Category, MenuItem } from "@/types/api";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  useEffect(() => {
    async function loadCategories() {
      const response = await apiFetch<ApiSuccess<Category[]>>("/categories", {
        cache: "no-store",
      });
      setCategories(response.data);
    }

    loadCategories().catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    async function loadMenuItems() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (selectedCategory) params.set("category_id", String(selectedCategory));
      if (search.trim()) params.set("search", search.trim());

      try {
        const response = await apiFetch<ApiSuccess<MenuItem[]>>(
          `/menu-items?${params.toString()}`,
          { cache: "no-store" },
        );
        setItems(response.data);
        setTotalPages(response.meta?.totalPages || 1);
      } finally {
        setLoading(false);
      }
    }

    loadMenuItems().catch(() => {
      setItems([]);
      setTotalPages(1);
      setLoading(false);
    });
  }, [selectedCategory, search, page]);

  const selectedCategoryName = useMemo(
    () => categories.find((category) => category.id === selectedCategory)?.name,
    [categories, selectedCategory],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-8 reveal-up">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Chef&apos;s Selection</p>
        <h1 className="mt-2 text-5xl font-semibold">Our Menu</h1>
      </div>

      <div className="glass-surface mb-8 rounded-3xl p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === null ? "bg-[var(--brand)] text-white" : "bg-amber-100/70 text-[var(--muted)] hover:bg-amber-200/70"}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.id ? "bg-[var(--brand)] text-white" : "bg-amber-100/70 text-[var(--muted)] hover:bg-amber-200/70"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or description"
          className="w-full rounded-xl border border-amber-900/15 bg-white/90 px-4 py-3 text-sm outline-none ring-0 transition focus:border-[var(--brand)] md:max-w-md"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: limit }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-2xl border border-amber-900/10 bg-white/80 p-4">
              <div className="h-40 w-full rounded-xl bg-amber-100" />
              <div className="mt-3 h-4 w-2/3 rounded bg-amber-100" />
              <div className="mt-2 h-4 w-full rounded bg-amber-50" />
              <div className="mt-2 h-4 w-1/3 rounded bg-amber-100" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-amber-900/15 bg-white/80 p-12 text-center text-[var(--muted)]">
          No items in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden rounded-2xl border border-amber-900/10 bg-[var(--surface)] shadow-[0_16px_35px_-30px_rgba(71,30,7,0.8)] transition hover:-translate-y-1 ${item.is_available ? "" : "opacity-70 grayscale"}`}
            >
              <div className="relative h-44 w-full bg-amber-50">
                <Image
                  src={resolveImageUrl(item.image_url)}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold leading-tight">{item.name}</h2>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${item.is_available ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-700"}`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="mb-3 text-sm text-[var(--muted)]">
                  {item.description || "No description provided."}
                </p>
                <p className="text-base font-bold text-[var(--brand-strong)]">{inr.format(item.price)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNo = idx + 1;
            return (
              <button
                key={pageNo}
                onClick={() => setPage(pageNo)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pageNo === page ? "bg-[var(--brand)] text-white" : "bg-amber-100/70 text-[var(--muted)] hover:bg-amber-200/70"}`}
              >
                {pageNo}
              </button>
            );
          })}
        </div>
      )}

      {!loading && selectedCategoryName && (
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Filtering by: {selectedCategoryName}
        </p>
      )}
    </div>
  );
}
