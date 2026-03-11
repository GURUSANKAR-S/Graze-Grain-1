"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ApiSuccess, Reservation } from "@/types/api";

type ReservationForm = {
  customer_name: string;
  phone: string;
  email: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_request: string;
};

const initialForm: ReservationForm = {
  customer_name: "",
  phone: "",
  email: "",
  reservation_date: "",
  reservation_time: "",
  guest_count: 2,
  special_request: "",
};

export default function ReservationsPage() {
  const [form, setForm] = useState<ReservationForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitReservation(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await apiFetch<ApiSuccess<Reservation>>("/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: form.customer_name,
          phone: form.phone,
          email: form.email || undefined,
          reservation_date: form.reservation_date,
          reservation_time: form.reservation_time,
          guest_count: form.guest_count,
          special_request: form.special_request || undefined,
        }),
      });

      setSuccess("Reservation request sent. Our team will acknowledge it soon.");
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit reservation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
          Reserve Your Table
        </p>
        <h1 className="mt-2 text-5xl font-semibold">Table Reservation</h1>
        <p className="mt-3 text-[var(--muted)]">
          Choose your date, time, and guest count. We will confirm your request from the admin dashboard.
        </p>
      </div>

      <form onSubmit={submitReservation} className="glass-surface rounded-3xl p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.customer_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customer_name: e.target.value }))
            }
            placeholder="Your name"
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <input
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Phone number"
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Email (optional)"
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
          />
          <input
            type="number"
            min={1}
            max={20}
            value={form.guest_count}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, guest_count: Number(e.target.value) }))
            }
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <input
            type="date"
            value={form.reservation_date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reservation_date: e.target.value }))
            }
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <input
            type="time"
            value={form.reservation_time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reservation_time: e.target.value }))
            }
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)]"
            required
          />
          <textarea
            value={form.special_request}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, special_request: e.target.value }))
            }
            placeholder="Special request (optional)"
            className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2.5 outline-none transition focus:border-[var(--brand)] md:col-span-2"
            rows={4}
          />
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-[var(--brand)] px-6 py-2.5 font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-70"
        >
          {saving ? "Submitting..." : "Submit Reservation"}
        </button>
      </form>
    </div>
  );
}
