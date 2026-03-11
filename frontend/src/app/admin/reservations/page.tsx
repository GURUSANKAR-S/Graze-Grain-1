"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ApiSuccess, Reservation } from "@/types/api";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReservations = useCallback(async (filter = statusFilter) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken") || "";
    const params = new URLSearchParams({
      page: "1",
      limit: "50",
    });
    if (filter) {
      params.set("status", filter);
    }

    const response = await apiFetch<ApiSuccess<Reservation[]>>(
      `/reservations?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    setReservations(response.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReservations()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [fetchReservations]);

  async function acknowledgeReservation(id: number) {
    const token = localStorage.getItem("accessToken") || "";
    await apiFetch<ApiSuccess<Reservation>>(`/reservations/${id}/acknowledge`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    await fetchReservations();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">Reservation Requests</h1>

      <div className="glass-surface rounded-3xl p-4">
        <label className="mr-2 text-sm font-semibold text-[var(--muted)]">
          Filter:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setLoading(true);
            setStatusFilter(e.target.value);
          }}
          className="rounded-xl border border-amber-900/15 bg-white/90 px-3 py-2 outline-none transition focus:border-[var(--brand)]"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-[var(--muted)]">Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p className="rounded-2xl border border-amber-900/15 bg-white/85 p-6 text-[var(--muted)]">
          No reservation requests yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-amber-900/15 bg-white/85">
          <table className="min-w-full">
            <thead className="bg-amber-100/60 text-left text-sm">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-amber-900/10">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{reservation.customer_name}</p>
                    {reservation.special_request && (
                      <p className="mt-1 max-w-xs text-xs text-[var(--muted)]">
                        {reservation.special_request}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.reservation_date} {reservation.reservation_time}
                  </td>
                  <td className="px-4 py-3">{reservation.guest_count}</td>
                  <td className="px-4 py-3">
                    <p>{reservation.phone}</p>
                    {reservation.email && (
                      <p className="text-xs text-[var(--muted)]">{reservation.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        reservation.status === "acknowledged"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {reservation.status === "pending" ? (
                      <button
                        onClick={() => acknowledgeReservation(reservation.id)}
                        className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">
                        Done
                      </span>
                    )}
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
